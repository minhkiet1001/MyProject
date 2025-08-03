package controller;

import dao.UserDAO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "VerifyController", urlPatterns = {"/verify"})
public class VerifyController extends HttpServlet {

    private static final String LOGIN_PAGE = "login-regis.jsp";

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");

        try {
            String token = request.getParameter("token");
            UserDAO userDao = new UserDAO();

            if (token != null && !token.trim().isEmpty()) {
                if (userDao.verifyUser(token)) {
                    request.setAttribute("successMessage", "Xác thực email thành công! Vui lòng đăng nhập.");
                } else {
                    request.setAttribute("errorMessage", "Token không hợp lệ hoặc đã hết hạn!");
                }
            } else {
                request.setAttribute("errorMessage", "Không tìm thấy token xác thực!");
            }

            request.getRequestDispatcher(LOGIN_PAGE).forward(request, response);
        } catch (Exception e) {
            log("Error in VerifyController: " + e.getMessage(), e);
            request.setAttribute("errorMessage", "Lỗi hệ thống, vui lòng thử lại sau!");
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
}