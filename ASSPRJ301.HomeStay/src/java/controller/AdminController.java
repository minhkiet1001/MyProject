package controller;

import dao.BookingDAO;
import dao.ContactDAO;
import dao.RoomDAO;
import dao.UserDAO;
import dao.NotificationDAO;
import dao.PromotionDAO;
import dto.BookingDTO;
import dto.ContactMessageDTO;
import dto.RoomDTO;
import dto.UserDTO;
import dto.NotificationDTO;
import dto.PromotionDTO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import utils.EmailUtils;

@WebServlet(name = "AdminController", urlPatterns = {
    "/admin/users", "/admin/rooms", "/admin/bookings", "/admin/statistics", "/admin/messages", "/admin/promotions"
})
public class AdminController extends HttpServlet {

    private static final String LOGIN_PAGE = "/login-regis.jsp";
    private static final String ADMIN_USERS_PAGE = "/admin/users.jsp";
    private static final String ADMIN_ROOMS_PAGE = "/admin/rooms.jsp";
    private static final String ADMIN_BOOKINGS_PAGE = "/admin/bookings.jsp";
    private static final String ADMIN_STATISTICS_PAGE = "/admin/statistics.jsp";
    private static final String ADMIN_MESSAGES_PAGE = "/admin/messages.jsp";
    private static final String ADMIN_PROMOTIONS_PAGE = "/admin/promotions.jsp";
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$";
    private static final String PHONE_PATTERN = "^\\+?[0-9]{9,12}$";
    private static final Logger LOGGER = Logger.getLogger(AdminController.class.getName());
    private final SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, Exception {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");

        HttpSession session = request.getSession();
        UserDTO user = (UserDTO) session.getAttribute("user");
        if (user == null || !"AD".equals(user.getRoleID())) {
            response.sendRedirect(request.getContextPath() + "/" + LOGIN_PAGE);
            return;
        }

        String path = request.getServletPath();
        String action = request.getParameter("action");

        if ("/admin/users".equals(path)) {
            UserDAO userDAO = new UserDAO();
            if (action == null || action.isEmpty()) {
                List<UserDTO> userList = userDAO.readAll();
                request.setAttribute("userList", userList);
                request.getRequestDispatcher(ADMIN_USERS_PAGE).forward(request, response);
            } else {
                switch (action) {
                    case "add":
                        if ("GET".equals(request.getMethod())) {
                            List<UserDTO> userList = userDAO.readAll();
                            request.setAttribute("userList", userList);
                            request.getRequestDispatcher(ADMIN_USERS_PAGE).forward(request, response);
                        } else if ("POST".equals(request.getMethod())) {
                            String userID = request.getParameter("userID");
                            String fullName = request.getParameter("fullName");
                            String roleID = request.getParameter("roleID");
                            String password = request.getParameter("password");
                            String gmail = request.getParameter("gmail");
                            String sdt = request.getParameter("sdt");

                            if (userID == null || userID.trim().isEmpty()) {
                                request.setAttribute("errorMessage", "ID không được để trống!");
                            } else if (fullName == null || fullName.trim().isEmpty()) {
                                request.setAttribute("errorMessage", "Họ tên không được để trống!");
                            } else if (password == null || password.trim().isEmpty()) {
                                request.setAttribute("errorMessage", "Mật khẩu không được để trống!");
                            } else if (password.length() < 6) {
                                request.setAttribute("errorMessage", "Mật khẩu phải có ít nhất 6 ký tự!");
                            } else if (userDAO.readById(userID) != null) {
                                request.setAttribute("errorMessage", "ID người dùng đã tồn tại!");
                            } else if (!"US".equals(roleID) && !"AD".equals(roleID)) {
                                request.setAttribute("errorMessage", "Vai trò không hợp lệ!");
                            } else if (gmail != null && !gmail.trim().isEmpty() && !Pattern.matches(EMAIL_PATTERN, gmail)) {
                                request.setAttribute("errorMessage", "Email không đúng định dạng!");
                            } else if (sdt != null && !sdt.trim().isEmpty() && !Pattern.matches(PHONE_PATTERN, sdt)) {
                                request.setAttribute("errorMessage", "Số điện thoại không đúng định dạng (9-12 số, có thể bắt đầu bằng +)!");
                            } else {
                                UserDTO newUser = new UserDTO(userID, fullName, roleID, password, gmail, sdt, gmail, roleID, true);
                                if (userDAO.create(newUser)) {
                                    request.setAttribute("successMessage", "Thêm người dùng thành công!");
                                } else {
                                    request.setAttribute("errorMessage", "Thêm người dùng thất bại!");
                                }
                            }

                            List<UserDTO> userList = userDAO.readAll();
                            request.setAttribute("userList", userList);
                            request.getRequestDispatcher(ADMIN_USERS_PAGE).forward(request, response);
                        }
                        break;

                    case "edit":
                        if ("GET".equals(request.getMethod())) {
                            String editUserID = request.getParameter("userID");
                            UserDTO editUser = userDAO.readById(editUserID);
                            if (editUser != null) {
                                request.setAttribute("editUser", editUser);
                            } else {
                                request.setAttribute("errorMessage", "Không tìm thấy người dùng để sửa!");
                            }
                            List<UserDTO> userList = userDAO.readAll();
                            request.setAttribute("userList", userList);
                            request.getRequestDispatcher(ADMIN_USERS_PAGE).forward(request, response);
                        } else if ("POST".equals(request.getMethod())) {
                            String userID = request.getParameter("userID");
                            String fullName = request.getParameter("fullName");
                            String roleID = request.getParameter("roleID");
                            String gmail = request.getParameter("gmail");
                            String sdt = request.getParameter("sdt");

                            UserDTO updatedUser = userDAO.readById(userID);
                            if (updatedUser != null) {
                                if (fullName == null || fullName.trim().isEmpty()) {
                                    request.setAttribute("errorMessage", "Họ tên không được để trống!");
                                } else if (!"US".equals(roleID) && !"AD".equals(roleID)) {
                                    request.setAttribute("errorMessage", "Vai trò không hợp lệ!");
                                } else if (gmail != null && !gmail.trim().isEmpty() && !Pattern.matches(EMAIL_PATTERN, gmail)) {
                                    request.setAttribute("errorMessage", "Email không đúng định dạng!");
                                } else if (sdt != null && !sdt.trim().isEmpty() && !Pattern.matches(PHONE_PATTERN, sdt)) {
                                    request.setAttribute("errorMessage", "Số điện thoại không đúng định dạng (9-12 số, có thể bắt đầu bằng +)!");
                                } else {
                                    updatedUser.setFullName(fullName);
                                    updatedUser.setRoleID(roleID);
                                    updatedUser.setGmail(gmail);
                                    updatedUser.setSdt(sdt);

                                    if (userDAO.update(updatedUser)) {
                                        request.setAttribute("successMessage", "Cập nhật người dùng thành công!");
                                    } else {
                                        request.setAttribute("errorMessage", "Cập nhật người dùng thất bại!");
                                    }
                                }
                            } else {
                                request.setAttribute("errorMessage", "Không tìm thấy người dùng để cập nhật!");
                            }

                            List<UserDTO> userList = userDAO.readAll();
                            request.setAttribute("userList", userList);
                            request.getRequestDispatcher(ADMIN_USERS_PAGE).forward(request, response);
                        }
                        break;

                    case "delete":
                        String deleteUserID = request.getParameter("userID");
                        BookingDAO bookingDAO = new BookingDAO();
                        List<BookingDTO> userBookings = bookingDAO.getBookingsByUserId(deleteUserID);

                        if (userDAO.readById(deleteUserID) != null) {
                            boolean canDelete = true;
                            StringBuilder errorMsg = new StringBuilder();
                            Date currentDate = new Date();

                            if (userBookings != null && !userBookings.isEmpty()) {
                                for (BookingDTO booking : userBookings) {
                                    if (!"Cancelled".equals(booking.getStatus()) && currentDate.before(booking.getCheckOutDate())) {
                                        canDelete = false;
                                        errorMsg.append("Có đặt phòng chưa hoàn tất (ID: ")
                                                .append(booking.getId()).append(") từ ")
                                                .append(sdf.format(booking.getCheckInDate())).append(" đến ")
                                                .append(sdf.format(booking.getCheckOutDate())).append(". ");
                                    }
                                }
                            }

                            if (canDelete) {
                                if (userDAO.delete(deleteUserID)) {
                                    request.setAttribute("successMessage", "Xóa người dùng thành công! Các đặt phòng và tin nhắn liên quan (nếu có) cũng đã được xóa.");
                                } else {
                                    request.setAttribute("errorMessage", "Xóa người dùng thất bại!");
                                }
                            } else {
                                request.setAttribute("errorMessage", "Không thể xóa người dùng vì: " + errorMsg.toString());
                            }
                        } else {
                            request.setAttribute("errorMessage", "Không tìm thấy người dùng để xóa!");
                        }

                        List<UserDTO> userList = userDAO.readAll();
                        request.setAttribute("userList", userList);
                        request.getRequestDispatcher(ADMIN_USERS_PAGE).forward(request, response);
                        break;

                    default:
                        response.sendError(HttpServletResponse.SC_NOT_FOUND, "Action not supported");
                        break;
                }
            }
        } else if ("/admin/rooms".equals(path)) {
            RoomDAO roomDAO = new RoomDAO();
            if (action == null || action.isEmpty()) {
                try {
                    List<RoomDTO> roomList = roomDAO.getAllRooms();
                    LOGGER.log(Level.INFO, "Retrieved {0} rooms from database", roomList.size());
                    request.setAttribute("roomList", roomList);
                    if (roomList.isEmpty()) {
                        request.setAttribute("errorMessage", "Không có phòng nào được tìm thấy trong cơ sở dữ liệu!");
                    }
                } catch (Exception e) {
                    LOGGER.log(Level.SEVERE, "Error retrieving rooms: " + e.getMessage(), e);
                    request.setAttribute("errorMessage", "Lỗi khi lấy danh sách phòng: " + e.getMessage());
                }
                request.getRequestDispatcher(ADMIN_ROOMS_PAGE).forward(request, response);
            } else {
                switch (action) {
                    case "add":
                        if ("GET".equals(request.getMethod())) {
                            List<RoomDTO> roomList = roomDAO.getAllRooms();
                            request.setAttribute("roomList", roomList);
                            request.getRequestDispatcher(ADMIN_ROOMS_PAGE).forward(request, response);
                        } else if ("POST".equals(request.getMethod())) {
                            String name = request.getParameter("name");
                            String description = request.getParameter("description");
                            String priceStr = request.getParameter("price");
                            String amenities = request.getParameter("amenities");
                            String imageUrl = request.getParameter("imageUrl");
                            String detailImagesStr = request.getParameter("detailImages");

                            try {
                                double price = priceStr != null && !priceStr.trim().isEmpty() ? Double.parseDouble(priceStr) : 0;
                                List<String> detailImages = detailImagesStr != null && !detailImagesStr.trim().isEmpty()
                                        ? Arrays.asList(detailImagesStr.split("\\r?\\n")) : new ArrayList<>();

                                if (name == null || name.trim().isEmpty()) {
                                    request.setAttribute("errorMessage", "Tên phòng không được để trống!");
                                } else if (price <= 0) {
                                    request.setAttribute("errorMessage", "Giá phòng phải lớn hơn 0!");
                                } else {
                                    RoomDTO newRoom = new RoomDTO(0, name, description, price, amenities, imageUrl, detailImages, 0.0, 0);
                                    if (roomDAO.create(newRoom)) {
                                        request.setAttribute("successMessage", "Thêm phòng thành công!");
                                    } else {
                                        request.setAttribute("errorMessage", "Thêm phòng thất bại!");
                                    }
                                }
                            } catch (NumberFormatException e) {
                                request.setAttribute("errorMessage", "Giá phải là số hợp lệ!");
                            } catch (Exception e) {
                                request.setAttribute("errorMessage", "Lỗi hệ thống khi thêm phòng: " + e.getMessage());
                            }

                            List<RoomDTO> roomList = roomDAO.getAllRooms();
                            request.setAttribute("roomList", roomList);
                            request.getRequestDispatcher(ADMIN_ROOMS_PAGE).forward(request, response);
                        }
                        break;

                    case "edit":
                        if ("GET".equals(request.getMethod())) {
                            String roomIdStr = request.getParameter("roomId");
                            try {
                                int roomId = Integer.parseInt(roomIdStr);
                                RoomDTO editRoom = roomDAO.getRoomById(roomId);
                                if (editRoom != null) {
                                    request.setAttribute("editRoom", editRoom);
                                } else {
                                    request.setAttribute("errorMessage", "Không tìm thấy phòng để sửa!");
                                }
                            } catch (NumberFormatException e) {
                                request.setAttribute("errorMessage", "ID phòng không hợp lệ!");
                            } catch (Exception e) {
                                request.setAttribute("errorMessage", "Lỗi hệ thống khi lấy thông tin phòng: " + e.getMessage());
                            }
                            List<RoomDTO> roomList = roomDAO.getAllRooms();
                            request.setAttribute("roomList", roomList);
                            request.getRequestDispatcher(ADMIN_ROOMS_PAGE).forward(request, response);
                        } else if ("POST".equals(request.getMethod())) {
                            String roomIdStr = request.getParameter("roomId");
                            String name = request.getParameter("name");
                            String description = request.getParameter("description");
                            String priceStr = request.getParameter("price");
                            String amenities = request.getParameter("amenities");
                            String imageUrl = request.getParameter("imageUrl");
                            String detailImagesStr = request.getParameter("detailImages");

                            try {
                                int roomId = Integer.parseInt(roomIdStr);
                                double price = priceStr != null && !priceStr.trim().isEmpty() ? Double.parseDouble(priceStr) : 0;
                                List<String> detailImages = detailImagesStr != null && !detailImagesStr.trim().isEmpty()
                                        ? Arrays.asList(detailImagesStr.split("\\r?\\n")) : new ArrayList<>();

                                RoomDTO updatedRoom = roomDAO.getRoomById(roomId);
                                if (updatedRoom != null) {
                                    if (name == null || name.trim().isEmpty()) {
                                        request.setAttribute("errorMessage", "Tên phòng không được để trống!");
                                    } else if (price <= 0) {
                                        request.setAttribute("errorMessage", "Giá phòng phải lớn hơn 0!");
                                    } else {
                                        updatedRoom.setName(name);
                                        updatedRoom.setDescription(description);
                                        updatedRoom.setPrice(price);
                                        updatedRoom.setAmenities(amenities);
                                        updatedRoom.setImageUrl(imageUrl);
                                        updatedRoom.setDetailImages(detailImages);

                                        if (roomDAO.update(updatedRoom)) {
                                            request.setAttribute("successMessage", "Cập nhật phòng thành công!");
                                        } else {
                                            request.setAttribute("errorMessage", "Cập nhật phòng thất bại!");
                                        }
                                    }
                                } else {
                                    request.setAttribute("errorMessage", "Không tìm thấy phòng để cập nhật!");
                                }
                            } catch (NumberFormatException e) {
                                request.setAttribute("errorMessage", "Giá phải là số hợp lệ!");
                            } catch (Exception e) {
                                request.setAttribute("errorMessage", "Lỗi hệ thống khi cập nhật phòng: " + e.getMessage());
                            }

                            List<RoomDTO> roomList = roomDAO.getAllRooms();
                            request.setAttribute("roomList", roomList);
                            request.getRequestDispatcher(ADMIN_ROOMS_PAGE).forward(request, response);
                        }
                        break;

                    case "delete":
                        String deleteRoomIdStr = request.getParameter("roomId");
                        BookingDAO bookingDAO = new BookingDAO();
                        try {
                            int deleteRoomId = Integer.parseInt(deleteRoomIdStr);
                            RoomDTO roomToDelete = roomDAO.getRoomById(deleteRoomId);
                            if (roomToDelete != null) {
                                boolean canDelete = true;
                                StringBuilder errorMsg = new StringBuilder();
                                Date currentDate = new Date();

                                List<BookingDTO> roomBookings = bookingDAO.getBookingsByRoomId(deleteRoomId);
                                if (roomBookings != null && !roomBookings.isEmpty()) {
                                    for (BookingDTO booking : roomBookings) {
                                        if (!"Cancelled".equals(booking.getStatus()) && currentDate.before(booking.getCheckOutDate())) {
                                            canDelete = false;
                                            errorMsg.append("Có đặt phòng chưa hoàn tất (ID: ")
                                                    .append(booking.getId()).append(") từ ")
                                                    .append(sdf.format(booking.getCheckInDate())).append(" đến ")
                                                    .append(sdf.format(booking.getCheckOutDate())).append(". ");
                                        }
                                    }
                                }

                                if (canDelete) {
                                    if (roomDAO.delete(deleteRoomId)) {
                                        request.setAttribute("successMessage", "Xóa phòng thành công! Các đặt phòng liên quan (nếu có) cũng đã được xóa.");
                                    } else {
                                        request.setAttribute("errorMessage", "Xóa phòng thất bại!");
                                    }
                                } else {
                                    request.setAttribute("errorMessage", "Không thể xóa phòng vì: " + errorMsg.toString());
                                }
                            } else {
                                request.setAttribute("errorMessage", "Không tìm thấy phòng để xóa!");
                            }
                        } catch (NumberFormatException e) {
                            request.setAttribute("errorMessage", "ID phòng không hợp lệ!");
                        } catch (Exception e) {
                            request.setAttribute("errorMessage", "Lỗi khi xóa phòng: " + e.getMessage());
                        }

                        List<RoomDTO> roomList = roomDAO.getAllRooms();
                        request.setAttribute("roomList", roomList);
                        request.getRequestDispatcher(ADMIN_ROOMS_PAGE).forward(request, response);
                        break;

                    default:
                        response.sendError(HttpServletResponse.SC_NOT_FOUND, "Action not supported");
                        break;
                }
            }
        } else if ("/admin/bookings".equals(path)) {
            BookingDAO bookingDAO = new BookingDAO();
            NotificationDAO notificationDAO = new NotificationDAO(); // Khởi tạo NotificationDAO
            if (action == null || action.isEmpty()) {
                try {
                    List<BookingDTO> bookingList = bookingDAO.getAllBookings();
                    LOGGER.log(Level.INFO, "Retrieved {0} bookings from database", bookingList.size());
                    request.setAttribute("bookingList", bookingList);
                    if (bookingList.isEmpty()) {
                        request.setAttribute("errorMessage", "Không có đặt phòng nào được tìm thấy trong cơ sở dữ liệu!");
                    }
                } catch (Exception e) {
                    LOGGER.log(Level.SEVERE, "Error retrieving bookings: " + e.getMessage(), e);
                    request.setAttribute("errorMessage", "Lỗi khi lấy danh sách đặt phòng: " + e.getMessage());
                }
                request.getRequestDispatcher(ADMIN_BOOKINGS_PAGE).forward(request, response);
            } else {
                switch (action) {
                    case "confirm":
                        String confirmBookingIdStr = request.getParameter("bookingId");
                        try {
                            int bookingId = Integer.parseInt(confirmBookingIdStr);
                            BookingDTO booking = bookingDAO.getBookingById(bookingId);
                            if (booking != null) {
                                if (BookingDAO.STATUS_PAID.equals(booking.getStatus())) {
                                    if (bookingDAO.updateBookingStatus(bookingId, BookingDAO.STATUS_CONFIRMED)) {
                                        // Gửi email thông báo xác nhận đặt phòng
                                        boolean emailSent = EmailUtils.sendAdminConfirmationEmail(
                                                booking.getUser().getGmail(),
                                                booking.getUser().getFullName(),
                                                String.valueOf(bookingId),
                                                booking.getRoom().getName(),
                                                sdf.format(booking.getCheckInDate()),
                                                sdf.format(booking.getCheckOutDate())
                                        );
                                        if (!emailSent) {
                                            LOGGER.log(Level.WARNING, "Failed to send confirmation email to: " + booking.getUser().getGmail());
                                        }

                                        // Gửi thông báo qua hệ thống cho người dùng
                                        String userMessage = "Đặt phòng '" + booking.getRoom().getName() + "' (ID: " + bookingId + ") của bạn đã được xác nhận từ "
                                                + sdf.format(booking.getCheckInDate()) + " đến " + sdf.format(booking.getCheckOutDate()) + ".";
                                        NotificationDTO userNotification = new NotificationDTO(0, booking.getUser().getUserID(), userMessage, null, false);
                                        notificationDAO.addNotification(userNotification);

                                        // Gửi thông báo qua hệ thống cho admin
                                        String adminMessage = "Bạn đã xác nhận đặt phòng (ID: " + bookingId + ") cho phòng '" + booking.getRoom().getName() + "'.";
                                        NotificationDTO adminNotification = new NotificationDTO(0, user.getUserID(), adminMessage, null, false);
                                        notificationDAO.addNotification(adminNotification);

                                        request.setAttribute("successMessage", "Xác nhận đặt phòng thành công!");
                                    } else {
                                        request.setAttribute("errorMessage", "Cập nhật trạng thái đặt phòng thất bại!");
                                    }
                                } else {
                                    request.setAttribute("errorMessage", "Chỉ có thể xác nhận đặt phòng đã thanh toán!");
                                }
                            } else {
                                request.setAttribute("errorMessage", "Không tìm thấy đặt phòng để xác nhận!");
                            }
                        } catch (NumberFormatException e) {
                            request.setAttribute("errorMessage", "ID đặt phòng không hợp lệ!");
                        } catch (Exception e) {
                            request.setAttribute("errorMessage", "Lỗi hệ thống khi xác nhận đặt phòng: " + e.getMessage());
                        }
                        redirectToBookingList(bookingDAO, request, response);
                        break;

                    case "cancel":
                        String cancelBookingIdStr = request.getParameter("bookingId");
                        try {
                            int bookingId = Integer.parseInt(cancelBookingIdStr);
                            BookingDTO booking = bookingDAO.getBookingById(bookingId);
                            if (booking != null) {
                                if (!BookingDAO.STATUS_CANCELLED.equals(booking.getStatus())) {
                                    if (bookingDAO.cancelBooking(bookingId)) {
                                        request.setAttribute("successMessage", "Hủy đặt phòng thành công!");
                                    } else {
                                        request.setAttribute("errorMessage", "Hủy đặt phòng thất bại!");
                                    }
                                } else {
                                    request.setAttribute("errorMessage", "Đặt phòng này đã bị hủy trước đó!");
                                }
                            } else {
                                request.setAttribute("errorMessage", "Không tìm thấy đặt phòng để hủy!");
                            }
                        } catch (NumberFormatException e) {
                            request.setAttribute("errorMessage", "ID đặt phòng không hợp lệ!");
                        } catch (Exception e) {
                            request.setAttribute("errorMessage", "Lỗi hệ thống khi hủy đặt phòng: " + e.getMessage());
                        }
                        redirectToBookingList(bookingDAO, request, response);
                        break;

                    case "delete":
                        String deleteBookingIdStr = request.getParameter("bookingId");
                        try {
                            int bookingId = Integer.parseInt(deleteBookingIdStr);
                            BookingDTO booking = bookingDAO.getBookingById(bookingId);
                            if (booking != null) {
                                Date currentDate = new Date();
                                if (currentDate.after(booking.getCheckOutDate()) || BookingDAO.STATUS_CANCELLED.equals(booking.getStatus())) {
                                    if (bookingDAO.delete(bookingId)) {
                                        request.setAttribute("successMessage", "Xóa đặt phòng thành công!");
                                    } else {
                                        request.setAttribute("errorMessage", "Xóa đặt phòng thất bại!");
                                    }
                                } else {
                                    request.setAttribute("errorMessage", "Không thể xóa đặt phòng (ID: " + bookingId + ") vì vẫn trong thời gian sử dụng từ "
                                            + sdf.format(booking.getCheckInDate()) + " đến " + sdf.format(booking.getCheckOutDate()) + "!");
                                }
                            } else {
                                request.setAttribute("errorMessage", "Không tìm thấy đặt phòng để xóa!");
                            }
                        } catch (NumberFormatException e) {
                            request.setAttribute("errorMessage", "ID đặt phòng không hợp lệ!");
                        } catch (Exception e) {
                            request.setAttribute("errorMessage", "Lỗi hệ thống khi xóa đặt phòng: " + e.getMessage());
                        }
                        redirectToBookingList(bookingDAO, request, response);
                        break;

                    default:
                        response.sendError(HttpServletResponse.SC_NOT_FOUND, "Action not supported");
                        break;
                }
            }
        } else if ("/admin/statistics".equals(path)) {
            BookingDAO bookingDAO = new BookingDAO();
            RoomDAO roomDAO = new RoomDAO();
            UserDAO userDAO = new UserDAO();
            try {
                List<BookingDTO> bookingList = bookingDAO.getAllBookings();
                Set<String> timeOptions = new HashSet<>();
                SimpleDateFormat sdfMonthYear = new SimpleDateFormat("yyyy-MM");
                for (BookingDTO booking : bookingList) {
                    String monthYear = sdfMonthYear.format(booking.getCreatedAt());
                    timeOptions.add(monthYear);
                }

                String startDateStr = request.getParameter("startDate");
                String endDateStr = request.getParameter("endDate");
                String timeFilter = request.getParameter("time");
                if (startDateStr != null && endDateStr != null && !startDateStr.isEmpty() && !endDateStr.isEmpty()) {
                    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                    Date startDate = dateFormat.parse(startDateStr);
                    Date endDate = dateFormat.parse(endDateStr);
                    bookingList = bookingDAO.getBookingsByDateRange(startDate, endDate);
                } else if (timeFilter != null && !timeFilter.equals("all")) {
                    List<BookingDTO> filteredList = new ArrayList<>();
                    for (BookingDTO booking : bookingList) {
                        String bookingMonthYear = sdfMonthYear.format(booking.getCreatedAt());
                        if (bookingMonthYear.equals(timeFilter)) {
                            filteredList.add(booking);
                        }
                    }
                    bookingList = filteredList;
                }

                if (bookingList == null) {
                    LOGGER.log(Level.WARNING, "Booking list is null");
                    bookingList = new ArrayList<>();
                }

                double totalRevenue = 0;
                int paidCount = 0, pendingCount = 0, cancelledCount = 0;
                Map<String, Integer> activeUsers = new HashMap<>();
                Map<Integer, Double> revenueByRoom = new HashMap<>();
                Map<Integer, Integer> roomBookingCount = new HashMap<>();
                Map<Integer, Integer> roomCancelCount = new HashMap<>();
                Map<String, Integer> userBookingCount = new HashMap<>();
                Map<String, Double> userTotalSpent = new HashMap<>();

                for (BookingDTO booking : bookingList) {
                    if (booking.getUser() == null || booking.getRoom() == null) {
                        LOGGER.log(Level.WARNING, "Booking ID {0} has null user or room", booking.getId());
                        continue;
                    }
                    String userId = booking.getUser().getUserID();
                    int roomId = booking.getRoom().getId();
                    switch (booking.getStatus()) {
                        case "PendingPayment":
                            pendingCount++;
                            roomBookingCount.put(roomId, roomBookingCount.getOrDefault(roomId, 0) + 1);
                            userBookingCount.put(userId, userBookingCount.getOrDefault(userId, 0) + 1);
                            break;
                        case "Paid":
                        case "Confirmed":
                            paidCount++;
                            totalRevenue += booking.getTotalPrice();
                            activeUsers.put(userId, 1);
                            revenueByRoom.put(roomId, revenueByRoom.getOrDefault(roomId, 0.0) + booking.getTotalPrice());
                            roomBookingCount.put(roomId, roomBookingCount.getOrDefault(roomId, 0) + 1);
                            userBookingCount.put(userId, userBookingCount.getOrDefault(userId, 0) + 1);
                            userTotalSpent.put(userId, userTotalSpent.getOrDefault(userId, 0.0) + booking.getTotalPrice());
                            break;
                        case "Cancelled":
                            cancelledCount++;
                            roomCancelCount.put(roomId, roomCancelCount.getOrDefault(roomId, 0) + 1);
                            userBookingCount.put(userId, userBookingCount.getOrDefault(userId, 0) + 1);
                            break;
                    }
                }

                int mostBookedRoomId = -1;
                int maxBookings = 0;
                for (Map.Entry<Integer, Integer> entry : roomBookingCount.entrySet()) {
                    if (entry.getValue() > maxBookings) {
                        mostBookedRoomId = entry.getKey();
                        maxBookings = entry.getValue();
                    }
                }
                RoomDTO mostBookedRoom = mostBookedRoomId != -1 ? roomDAO.getRoomById(mostBookedRoomId) : null;

                List<Map.Entry<String, Integer>> topUsersByBookings = userBookingCount.entrySet().stream()
                        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                        .limit(5).collect(Collectors.toList());

                request.setAttribute("totalRevenue", totalRevenue);
                request.setAttribute("paidCount", paidCount);
                request.setAttribute("pendingCount", pendingCount);
                request.setAttribute("cancelledCount", cancelledCount);
                request.setAttribute("activeUserCount", activeUsers.size());
                request.setAttribute("revenueByRoom", revenueByRoom);
                request.setAttribute("roomBookingCount", roomBookingCount);
                request.setAttribute("roomCancelCount", roomCancelCount);
                request.setAttribute("mostBookedRoom", mostBookedRoom);
                request.setAttribute("mostBookedCount", maxBookings);
                request.setAttribute("roomDAO", roomDAO);
                request.setAttribute("timeOptions", timeOptions);
                request.setAttribute("topUsersByBookings", topUsersByBookings);
                request.setAttribute("userTotalSpent", userTotalSpent);
                request.setAttribute("userDAO", userDAO);

                request.getRequestDispatcher(ADMIN_STATISTICS_PAGE).forward(request, response);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error retrieving statistics: " + e.getMessage(), e);
                request.setAttribute("errorMessage", "Lỗi khi lấy dữ liệu thống kê: " + e.getMessage());
                request.getRequestDispatcher(ADMIN_STATISTICS_PAGE).forward(request, response);
            }
        } else if ("/admin/messages".equals(path)) {
            ContactDAO contactDAO = new ContactDAO();
            if (action == null || action.isEmpty()) {
                try {
                    List<ContactMessageDTO> messageList = contactDAO.getAllMessages();
                    LOGGER.log(Level.INFO, "Retrieved {0} messages from database", messageList.size());
                    request.setAttribute("messageList", messageList);
                    if (messageList.isEmpty()) {
                        request.setAttribute("infoMessage", "Không có tin nhắn nào từ người dùng!");
                    }
                } catch (Exception e) {
                    LOGGER.log(Level.SEVERE, "Error retrieving messages: " + e.getMessage(), e);
                    request.setAttribute("errorMessage", "Lỗi khi lấy danh sách tin nhắn: " + e.getMessage());
                }
                request.getRequestDispatcher(ADMIN_MESSAGES_PAGE).forward(request, response);
            } else if ("markAsRead".equals(action)) {
                String messageIdStr = request.getParameter("messageId");
                try {
                    int messageId = Integer.parseInt(messageIdStr);
                    if (contactDAO.markAsRead(messageId)) {
                        request.setAttribute("successMessage", "Đã đánh dấu tin nhắn là đã đọc!");
                    } else {
                        request.setAttribute("errorMessage", "Không thể đánh dấu tin nhắn!");
                    }
                } catch (NumberFormatException e) {
                    request.setAttribute("errorMessage", "ID tin nhắn không hợp lệ!");
                } catch (Exception e) {
                    LOGGER.log(Level.SEVERE, "Error marking message as read: " + e.getMessage(), e);
                    request.setAttribute("errorMessage", "Lỗi khi đánh dấu tin nhắn: " + e.getMessage());
                }
                // Cập nhật lại danh sách tin nhắn
                List<ContactMessageDTO> updatedMessageList = contactDAO.getAllMessages();
                request.setAttribute("messageList", updatedMessageList);
                request.getRequestDispatcher(ADMIN_MESSAGES_PAGE).forward(request, response);
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Action not supported");
            }
        } else if ("/admin/promotions".equals(path)) {
            PromotionDAO promotionDAO = new PromotionDAO();
            if (action == null || action.isEmpty()) {
                // Hiển thị form thêm mã khuyến mãi
                request.getRequestDispatcher(ADMIN_PROMOTIONS_PAGE).forward(request, response);
            } else if ("add".equals(action)) {
                if ("POST".equals(request.getMethod())) {
                    String code = request.getParameter("code");
                    String discountType = request.getParameter("discountType");
                    String discountAmountStr = request.getParameter("discountAmount");
                    String startDateStr = request.getParameter("startDate");
                    String endDateStr = request.getParameter("endDate");
                    String usageLimitStr = request.getParameter("usageLimit");

                    try {
                        double discountAmount = Double.parseDouble(discountAmountStr);
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                        Date startDate = sdf.parse(startDateStr);
                        Date endDate = sdf.parse(endDateStr);
                        Integer usageLimit = usageLimitStr.isEmpty() ? null : Integer.parseInt(usageLimitStr);

                        if (code == null || code.trim().isEmpty()) {
                            request.setAttribute("errorMessage", "Mã khuyến mãi không được để trống!");
                        } else if (discountAmount <= 0) {
                            request.setAttribute("errorMessage", "Số tiền giảm giá phải lớn hơn 0!");
                        } else if (startDate.after(endDate)) {
                            request.setAttribute("errorMessage", "Ngày bắt đầu phải trước ngày kết thúc!");
                        } else if (promotionDAO.getPromotionByCode(code) != null) {
                            request.setAttribute("errorMessage", "Mã khuyến mãi đã tồn tại!");
                        } else {
                            PromotionDTO newPromotion = new PromotionDTO();
                            newPromotion.setCode(code);
                            newPromotion.setDiscountType(discountType);
                            newPromotion.setDiscountAmount(discountAmount);
                            newPromotion.setStartDate(startDate);
                            newPromotion.setEndDate(endDate);
                            newPromotion.setUsageLimit(usageLimit);
                            newPromotion.setUsageCount(0);

                            if (promotionDAO.createPromotion(newPromotion)) {
                                request.setAttribute("successMessage", "Thêm mã khuyến mãi thành công!");
                            } else {
                                request.setAttribute("errorMessage", "Thêm mã khuyến mãi thất bại!");
                            }
                        }
                    } catch (NumberFormatException e) {
                        request.setAttribute("errorMessage", "Số tiền giảm giá hoặc giới hạn sử dụng không hợp lệ!");
                    } catch (Exception e) {
                        request.setAttribute("errorMessage", "Lỗi hệ thống khi thêm mã khuyến mãi: " + e.getMessage());
                    }
                    request.getRequestDispatcher(ADMIN_PROMOTIONS_PAGE).forward(request, response);
                }
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Action not supported");
            }
        } else {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Page not found");
        }
    }

    private void redirectToBookingList(BookingDAO bookingDAO, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            List<BookingDTO> bookingList = bookingDAO.getAllBookings();
            request.setAttribute("bookingList", bookingList);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error retrieving bookings: " + e.getMessage(), e);
            request.setAttribute("errorMessage", "Lỗi khi lấy danh sách đặt phòng: " + e.getMessage());
        }
        request.getRequestDispatcher(ADMIN_BOOKINGS_PAGE).forward(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            processRequest(request, response);
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, "Error in doGet: " + ex.getMessage(), ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            processRequest(request, response);
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, "Error in doPost: " + ex.getMessage(), ex);
        }
    }

    @Override
    public String getServletInfo() {
        return "Admin Controller for managing users, rooms, bookings, statistics, and messages";
    }
}
