package controller;

import dao.UserDAO;
import dto.UserDTO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import utils.PasswordUtils;

@WebServlet(name = "ChangePasswordServlet", urlPatterns = {"/changePassword"})
public class ChangePasswordController extends HttpServlet {

    private UserDAO userDAO = new UserDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession();
        UserDTO user = (UserDTO) session.getAttribute("user");

        // Kiểm tra đăng nhập
        if (user == null) {
            response.sendRedirect("login-regis.jsp");
            return;
        }

        // Lấy dữ liệu từ form
        String userId = request.getParameter("userId");
        String currentPassword = request.getParameter("currentPassword");
        String newPassword = request.getParameter("newPassword");
        String confirmPassword = request.getParameter("confirmPassword");

        // Kiểm tra dữ liệu đầu vào
        if (isEmpty(currentPassword) || isEmpty(newPassword) || isEmpty(confirmPassword)) {
            request.setAttribute("changePassError", "Vui lòng điền đầy đủ các trường.");
            request.getRequestDispatcher("/profile?section=security").forward(request, response);
            return;
        }

        // Lấy thông tin người dùng từ DB
        UserDTO dbUser = userDAO.readById(userId);
        if (dbUser == null || !PasswordUtils.checkPassword(currentPassword, dbUser.getPassword())) {
            request.setAttribute("errorCurrentPassword", "Mật khẩu hiện tại không đúng.");
            request.getRequestDispatcher("/profile?section=security").forward(request, response);
            return;
        }

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (!newPassword.equals(confirmPassword)) {
            request.setAttribute("errorConfirmPassword", "Mật khẩu mới và xác nhận không khớp.");
            request.getRequestDispatcher("/profile?section=security").forward(request, response);
            return;
        }

        // Kiểm tra độ dài tối thiểu của mật khẩu mới
        if (newPassword.length() < 6) {
            request.setAttribute("errorNewPassword", "Mật khẩu mới phải có ít nhất 6 ký tự.");
            request.getRequestDispatcher("/profile?section=security").forward(request, response);
            return;
        }

        // Cập nhật mật khẩu mới bằng phương thức updatePassword
        if (userDAO.updatePassword(userId, newPassword)) {
            // Cập nhật lại user trong session (lấy lại từ DB để đảm bảo đồng bộ)
            dbUser = userDAO.readById(userId);
            session.setAttribute("user", dbUser);
            request.setAttribute("changePassSuccess", "Đổi mật khẩu thành công!");
        } else {
            request.setAttribute("changePassError", "Đổi mật khẩu thất bại. Vui lòng thử lại.");
        }

        // Chuyển hướng về trang bảo mật
        request.getRequestDispatcher("/profile?section=security").forward(request, response);
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    @Override
    public String getServletInfo() {
        return "Change Password Servlet";
    }
}
