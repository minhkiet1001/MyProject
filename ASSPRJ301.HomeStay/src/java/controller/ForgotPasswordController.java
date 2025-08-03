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

@WebServlet(name = "ForgotPasswordController", urlPatterns = {"/forgotPassword"})
public class ForgotPasswordController extends HttpServlet {

    private static final String FORGOT_PASSWORD_PAGE = "forgot-password.jsp";
    private static final String LOGIN_PAGE = "login-regis.jsp";

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");

        try {
            String email = request.getParameter("email");
            request.setAttribute("email", email);

            if (email == null || email.trim().isEmpty()) {
                request.setAttribute("errorMessage", "Vui lòng nhập email!");
                request.getRequestDispatcher(FORGOT_PASSWORD_PAGE).forward(request, response);
                return;
            }

            UserDAO userDao = new UserDAO();
            UserDTO user = userDao.getUserByEmail(email);
            if (user == null) {
                request.setAttribute("errorMessage", "Email không tồn tại trong hệ thống!");
                request.getRequestDispatcher(FORGOT_PASSWORD_PAGE).forward(request, response);
                return;
            }

            // Tạo token đặt lại mật khẩu
            String token = UUID.randomUUID().toString();
            boolean tokenSaved = userDao.saveResetPasswordToken(user.getUserID(), token);
            if (!tokenSaved) {
                request.setAttribute("errorMessage", "Không thể tạo liên kết đặt lại mật khẩu. Vui lòng thử lại sau!");
                request.getRequestDispatcher(FORGOT_PASSWORD_PAGE).forward(request, response);
                return;
            }

            // Gửi email đặt lại mật khẩu
            boolean emailSent = EmailUtils.sendResetPasswordEmail(user.getGmail(), user.getFullName(), token);
            if (!emailSent) {
                request.setAttribute("errorMessage", "Không thể gửi email. Vui lòng thử lại sau!");
                request.getRequestDispatcher(FORGOT_PASSWORD_PAGE).forward(request, response);
                return;
            }

            request.setAttribute("successMessage", "Một email đã được gửi đến " + email + " với hướng dẫn đặt lại mật khẩu.");
            request.getRequestDispatcher(FORGOT_PASSWORD_PAGE).forward(request, response);

        } catch (Exception e) {
            log("Error in ForgotPasswordController: " + e.getMessage(), e);
            request.setAttribute("errorMessage", "Lỗi hệ thống, vui lòng thử lại sau!");
            request.getRequestDispatcher(FORGOT_PASSWORD_PAGE).forward(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher(FORGOT_PASSWORD_PAGE).forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }
}