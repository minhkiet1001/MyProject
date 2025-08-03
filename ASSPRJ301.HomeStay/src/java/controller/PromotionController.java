package controller;

import dao.PromotionDAO;
import dto.PromotionDTO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

@WebServlet("/apply-promotion")
public class PromotionController extends HttpServlet {
    private PromotionDAO promotionDAO;

    @Override
    public void init() throws ServletException {
        promotionDAO = new PromotionDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // Lấy promoCode từ request
            String promoCode = request.getParameter("promoCode");
            if (promoCode == null || promoCode.trim().isEmpty()) {
                out.write("{\"success\": false, \"message\": \"Mã giảm giá không được để trống.\"}");
                return;
            }

            // Lấy thông tin mã giảm giá từ cơ sở dữ liệu
            PromotionDTO promotion = promotionDAO.getPromotionByCode(promoCode);
            if (promotion == null) {
                out.write("{\"success\": false, \"message\": \"Mã giảm giá không tồn tại.\"}");
                return;
            }

            // Kiểm tra ngày hiệu lực của mã giảm giá
            Date currentDate = new Date();
            if (promotion.getStartDate().after(currentDate) || promotion.getEndDate().before(currentDate)) {
                out.write("{\"success\": false, \"message\": \"Mã giảm giá không còn hiệu lực.\"}");
                return;
            }

            // Kiểm tra số lần sử dụng (nếu có giới hạn)
            if (promotion.getUsageLimit() != null && promotion.getUsageCount() >= promotion.getUsageLimit()) {
                out.write("{\"success\": false, \"message\": \"Mã giảm giá đã được sử dụng hết.\"}");
                return;
            }

            // Tính số tiền giảm
            double discountAmount = promotion.getDiscountAmount();
            if (promotion.getDiscountType().equals("PERCENTAGE")) {
                // Nếu là giảm theo phần trăm, cần lấy tổng tiền từ request
                String totalPriceStr = request.getParameter("totalPrice");
                if (totalPriceStr == null || totalPriceStr.trim().isEmpty()) {
                    out.write("{\"success\": false, \"message\": \"Tổng tiền không được để trống khi áp dụng mã giảm giá theo phần trăm.\"}");
                    return;
                }

                try {
                    double totalPrice = Double.parseDouble(totalPriceStr);
                    discountAmount = totalPrice * (discountAmount / 100); // Tính số tiền giảm
                } catch (NumberFormatException e) {
                    out.write("{\"success\": false, \"message\": \"Tổng tiền không hợp lệ.\"}");
                    return;
                }
            }

            // Trả về kết quả thành công
            out.write("{\"success\": true, \"discountAmount\": " + discountAmount + ", \"message\": \"Áp dụng mã giảm giá thành công!\"}");
        } catch (Exception e) {
            // Log lỗi để kiểm tra
            e.printStackTrace();
            out.write("{\"success\": false, \"message\": \"Lỗi server: " + e.getMessage() + "\"}");
        } finally {
            out.close(); // Đóng PrintWriter để giải phóng tài nguyên
        }
    }
}