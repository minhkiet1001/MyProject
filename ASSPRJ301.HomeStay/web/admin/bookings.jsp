<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="java.util.List"%>
<%@page import="dto.BookingDTO"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="dao.BookingDAO"%>
<% request.setCharacterEncoding("UTF-8");%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quản lý đặt phòng - Admin</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/admin-booking.css">
    </head>
    <body>
        <div class="header-container">
            <%@include file="../header.jsp" %>
        </div>

        <div class="main-content">
            <div class="bookings-container">
                <h1>Quản lý đặt phòng</h1>
                <a href="<%= request.getContextPath()%>/admin/dashboard.jsp" class="back-link"><i class="fas fa-arrow-left"></i> Quay lại Dashboard</a>

                <%
                    String successMessage = (String) request.getAttribute("successMessage");
                    String errorMessage = (String) request.getAttribute("errorMessage");
                    if (successMessage != null) {
                %>
                <div class="message success"><%= successMessage%></div>
                <% } else if (errorMessage != null) {%>
                <div class="message error"><%= errorMessage%></div>
                <% } %>

                <%
                    List<BookingDTO> bookingList = (List<BookingDTO>) request.getAttribute("bookingList");
                    SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
                    if (bookingList == null || bookingList.isEmpty()) {
                %>
                <p class="no-data">Không có đặt phòng nào trong hệ thống.</p>
                <%
                } else {
                    // Phân trang
                    final int ITEMS_PER_PAGE = 5; // Số lượng đặt phòng trên mỗi trang
                    int currentPage = 1;
                    String pageParam = request.getParameter("page");
                    if (pageParam != null) {
                        try {
                            currentPage = Integer.parseInt(pageParam);
                        } catch (NumberFormatException e) {
                            currentPage = 1;
                        }
                    }

                    int totalBookings = bookingList.size();
                    int totalPages = (int) Math.ceil((double) totalBookings / ITEMS_PER_PAGE);
                    if (currentPage < 1) {
                        currentPage = 1;
                    }
                    if (currentPage > totalPages) {
                        currentPage = totalPages;
                    }

                    int start = (currentPage - 1) * ITEMS_PER_PAGE;
                    int end = Math.min(start + ITEMS_PER_PAGE, totalBookings);
                    List<BookingDTO> bookingsToShow = totalBookings > 0 ? bookingList.subList(start, end) : bookingList;
                %>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên Người dùng</th>
                            <th>Tên Phòng</th>
                            <th>Ngày nhận phòng</th>
                            <th>Ngày trả phòng</th>
                            <th>Tổng tiền (VND)</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (BookingDTO booking : bookingsToShow) {
                                String statusClass = "";
                                String displayStatus = "";
                                if (BookingDAO.STATUS_PENDING_PAYMENT.equals(booking.getStatus())) {
                                    statusClass = "pending";
                                    displayStatus = "Chờ thanh toán";
                                } else if (BookingDAO.STATUS_PAID.equals(booking.getStatus())) {
                                    statusClass = "paid";
                                    displayStatus = "Đã thanh toán";
                                } else if (BookingDAO.STATUS_CONFIRMED.equals(booking.getStatus())) {
                                    statusClass = "confirmed";
                                    displayStatus = "Đã xác nhận";
                                } else if (BookingDAO.STATUS_CANCELLED.equals(booking.getStatus())) {
                                    statusClass = "cancelled";
                                    displayStatus = "Đã hủy";
                                }
                        %>
                        <tr>
                            <td><%= booking.getId()%></td>
                            <td><%= booking.getUser() != null ? booking.getUser().getFullName() : "Không xác định"%></td>
                            <td><%= booking.getRoom() != null ? booking.getRoom().getName() : "Không xác định"%></td>
                            <td><%= dateFormat.format(booking.getCheckInDate())%></td>
                            <td><%= dateFormat.format(booking.getCheckOutDate())%></td>
                            <td><%= String.format("%,.0f", booking.getTotalPrice())%></td>
                            <td class="status <%= statusClass%>"><%= displayStatus%></td>
                            <td><%= dateFormat.format(booking.getCreatedAt())%></td>
                            <td>
                                <% if (BookingDAO.STATUS_PAID.equals(booking.getStatus())) {%>
                                <button class="btn btn-confirm" onclick="confirmBooking('<%= booking.getId()%>', <%= currentPage%>)"><i class="fas fa-check"></i> Xác nhận</button>
                                <% } %>
                                <% if (!BookingDAO.STATUS_CANCELLED.equals(booking.getStatus())) {%>
                                <button class="btn btn-cancel" onclick="cancelBooking('<%= booking.getId()%>', <%= currentPage%>)"><i class="fas fa-times"></i> Hủy</button>
                                <% }%>
                                <button class="btn btn-delete" onclick="deleteBooking('<%= booking.getId()%>', <%= currentPage%>)"><i class="fas fa-trash"></i> Xóa</button>
                            </td>
                        </tr>
                        <% } %>
                    </tbody>
                </table>

                <!-- Phân trang -->
                <div class="pagination">
                    <% if (currentPage > 1) {%>
                    <a href="<%= request.getContextPath()%>/admin/bookings?page=<%= currentPage - 1%>">Trang trước</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang trước</a>
                    <% } %>

                    <% for (int i = 1; i <= totalPages; i++) {%>
                    <a href="<%= request.getContextPath()%>/admin/bookings?page=<%= i%>" class="<%= (i == currentPage) ? "active" : ""%>"><%= i%></a>
                    <% } %>

                    <% if (currentPage < totalPages) {%>
                    <a href="<%= request.getContextPath()%>/admin/bookings?page=<%= currentPage + 1%>">Trang sau</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang sau</a>
                    <% } %>
                </div>
                <%
                    }
                %>
            </div>
        </div>

        <div class="footer-container">
            <%@include file="../footer.jsp" %>
        </div>

        <script>
            function confirmBooking(bookingId, page) {
                if (confirm("Bạn có chắc chắn muốn xác nhận đặt phòng này không?")) {
                    window.location.href = '<%= request.getContextPath()%>/admin/bookings?action=confirm&bookingId=' + bookingId + '&page=' + page;
                }
            }

            function cancelBooking(bookingId, page) {
                if (confirm("Bạn có chắc chắn muốn hủy đặt phòng này không?")) {
                    window.location.href = '<%= request.getContextPath()%>/admin/bookings?action=cancel&bookingId=' + bookingId + '&page=' + page;
                }
            }

            function deleteBooking(bookingId, page) {
                if (confirm("Bạn có chắc chắn muốn xóa đặt phòng này không?")) {
                    window.location.href = '<%= request.getContextPath()%>/admin/bookings?action=delete&bookingId=' + bookingId + '&page=' + page;
                }
            }
        </script>
    </body>
</html>