package controller;

import dao.BookingDAO;
import dao.NotificationDAO;
import dao.UserDAO; // Thêm import để lấy danh sách admin
import dto.BookingDTO;
import dto.NotificationDTO;
import dto.UserDTO; // Thêm import để xử lý UserDTO
import java.io.IOException;
import java.util.List; // Thêm import để xử lý danh sách admin
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import utils.EmailUtils;

@WebServlet("/paymentResult")
public class PaymentResultController extends HttpServlet {

    private BookingDAO bookingDAO = new BookingDAO();
    private NotificationDAO notificationDAO = new NotificationDAO();
    private UserDAO userDAO = new UserDAO(); 

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String resultCode = request.getParameter("resultCode");
        String orderId = request.getParameter("orderId");
        String amount = request.getParameter("amount");

        if ("0".equals(resultCode)) { // Thanh toán thành công
            String bookingId = orderId.split("_")[0]; // Tách bookingId từ orderId
            try {
                int bookingIdInt = Integer.parseInt(bookingId);
                BookingDTO booking = bookingDAO.getBookingById(bookingIdInt);
                if (booking != null && BookingDAO.STATUS_PENDING_PAYMENT.equals(booking.getStatus())) {
                    // Cập nhật trạng thái booking thành "Paid"
                    bookingDAO.updateBookingStatus(bookingIdInt, BookingDAO.STATUS_PAID);

                    // Tạo thông báo cho người dùng
                    String userId = booking.getUser().getUserID();
                    String roomName = booking.getRoom() != null ? booking.getRoom().getName() : "Không xác định";
                    String message = "Thanh toán thành công cho đặt phòng '" + roomName + "' với số tiền "
                            + String.format("%,.0f", Double.parseDouble(amount)) + " VND.";
                    NotificationDTO userNotification = new NotificationDTO(0, userId, message, null, false);
                    notificationDAO.addNotification(userNotification);

                    // Gửi email thông báo thanh toán thành công cho người dùng
                    boolean emailSent = EmailUtils.sendPaymentSuccessEmail(
                            booking.getUser().getGmail(),
                            booking.getUser().getFullName(),
                            String.valueOf(bookingIdInt),
                            amount,
                            new java.util.Date().toString()
                    );
                    if (!emailSent) {
                        log("Failed to send payment success email to: " + booking.getUser().getGmail());
                    }

                    // Gửi thông báo cho tất cả admin
                    try {
                        List<UserDTO> admins = userDAO.getAllAdmins(); // Lấy danh sách admin
                        for (UserDTO admin : admins) {
                            String adminMessage = "Người dùng " + booking.getUser().getFullName() + " đã thanh toán thành công cho đặt phòng (ID: " + bookingIdInt + ") phòng '" + roomName + "' với số tiền " + String.format("%,.0f", Double.parseDouble(amount)) + " VND. Vui lòng xác nhận.";
                            NotificationDTO adminNotification = new NotificationDTO(0, admin.getUserID(), adminMessage, null, false);
                            notificationDAO.addNotification(adminNotification);
                        }
                    } catch (Exception e) {
                        log("Failed to send notification to admins: " + e.getMessage());
                    }

                    // Gửi thông báo thành công tới giao diện
                    request.setAttribute("message", "Thanh toán thành công cho đơn đặt phòng #" + bookingId);
                } else {
                    request.setAttribute("message", "Không tìm thấy đơn đặt phòng hoặc trạng thái không hợp lệ.");
                }
            } catch (NumberFormatException e) {
                e.printStackTrace();
                request.setAttribute("message", "Lỗi: ID đặt phòng không hợp lệ.");
            } catch (Exception e) {
                e.printStackTrace();
                request.setAttribute("message", "Lỗi khi cập nhật trạng thái thanh toán: " + e.getMessage());
            }
        } else {
            request.setAttribute("message", "Thanh toán thất bại. Mã lỗi: " + resultCode + ". Vui lòng thử lại.");
        }

        request.getRequestDispatcher("/payment-result.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response); // Xử lý POST giống GET để hỗ trợ IPN từ MoMo
    }
}