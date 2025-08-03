package controller;

import dao.UserDAO;
import dto.UserDTO;
import java.io.IOException;
import java.util.UUID;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import utils.EmailUtils;
import utils.PasswordUtils;

@WebServlet(name = "RegisterController", urlPatterns = {"/register"})
public class RegisterController extends HttpServlet {

    private static final String LOGIN_PAGE = "login-regis.jsp";

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");

        try {
            String newUsername = request.getParameter("txtNewUsername").trim();
            String fullName = request.getParameter("txtFullName").trim();
            String newPassword = request.getParameter("txtNewPassword").trim();
            String confirmPassword = request.getParameter("txtConfirmPassword").trim();
            String gmail = request.getParameter("txtGmail") != null ? request.getParameter("txtGmail").trim() : "";
            String sdt = request.getParameter("txtSdt") != null ? request.getParameter("txtSdt").trim() : "";
            boolean hasError = false;

            UserDAO userDao = new UserDAO();

            // Kiểm tra lỗi
            if (newUsername.isEmpty()) {
                request.setAttribute("errorNewUsername", "Tên đăng nhập không được để trống.");
                hasError = true;
            }
            if (fullName.isEmpty()) {
                request.setAttribute("errorFullName", "Họ và tên không được để trống.");
                hasError = true;
            }
            if (newPassword.isEmpty()) {
                request.setAttribute("errorNewPassword", "Mật khẩu không được để trống.");
                hasError = true;
            } else if (newPassword.length() < 6) {
                request.setAttribute("errorNewPassword", "Mật khẩu phải có ít nhất 6 ký tự.");
                hasError = true;
            }
            if (!newPassword.equals(confirmPassword)) {
                request.setAttribute("errorConfirmPassword", "Mật khẩu xác nhận không khớp.");
                hasError = true;
            }
            if (gmail.isEmpty()) {
                request.setAttribute("errorGmail", "Email không được để trống.");
                hasError = true;
            } else if (!gmail.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                request.setAttribute("errorGmail", "Email không hợp lệ.");
                hasError = true;
            }
            if (!sdt.isEmpty() && !sdt.matches("^\\+?[0-9]{9,12}$")) {
                request.setAttribute("errorSdt", "Số điện thoại không hợp lệ (9-12 số).");
                hasError = true;
            }

            if (userDao.readById(newUsername) != null) {
                request.setAttribute("errorNewUsername", "Tên đăng nhập đã tồn tại.");
                hasError = true;
            }

            if (userDao.isEmailExists(gmail)) {
                request.setAttribute("errorGmail", "Email đã được sử dụng. Vui lòng chọn email khác!");
                hasError = true;
            }

            if (hasError) {
                request.setAttribute("showRegisterForm", true);
                request.getRequestDispatcher(LOGIN_PAGE).forward(request, response);
                return;
            }

            // Tạo token ngẫu nhiên
            String token = UUID.randomUUID().toString();

            // Tạo người dùng mới với token và isVerified = false
            UserDTO newUser = new UserDTO(newUsername, fullName, "US", newPassword, gmail, sdt, null, token, false);
            if (userDao.create(newUser)) {
                // Gửi email xác thực
                boolean emailSent = EmailUtils.sendVerificationEmail(gmail, fullName, token);
                if (emailSent) {
                    request.setAttribute("successMessage", "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
                } else {
                    request.setAttribute("successMessage", "Đăng ký thành công! Tuy nhiên, không thể gửi email xác thực.");
                    log("Failed to send verification email to: " + gmail);
                }
                request.setAttribute("showRegisterForm", false);
            } else {
                request.setAttribute("errorMessage", "Lỗi hệ thống, vui lòng thử lại!");
                request.setAttribute("showRegisterForm", true);
            }

            request.getRequestDispatcher(LOGIN_PAGE).forward(request, response);
        } catch (Exception e) {
            log("Error in RegisterController: " + e.getMessage(), e);
            request.setAttribute("errorMessage", "Lỗi hệ thống, vui lòng thử lại sau!");
            request.setAttribute("showRegisterForm", true);
            request.getRequestDispatcher(LOGIN_PAGE).forward(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    public String getServletInfo() {
        return "Handles user registration";
    }
}