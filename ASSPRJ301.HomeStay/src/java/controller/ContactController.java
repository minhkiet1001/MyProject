package controller;

import dao.ContactDAO;
import dao.NotificationDAO;
import dao.UserDAO;
import dto.ContactMessageDTO;
import dto.NotificationDTO;
import dto.UserDTO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.List;

@WebServlet(name = "ContactController", urlPatterns = {"/ContactController"})
public class ContactController extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");

        try {
            String userId = request.getParameter("userId");
            String fullName = request.getParameter("fullName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String message = request.getParameter("message");

            // Lưu tin nhắn vào bảng contact_messages
            ContactMessageDTO contactMessage = new ContactMessageDTO(0, userId, fullName, email, phone, message, new Timestamp(System.currentTimeMillis()), false);
            ContactDAO contactDAO = new ContactDAO();

            if (contactDAO.create(contactMessage)) {
                request.setAttribute("successMessage", "Tin nhắn đã được gửi thành công!");

                // Tạo thông báo
                NotificationDAO notificationDAO = new NotificationDAO();

                // 1. Thông báo cho người dùng
                if (userId != null && !userId.trim().isEmpty()) {
                    String userNotificationMessage = "Bạn vừa gửi một tin nhắn.";
                    NotificationDTO userNotification = new NotificationDTO(0, userId, userNotificationMessage, new Timestamp(System.currentTimeMillis()), false);
                    notificationDAO.addNotification(userNotification);
                }

                // 2. Thông báo cho tất cả Admin
                UserDAO userDAO = new UserDAO();
                List<UserDTO> admins = userDAO.getAllAdmins(); 
                String adminNotificationMessage = "Bạn vừa nhận được một tin nhắn từ người dùng " + (userId != null && !userId.trim().isEmpty() ? userId : fullName) + ".";
                for (UserDTO admin : admins) {
                    NotificationDTO adminNotification = new NotificationDTO(0, admin.getUserID(), adminNotificationMessage, new Timestamp(System.currentTimeMillis()), false);
                    notificationDAO.addNotification(adminNotification);
                }
            } else {
                request.setAttribute("errorMessage", "Gửi tin nhắn thất bại. Vui lòng thử lại!");
            }
        } catch (Exception e) {
            request.setAttribute("errorMessage", "Lỗi hệ thống: " + e.getMessage());
        }

        // Quay lại trang liên hệ
        request.getRequestDispatcher("contact.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }
}