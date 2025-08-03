package controller;

import dao.BookingDAO;
import dao.RoomDAO;
import dao.PromotionDAO;
import dao.NotificationDAO;
import dto.BookingDTO;
import dto.RoomDTO;
import dto.UserDTO;
import dto.PromotionDTO;
import dto.NotificationDTO;
import utils.EmailUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@WebServlet(name = "BookingController", urlPatterns = {"/bookRoom", "/viewBookings", "/cancelBooking", "/checkAvailability"})
public class BookingController extends HttpServlet {

    private static final String LOGIN_PAGE = "login-regis.jsp";
    private static final String BOOKING_PAGE = "booking.jsp";
    private static final String BOOKING_LIST_PAGE = "viewBookings.jsp";
    private static final int ITEMS_PER_PAGE = 5;

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        String action = request.getServletPath();
        HttpSession session = request.getSession();
        UserDTO user = (UserDTO) session.getAttribute("user");

        if (user == null && !action.equals("/checkAvailability")) {
            response.sendRedirect(request.getContextPath() + "/" + LOGIN_PAGE);
            return;
        }

        try {
            switch (action) {
                case "/bookRoom":
                    handleBooking(request, response, user);
                    break;
                case "/viewBookings":
                    viewBookings(request, response, user);
                    break;
                case "/cancelBooking":
                    cancelBooking(request, response, user);
                    break;
                case "/checkAvailability":
                    checkAvailability(request, response);
                    break;
                default:
                    response.sendError(HttpServletResponse.SC_NOT_FOUND, "Action not supported");
                    break;
            }
        } catch (Exception e) {
            log("Error in BookingController: " + e.getMessage(), e);
            request.setAttribute("errorMessage", "Đã xảy ra lỗi: " + e.getMessage());
            request.getRequestDispatcher(BOOKING_PAGE).forward(request, response);
        }
    }

    private void handleBooking(HttpServletRequest request, HttpServletResponse response, UserDTO user)
            throws IOException, ServletException, ClassNotFoundException, Exception {
        String roomIdParam = request.getParameter("roomId");
        String checkInStr = request.getParameter("checkInDate");
        String checkOutStr = request.getParameter("checkOutDate");
        String promoCode = request.getParameter("promoCode");

        if (roomIdParam == null || roomIdParam.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Không tìm thấy thông tin phòng!");
            request.getRequestDispatcher(BOOKING_PAGE).forward(request, response);
            return;
        }

        int roomId = Integer.parseInt(roomIdParam);
        RoomDAO roomDAO = new RoomDAO();
        RoomDTO room = roomDAO.getRoomById(roomId);

        if (room == null) {
            request.setAttribute("errorMessage", "Phòng không tồn tại!");
            request.getRequestDispatcher(BOOKING_PAGE).forward(request, response);
            return;
        }

        BookingDAO bookingDAO = new BookingDAO();
        // Chuyển chuỗi ngày thành java.util.Date
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date checkInDate = sdf.parse(checkInStr);
        Date checkOutDate = sdf.parse(checkOutStr);

        // Tính số ngày giữa check-in và check-out
        long diffInMillies = checkOutDate.getTime() - checkInDate.getTime();
        long days = diffInMillies / (1000 * 60 * 60 * 24);

        if (days <= 0) {
            request.setAttribute("errorMessage", "Ngày trả phòng phải sau ngày nhận phòng!");
            request.getRequestDispatcher(BOOKING_PAGE).forward(request, response);
            return;
        }

        if (!bookingDAO.isRoomAvailable(roomId, checkInDate, checkOutDate)) {
            request.setAttribute("errorMessage", "Phòng đã được đặt trong khoảng thời gian này!");
            request.getRequestDispatcher(BOOKING_PAGE).forward(request, response);
            return;
        }

        // Tính tổng tiền ban đầu (trước khi giảm)
        double originalPrice = days * room.getPrice();
        double discountAmount = 0;

        // Kiểm tra và áp dụng mã giảm giá
        PromotionDAO promotionDAO = new PromotionDAO();
        if (promoCode != null && !promoCode.trim().isEmpty()) {
            PromotionDTO promotion = promotionDAO.getPromotionByCode(promoCode);
            if (promotion == null) {
                request.setAttribute("errorMessage", "Mã giảm giá không tồn tại.");
                request.getRequestDispatcher(BOOKING_PAGE).forward(request, response);
                return;
            }

            // Kiểm tra ngày hiệu lực của mã giảm giá
            Date currentDate = new Date();
            if (promotion.getStartDate().after(currentDate) || promotion.getEndDate().before(currentDate)) {
                request.setAttribute("errorMessage", "Mã giảm giá không còn hiệu lực.");
                request.getRequestDispatcher(BOOKING_PAGE).forward(request, response);
                return;
            }

            // Kiểm tra số lần sử dụng (nếu có giới hạn)
            if (promotion.getUsageLimit() != null && promotion.getUsageCount() >= promotion.getUsageLimit()) {
                request.setAttribute("errorMessage", "Mã giảm giá đã được sử dụng hết.");
                request.getRequestDispatcher(BOOKING_PAGE).forward(request, response);
                return;
            }

            // Tính số tiền giảm
            discountAmount = promotion.getDiscountAmount();
            if (promotion.getDiscountType().equals("PERCENTAGE")) {
                discountAmount = originalPrice * (discountAmount / 100); // Tính số tiền giảm theo phần trăm
            }

            // Cập nhật usage_count của mã giảm giá
            promotionDAO.incrementUsageCount(promoCode);
        }

        // Tính giá cuối cùng (sau khi giảm)
        double finalPrice = originalPrice - discountAmount;

        // Tạo BookingDTO
        BookingDTO booking = new BookingDTO(0, user, room, checkInDate, checkOutDate, finalPrice, BookingDAO.STATUS_PENDING_PAYMENT, new Date());
        booking.setPromoCode(promoCode);
        booking.setDiscountAmount(discountAmount);

        if (bookingDAO.addBooking(booking)) {
            int bookingId = bookingDAO.getLastInsertedBookingId();
            if (bookingId == -1) {
                request.setAttribute("errorMessage", "Đặt phòng thành công nhưng không thể lấy ID đặt phòng để gửi thông báo!");
                viewBookings(request, response, user);
                return;
            }

            NotificationDAO notificationDAO = new NotificationDAO();
            NotificationDTO notification = new NotificationDTO(0, user.getUserID(),
                    "Bạn đã đặt phòng '" + room.getName() + "' thành công! Tổng tiền: " + finalPrice + " đ. Vui lòng thanh toán để hoàn tất.", null, false);
            notificationDAO.addNotification(notification);

            boolean emailSent = EmailUtils.sendBookingSuccessEmail(
                    user.getGmail(),
                    user.getFullName(),
                    String.valueOf(bookingId),
                    room.getName(),
                    sdf.format(checkInDate),
                    sdf.format(checkOutDate)
            );
            if (!emailSent) {
                log("Failed to send booking success email to: " + user.getGmail());
            }

            request.setAttribute("successMessage", "Đặt phòng thành công! Tổng tiền ban đầu: " + originalPrice + " đ, đã giảm: " + discountAmount + " đ, tổng tiền cuối: " + finalPrice + " đ. Vui lòng thanh toán để hoàn tất.");
            viewBookings(request, response, user);
        } else {
            request.setAttribute("errorMessage", "Đặt phòng thất bại, vui lòng thử lại.");
            request.getRequestDispatcher(BOOKING_PAGE).forward(request, response);
        }
    }

    private void viewBookings(HttpServletRequest request, HttpServletResponse response, UserDTO user)
            throws ServletException, IOException, ClassNotFoundException, Exception {
        BookingDAO bookingDAO = new BookingDAO();
        List<BookingDTO> allBookings = bookingDAO.getBookingsByUserId(user.getUserID());
        Date currentDate = new Date();

        // --- Lọc danh sách đặt phòng ---
        String bookingStatusFilter = request.getParameter("bookingStatusFilter");
        if (bookingStatusFilter != null && !bookingStatusFilter.equals("all")) {
            allBookings = allBookings.stream().filter(booking -> {
                if ("pending".equals(bookingStatusFilter)) {
                    return BookingDAO.STATUS_PENDING_PAYMENT.equals(booking.getStatus());
                } else if ("paid".equals(bookingStatusFilter)) {
                    return BookingDAO.STATUS_PAID.equals(booking.getStatus()) || BookingDAO.STATUS_CONFIRMED.equals(booking.getStatus());
                } else if ("cancelled".equals(bookingStatusFilter)) {
                    return BookingDAO.STATUS_CANCELLED.equals(booking.getStatus());
                } else if ("completed".equals(bookingStatusFilter)) {
                    return currentDate.after(booking.getCheckOutDate());
                }
                return true;
            }).collect(Collectors.toList());
        }

        // Lọc theo khoảng thời gian
        String bookingStartDateStr = request.getParameter("bookingStartDate");
        String bookingEndDateStr = request.getParameter("bookingEndDate");
        if (bookingStartDateStr != null && bookingEndDateStr != null && !bookingStartDateStr.isEmpty() && !bookingEndDateStr.isEmpty()) {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date startDate = sdf.parse(bookingStartDateStr);
            Date endDate = sdf.parse(bookingEndDateStr);
            allBookings = allBookings.stream()
                    .filter(booking -> !booking.getCreatedAt().before(startDate) && !booking.getCreatedAt().after(endDate))
                    .collect(Collectors.toList());
        }

        // --- Sắp xếp danh sách đặt phòng ---
        String bookingSortBy = request.getParameter("bookingSortBy");
        if (bookingSortBy != null) {
            switch (bookingSortBy) {
                case "dateAsc":
                    allBookings.sort(Comparator.comparing(BookingDTO::getCreatedAt));
                    break;
                case "dateDesc":
                    allBookings.sort(Comparator.comparing(BookingDTO::getCreatedAt).reversed());
                    break;
                case "statusAsc":
                    allBookings.sort(Comparator.comparing(BookingDTO::getStatus));
                    break;
                case "statusDesc":
                    allBookings.sort(Comparator.comparing(BookingDTO::getStatus).reversed());
                    break;
            }
        }

        // --- Phân trang cho danh sách đặt phòng ---
        int bookingPage = 1;
        String bookingPageParam = request.getParameter("bookingPage");
        if (bookingPageParam != null) {
            try {
                bookingPage = Integer.parseInt(bookingPageParam);
            } catch (NumberFormatException e) {
                bookingPage = 1;
            }
        }

        int totalBookings = allBookings.size();
        int totalBookingPages = (int) Math.ceil((double) totalBookings / ITEMS_PER_PAGE);
        if (bookingPage < 1) bookingPage = 1;
        if (bookingPage > totalBookingPages) bookingPage = totalBookingPages;

        int start = (bookingPage - 1) * ITEMS_PER_PAGE;
        int end = Math.min(start + ITEMS_PER_PAGE, totalBookings);
        List<BookingDTO> bookingList = totalBookings > 0 ? allBookings.subList(start, end) : allBookings;

        // --- Lấy lịch sử giao dịch ---
        List<BookingDTO> allTransactions = bookingDAO.getBookingsByUserId(user.getUserID()).stream()
                .filter(booking -> BookingDAO.STATUS_PAID.equals(booking.getStatus()) ||
                        BookingDAO.STATUS_CONFIRMED.equals(booking.getStatus()) ||
                        BookingDAO.STATUS_CANCELLED.equals(booking.getStatus()))
                .collect(Collectors.toList());

        // --- Lọc lịch sử giao dịch ---
        String transactionStatusFilter = request.getParameter("transactionStatusFilter");
        if (transactionStatusFilter != null && !transactionStatusFilter.equals("all")) {
            allTransactions = allTransactions.stream().filter(transaction -> {
                if ("paid".equals(transactionStatusFilter)) {
                    return BookingDAO.STATUS_PAID.equals(transaction.getStatus()) || BookingDAO.STATUS_CONFIRMED.equals(transaction.getStatus());
                } else if ("cancelled".equals(transactionStatusFilter)) {
                    return BookingDAO.STATUS_CANCELLED.equals(transaction.getStatus());
                }
                return true;
            }).collect(Collectors.toList());
        }

        String transactionStartDateStr = request.getParameter("transactionStartDate");
        String transactionEndDateStr = request.getParameter("transactionEndDate");
        if (transactionStartDateStr != null && transactionEndDateStr != null && !transactionStartDateStr.isEmpty() && !transactionEndDateStr.isEmpty()) {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date startDate = sdf.parse(transactionStartDateStr);
            Date endDate = sdf.parse(transactionEndDateStr);
            allTransactions = allTransactions.stream()
                    .filter(transaction -> !transaction.getCreatedAt().before(startDate) && !transaction.getCreatedAt().after(endDate))
                    .collect(Collectors.toList());
        }

        // --- Sắp xếp lịch sử giao dịch ---
        String transactionSortBy = request.getParameter("transactionSortBy");
        if (transactionSortBy != null) {
            switch (transactionSortBy) {
                case "dateAsc":
                    allTransactions.sort(Comparator.comparing(BookingDTO::getCreatedAt));
                    break;
                case "dateDesc":
                    allTransactions.sort(Comparator.comparing(BookingDTO::getCreatedAt).reversed());
                    break;
                case "statusAsc":
                    allTransactions.sort(Comparator.comparing(BookingDTO::getStatus));
                    break;
                case "statusDesc":
                    allTransactions.sort(Comparator.comparing(BookingDTO::getStatus).reversed());
                    break;
            }
        }

        // --- Phân trang cho lịch sử giao dịch ---
        int transactionPage = 1;
        String transactionPageParam = request.getParameter("transactionPage");
        if (transactionPageParam != null) {
            try {
                transactionPage = Integer.parseInt(transactionPageParam);
            } catch (NumberFormatException e) {
                transactionPage = 1;
            }
        }

        int totalTransactions = allTransactions.size();
        int totalTransactionPages = (int) Math.ceil((double) totalTransactions / ITEMS_PER_PAGE);
        if (transactionPage < 1) transactionPage = 1;
        if (transactionPage > totalTransactionPages) transactionPage = totalTransactionPages;

        start = (transactionPage - 1) * ITEMS_PER_PAGE;
        end = Math.min(start + ITEMS_PER_PAGE, totalTransactions);
        List<BookingDTO> transactionList = totalTransactions > 0 ? allTransactions.subList(start, end) : allTransactions;

        // Truyền dữ liệu cho JSP
        request.setAttribute("bookingList", bookingList);
        request.setAttribute("bookingPage", bookingPage);
        request.setAttribute("totalBookingPages", totalBookingPages);
        request.setAttribute("bookingStatusFilter", bookingStatusFilter);
        request.setAttribute("bookingStartDate", bookingStartDateStr);
        request.setAttribute("bookingEndDate", bookingEndDateStr);
        request.setAttribute("bookingSortBy", bookingSortBy);

        request.setAttribute("transactionList", transactionList);
        request.setAttribute("transactionPage", transactionPage);
        request.setAttribute("totalTransactionPages", totalTransactionPages);
        request.setAttribute("transactionStatusFilter", transactionStatusFilter);
        request.setAttribute("transactionStartDate", transactionStartDateStr);
        request.setAttribute("transactionEndDate", transactionEndDateStr);
        request.setAttribute("transactionSortBy", transactionSortBy);

        request.getRequestDispatcher(BOOKING_LIST_PAGE).forward(request, response);
    }

    private void cancelBooking(HttpServletRequest request, HttpServletResponse response, UserDTO user)
            throws IOException, ServletException, ClassNotFoundException, Exception {
        int bookingId = Integer.parseInt(request.getParameter("bookingId"));
        BookingDAO bookingDAO = new BookingDAO();
        BookingDTO booking = bookingDAO.getBookingById(bookingId);

        if (booking != null && BookingDAO.STATUS_PENDING_PAYMENT.equals(booking.getStatus()) && bookingDAO.cancelBooking(bookingId)) {
            NotificationDAO notificationDAO = new NotificationDAO();
            String roomName = booking.getRoom() != null ? booking.getRoom().getName() : "Không xác định";
            String message = "Đơn đặt phòng '" + roomName + "' đã được hủy.";
            NotificationDTO notification = new NotificationDTO(0, user.getUserID(), message, null, false);
            notificationDAO.addNotification(notification);

            response.sendRedirect(request.getContextPath() + "/viewBookings");
        } else {
            request.setAttribute("errorMessage", "Hủy đặt phòng thất bại. Đơn đặt phòng không tồn tại hoặc đã được thanh toán/xác nhận.");
            viewBookings(request, response, user);
        }
    }

    private void checkAvailability(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            int roomId = Integer.parseInt(request.getParameter("roomId"));
            String checkInDateStr = request.getParameter("checkInDate");
            String checkOutDateStr = request.getParameter("checkOutDate");

            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date checkInDate = sdf.parse(checkInDateStr);
            Date checkOutDate = sdf.parse(checkOutDateStr);

            BookingDAO bookingDAO = new BookingDAO();
            boolean isAvailable = bookingDAO.isRoomAvailable(roomId, checkInDate, checkOutDate);

            out.print("{\"available\": " + isAvailable + "}");
        } catch (Exception e) {
            out.print("{\"error\": \"" + e.getMessage() + "\"}");
        } finally {
            out.flush();
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