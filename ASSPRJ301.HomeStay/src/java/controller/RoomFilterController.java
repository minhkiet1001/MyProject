package controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import dto.RoomDTO;
import dao.RoomDAO;
import javax.servlet.annotation.WebServlet;

@WebServlet("/RoomFilterServlet")
public class RoomFilterController extends HttpServlet {

    private static final int ITEMS_PER_PAGE = 6; // Đặt 6 homestay mỗi trang

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Thiết lập encoding
        response.setContentType("text/html;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Nhận tham số từ request
        String searchName = request.getParameter("searchName");
        String minPriceStr = request.getParameter("minPrice");
        String maxPriceStr = request.getParameter("maxPrice");
        String amenities = request.getParameter("amenities");
        String pageStr = request.getParameter("page");
        String getTotal = request.getParameter("getTotal");

        // Xử lý giá (nếu không nhập thì đặt giá trị mặc định)
        double minPrice = (minPriceStr != null && !minPriceStr.isEmpty()) ? Double.parseDouble(minPriceStr) : 0;
        double maxPrice = (maxPriceStr != null && !maxPriceStr.isEmpty()) ? Double.parseDouble(maxPriceStr) : Double.MAX_VALUE;

        // Xử lý trang hiện tại
        int page = 1;
        if (pageStr != null && !pageStr.isEmpty()) {
            try {
                page = Integer.parseInt(pageStr);
            } catch (NumberFormatException e) {
                page = 1; // Mặc định về trang 1 nếu tham số không hợp lệ
            }
        }

        // Lấy danh sách phòng từ DAO
        RoomDAO roomDAO = new RoomDAO();
        List<RoomDTO> rooms;
        try {
            rooms = roomDAO.getFilteredRooms(searchName, minPrice, maxPrice, amenities);
        } catch (Exception e) {
            out.println("<p>Đã xảy ra lỗi khi lấy danh sách phòng: " + e.getMessage() + "</p>");
            out.close();
            return;
        }

        // Nếu chỉ cần lấy tổng số phòng (cho phân trang Ajax)
        if ("true".equals(getTotal)) {
            out.write(String.valueOf(rooms.size()));
            out.close();
            return;
        }

        // Tính toán phân trang
        int totalRooms = rooms.size();
        int totalPages = (int) Math.ceil((double) totalRooms / ITEMS_PER_PAGE);
        if (page < 1) {
            page = 1;
        }
        if (page > totalPages) {
            page = totalPages;
        }

        int start = (page - 1) * ITEMS_PER_PAGE;
        int end = Math.min(start + ITEMS_PER_PAGE, totalRooms);
        List<RoomDTO> roomsToShow = totalRooms > 0 ? rooms.subList(start, end) : rooms;

        // Trả về HTML cập nhật danh sách phòng
        for (RoomDTO room : roomsToShow) {
            out.println("<div class='room-item'>");
            out.println("<div class='room-content'>");
            out.println("<div class='room-image'>");
            out.println("<img src='" + room.getImageUrl() + "' alt='Hình ảnh phòng'>");
            out.println("</div>");
            out.println("<h3>" + room.getName() + "</h3>");
            out.println("<p><i class='fas fa-tag'></i> Khởi giá từ " + String.format("%,.0f", room.getPrice()) + " VND</p>");
            out.println("<p><i class='fas fa-wifi'></i> Tiện ích: " + (room.getAmenities() != null ? room.getAmenities() : "Chưa có tiện ích") + "</p>");
            out.println("<p><i class='fas fa-star'></i> Đánh giá: " + String.format("%.1f", room.getAverageRating()) + "/5 (" + room.getReviewCount() + " đánh giá)</p>");
            out.println("<button onclick='roomDetails(" + room.getId() + ")'>Xem chi tiết</button>");
            out.println("</div>");
            out.println("</div>");
        }

        out.close();
    }
}