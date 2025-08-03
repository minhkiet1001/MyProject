package controller;

import dao.UserDAO;
import dto.UserDTO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import utils.PasswordUtils;

@WebServlet(name = "ResetPasswordController", urlPatterns = {"/resetPassword"})
public class ResetPasswordController extends HttpServlet {

    private static final String RESET_PASSWORD_PAGE = "reset-password.jsp";
    private static final String LOGIN_PAGE = "login-regis.jsp";

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String token = request.getParameter("token");
        if (token == null || token.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Liên kết không hợp lệ!");
            request.getRequestDispatcher(RESET_PASSWORD_PAGE).forward(request, response);
            return;
        }

        try {
            UserDAO userDao = new UserDAO();
            UserDTO user = userDao.validateResetPasswordToken(token);
            if (user == null) {
                request.setAttribute("errorMessage", "Liên kết không hợp lệ hoặc đã hết hạn!");
                request.getRequestDispatcher(RESET_PASSWORD_PAGE).forward(request, response);
                return;
            }

            request.setAttribute("token", token);
            request.getRequestDispatcher(RESET_PASSWORD_PAGE).forward(request, response);

        } catch (Exception e) {
            log("Error in ResetPasswordController (GET): " + e.getMessage(), e);
            request.setAttribute("errorMessage", "Lỗi hệ thống, vui lòng thử lại sau!");
            request.getRequestDispatcher(RESET_PASSWORD_PAGE).forward(request, response);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String token = request.getParameter("token");
        String newPassword = request.getParameter("newPassword");
        String confirmPassword = request.getParameter("confirmPassword");

        if (token == null || token.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Liên kết không hợp lệ!");
            request.getRequestDispatcher(RESET_PASSWORD_PAGE).forward(request, response);
            return;
        }

        if (!newPassword.equals(confirmPassword)) {
            request.setAttribute("errorMessage", "Mật khẩu xác nhận không khớp!");
            request.setAttribute("token", token);
            request.getRequestDispatcher(RESET_PASSWORD_PAGE).forward(request, response);
            return;
        }

        try {
            UserDAO userDao = new UserDAO();
            UserDTO user = userDao.validateResetPasswordToken(token);
            if (user == null) {
                request.setAttribute("errorMessage", "Liên kết không hợp lệ hoặc đã hết hạn!");
                request.getRequestDispatcher(RESET_PASSWORD_PAGE).forward(request, response);
                return;
            }

            // Cập nhật mật khẩu mới
            boolean passwordUpdated = userDao.updatePassword(user.getUserID(), newPassword);
            if (!passwordUpdated) {
                request.setAttribute("errorMessage", "Không thể cập nhật mật khẩu. Vui lòng thử lại sau!");
                request.setAttribute("token", token);
                request.getRequestDispatcher(RESET_PASSWORD_PAGE).forward(request, response);
                return;
            }

            // Xóa token sau khi sử dụng
            userDao.clearToken(user.getUserID());

            request.setAttribute("successMessage", "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập!");
            request.getRequestDispatcher(LOGIN_PAGE).forward(request, response);

        } catch (Exception e) {
            log("Error in ResetPasswordController (POST): " + e.getMessage(), e);
            request.setAttribute("errorMessage", "Lỗi hệ thống, vui lòng thử lại sau!");
            request.setAttribute("token", token);
            request.getRequestDispatcher(RESET_PASSWORD_PAGE).forward(request, response);
        }
    }
}