package controller;

import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns = {"/processPayment", "/ipn"})
public class ProcessPaymentController extends HttpServlet {

    private static final String PARTNER_CODE = "MOMOBKUN20180529";
    private static final String ACCESS_KEY = "klm05TvNBzhg7h7j";
    private static final String SECRET_KEY = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
    private static final String ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
    private static final String REDIRECT_URL = "http://localhost:8080/ASSPRJ301_F-Final_Last/paymentResult";
    private static final String IPN_URL = "http://localhost:8080/ASSPRJ301_F-Final_Last/ipn";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String path = request.getServletPath();
        switch (path) {
            case "/processPayment":
                processPaymentRequest(request, response);
                break;
            case "/ipn":
                handleIpnCallback(request, response);
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Action not supported");
                break;
        }
    }

    // Xử lý yêu cầu thanh toán (gửi đến MoMo)
    private void processPaymentRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String bookingId = request.getParameter("bookingId");
            if (bookingId == null || bookingId.isEmpty()) {
                throw new IllegalArgumentException("Booking ID is required");
            }

            String amountStr = request.getParameter("amount");
            if (amountStr == null || amountStr.isEmpty()) {
                throw new IllegalArgumentException("Amount is required");
            }
            long amount = (long) Double.parseDouble(amountStr);

            String requestId = UUID.randomUUID().toString();
            String orderId = bookingId + "_" + System.currentTimeMillis();
            String orderInfo = "Thanh toán đặt phòng #" + bookingId;
            String extraData = "";

            // Tạo rawData cho signature (không mã hóa URL)
            String rawData = "accessKey=" + ACCESS_KEY
                    + "&amount=" + amount
                    + "&extraData=" + extraData
                    + "&ipnUrl=" + IPN_URL
                    + "&orderId=" + orderId
                    + "&orderInfo=" + orderInfo
                    + "&partnerCode=" + PARTNER_CODE
                    + "&redirectUrl=" + REDIRECT_URL
                    + "&requestId=" + requestId
                    + "&requestType=captureWallet";

            String signature = HmacSHA256(rawData, SECRET_KEY);

            // Debug: In toàn bộ thông tin
            System.out.println("bookingId: " + bookingId);
            System.out.println("amount: " + amount);
            System.out.println("requestId: " + requestId);
            System.out.println("orderId: " + orderId);
            System.out.println("orderInfo: " + orderInfo);
            System.out.println("rawData: " + rawData);
            System.out.println("signature: " + signature);

            // Tạo JSON payload
            MoMoRequest moMoRequest = new MoMoRequest(
                    PARTNER_CODE, orderId, requestId, amount, orderInfo,
                    REDIRECT_URL, IPN_URL, "captureWallet", extraData, signature
            );
            String jsonPayload = new Gson().toJson(moMoRequest);
            System.out.println("jsonPayload: " + jsonPayload);

            String moMoResponse = sendPaymentRequest(jsonPayload);
            System.out.println("moMoResponse: " + moMoResponse);

            MoMoResponse responseObj = new Gson().fromJson(moMoResponse, MoMoResponse.class);
            response.sendRedirect(responseObj.getPayUrl());
        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Payment processing failed: " + e.getMessage());
        }
    }

    // Xử lý callback từ MoMo (IPN - Instant Payment Notification)
    private void handleIpnCallback(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Đọc dữ liệu từ request body
            StringBuilder jsonStr = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    jsonStr.append(line);
                }
            }

            // Parse JSON từ MoMo
            MoMoCallback callback = new Gson().fromJson(jsonStr.toString(), MoMoCallback.class);
            System.out.println("IPN Callback: " + jsonStr.toString());

            // Kiểm tra signature để đảm bảo tính xác thực
            String rawData = "partnerCode=" + callback.getPartnerCode()
                    + "&orderId=" + callback.getOrderId()
                    + "&requestId=" + callback.getRequestId()
                    + "&amount=" + callback.getAmount()
                    + "&orderInfo=" + callback.getOrderInfo()
                    + "&orderType=" + callback.getOrderType()
                    + "&transId=" + callback.getTransId()
                    + "&resultCode=" + callback.getResultCode()
                    + "&message=" + callback.getMessage()
                    + "&payType=" + callback.getPayType()
                    + "&responseTime=" + callback.getResponseTime()
                    + "&extraData=" + callback.getExtraData();
            String expectedSignature = HmacSHA256(rawData, SECRET_KEY);

            if (!expectedSignature.equals(callback.getSignature())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"message\": \"Invalid signature\"}");
                return;
            }

            // Phản hồi cho MoMo
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"message\": \"Success\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"Error processing IPN: " + e.getMessage() + "\"}");
        }
    }

    private String sendPaymentRequest(String jsonPayload) throws IOException {
        URL url = new URL(ENDPOINT);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        conn.setRequestProperty("Accept", "application/json");
        conn.setDoOutput(true);

        System.out.println("Sending request to MoMo: " + jsonPayload);
        try (DataOutputStream wr = new DataOutputStream(conn.getOutputStream())) {
            wr.write(jsonPayload.getBytes("UTF-8"));
            wr.flush();
        }

        int responseCode = conn.getResponseCode();
        if (responseCode != 200) {
            try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getErrorStream(), "UTF-8"))) {
                StringBuilder errorResponse = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    errorResponse.append(line);
                }
                throw new IOException("MoMo returned error " + responseCode + ": " + errorResponse.toString());
            }
        }

        try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"))) {
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            return response.toString();
        }
    }

    private String HmacSHA256(String data, String key) throws IOException {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA256"));
            byte[] result = mac.doFinal(data.getBytes("UTF-8"));
            return bytesToHex(result);
        } catch (Exception e) {
            throw new IOException("Error generating signature", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    // Class đại diện cho yêu cầu gửi đến MoMo
    public static class MoMoRequest {

        public String partnerCode;
        public String orderId;
        public String requestId;
        public long amount;
        public String orderInfo;
        public String redirectUrl;
        public String ipnUrl;
        public String requestType;
        public String extraData;
        public String signature;

        public MoMoRequest(String partnerCode, String orderId, String requestId, long amount, String orderInfo,
                String redirectUrl, String ipnUrl, String requestType, String extraData, String signature) {
            this.partnerCode = partnerCode;
            this.orderId = orderId;
            this.requestId = requestId;
            this.amount = amount;
            this.orderInfo = orderInfo;
            this.redirectUrl = redirectUrl;
            this.ipnUrl = ipnUrl;
            this.requestType = requestType;
            this.extraData = extraData;
            this.signature = signature;
        }
    }

    // Class đại diện cho phản hồi từ MoMo
    public static class MoMoResponse {

        private String payUrl;

        public String getPayUrl() {
            return payUrl;
        }
    }

    // Class đại diện cho callback từ MoMo
    public static class MoMoCallback {

        private String partnerCode;
        private String orderId;
        private String requestId;
        private long amount;
        private String orderInfo;
        private String orderType;
        private long transId;
        private int resultCode;
        private String message;
        private String payType;
        private long responseTime;
        private String extraData;
        private String signature;

        public String getPartnerCode() {
            return partnerCode;
        }

        public String getOrderId() {
            return orderId;
        }

        public String getRequestId() {
            return requestId;
        }

        public long getAmount() {
            return amount;
        }

        public String getOrderInfo() {
            return orderInfo;
        }

        public String getOrderType() {
            return orderType;
        }

        public long getTransId() {
            return transId;
        }

        public int getResultCode() {
            return resultCode;
        }

        public String getMessage() {
            return message;
        }

        public String getPayType() {
            return payType;
        }

        public long getResponseTime() {
            return responseTime;
        }

        public String getExtraData() {
            return extraData;
        }

        public String getSignature() {
            return signature;
        }
    }
}
