package controller;

import dao.ReviewDAO;
import dto.ReviewDTO;
import dto.UserDTO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "ReviewController", urlPatterns = {"/submit-review"})
public class ReviewController extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        HttpSession session = request.getSession();
        UserDTO user = (UserDTO) session.getAttribute("user");

        if (user == null) {
            response.sendRedirect("login-regis.jsp");
            return;
        }

        String roomIdStr = request.getParameter("roomId");
        String ratingStr = request.getParameter("rating");
        String comment = request.getParameter("comment");

        try {
            int roomId = Integer.parseInt(roomIdStr);
            float rating = Float.parseFloat(ratingStr);

            ReviewDTO review = new ReviewDTO();
            review.setRoomId(roomId);
            review.setUserId(user.getUserID());
            review.setRating(rating);
            review.setComment(comment);

            ReviewDAO reviewDAO = new ReviewDAO();
            if (reviewDAO.create(review)) {
                response.sendRedirect("room-details?roomId=" + roomId);
            } else {
                request.setAttribute("error", "Không thể gửi đánh giá. Vui lòng thử lại.");
                request.getRequestDispatcher("room-details.jsp").forward(request, response);
            }
        } catch (Exception e) {
            request.setAttribute("error", "Lỗi khi gửi đánh giá: " + e.getMessage());
            request.getRequestDispatcher("room-details.jsp").forward(request, response);
        }
    }
}
