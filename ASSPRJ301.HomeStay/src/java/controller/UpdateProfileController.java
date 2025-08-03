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

@WebServlet(name = "UpdateProfileController", urlPatterns = {"/updateProfile"})
public class UpdateProfileController extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        HttpSession session = request.getSession();
        UserDTO user = (UserDTO) session.getAttribute("user");

        if (user == null) {
            response.sendRedirect("login-regis.jsp");
            return;
        }

        // Lấy dữ liệu từ form
        String fullName = request.getParameter("fullName") != null ? request.getParameter("fullName").trim() : "";
        String gmail = request.getParameter("gmail") != null ? request.getParameter("gmail").trim() : "";
        String sdt = request.getParameter("sdt") != null ? request.getParameter("sdt").trim() : "";
        String avatarBase64 = request.getParameter("avatarUrl"); // Lấy base64 từ input hidden

        // Kiểm tra hợp lệ
        boolean hasError = false;
        if (fullName.isEmpty()) {
            request.setAttribute("errorFullName", "Họ và tên không được để trống.");
            hasError = true;
        }
        if (!gmail.isEmpty() && !gmail.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            request.setAttribute("errorGmail", "Email không hợp lệ.");
            hasError = true;
        }
        if (!sdt.isEmpty() && !sdt.matches("^\\+?[0-9]{9,12}$")) {
            request.setAttribute("errorSdt", "Số điện thoại không hợp lệ (9-12 số).");
            hasError = true;
        }

        // Xử lý avatar (base64)
        String avatarUrl = user.getAvatarUrl(); // Giữ URL cũ nếu không có ảnh mới
        if (avatarBase64 != null && !avatarBase64.trim().isEmpty() && !avatarBase64.equals(avatarUrl)) {
            avatarUrl = avatarBase64; // Chỉ cập nhật nếu base64 mới khác với hiện tại
        }

        // Nếu có lỗi, chuyển tiếp thay vì redirect
        if (hasError) {
            request.getRequestDispatcher("/profile?section=profile").forward(request, response);
            return;
        }

        // Cập nhật UserDTO
        user.setFullName(fullName);
        user.setGmail(gmail);
        user.setSdt(sdt);
        user.setAvatarUrl(avatarUrl);

        // Lưu vào cơ sở dữ liệu
        UserDAO userDAO = new UserDAO();
        try {
            if (userDAO.update(user)) {
                session.setAttribute("user", user); // Cập nhật session
                request.setAttribute("successMessage", "Cập nhật thông tin thành công!");
            } else {
                request.setAttribute("errorMessage", "Cập nhật thất bại, vui lòng thử lại.");
            }
        } catch (Exception e) {
            request.setAttribute("errorMessage", "Lỗi hệ thống khi cập nhật thông tin: " + e.getMessage());
        }

        // Chuyển tiếp về profile với section=profile
        request.getRequestDispatcher("/profile?section=profile").forward(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("/profile?section=profile").forward(request, response);
    }

    @Override
    public String getServletInfo() {
        return "Update Profile Controller";
    }
}