<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.List"%>
<%@page import="java.util.Date"%>
<%@page import="dto.BookingDTO"%>
<%@page import="dto.RoomDTO"%>
<%@page import="dto.UserDTO"%>
<%@page import="dao.BookingDAO"%>
<%
    List<BookingDTO> bookingList = (List<BookingDTO>) request.getAttribute("bookingList");
    List<BookingDTO> transactionList = (List<BookingDTO>) request.getAttribute("transactionList");
    Integer bookingPage = (Integer) request.getAttribute("bookingPage");
    Integer totalBookingPages = (Integer) request.getAttribute("totalBookingPages");
    Integer transactionPage = (Integer) request.getAttribute("transactionPage");
    Integer totalTransactionPages = (Integer) request.getAttribute("totalTransactionPages");
    String bookingStatusFilter = (String) request.getAttribute("bookingStatusFilter");
    String bookingStartDate = (String) request.getAttribute("bookingStartDate");
    String bookingEndDate = (String) request.getAttribute("bookingEndDate");
    String bookingSortBy = (String) request.getAttribute("bookingSortBy");
    String transactionStatusFilter = (String) request.getAttribute("transactionStatusFilter");
    String transactionStartDate = (String) request.getAttribute("transactionStartDate");
    String transactionEndDate = (String) request.getAttribute("transactionEndDate");
    String transactionSortBy = (String) request.getAttribute("transactionSortBy");
    String errorMessage = (String) request.getAttribute("errorMessage");

    // Định dạng cho hiển thị ngày trong bảng
    SimpleDateFormat sdfDisplay = new SimpleDateFormat("dd/MM/yyyy");
    // Định dạng cho input type="date" (yyyy-MM-dd)
    SimpleDateFormat sdfInput = new SimpleDateFormat("yyyy-MM-dd");

    Date currentDate = new Date();
    UserDTO user = (UserDTO) session.getAttribute("user");
%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <title>Danh sách đặt phòng</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/viewBookings.css">  
        <script>
            function confirmCancel(bookingId) {
                if (confirm("Bạn có chắc chắn muốn hủy đặt phòng này không?")) {
                    document.getElementById('cancelForm_' + bookingId).submit();
                }
            }
        </script>
    </head>
    <body>
        <div class="main-content">
            <!-- Danh sách đặt phòng -->
            <div class="container">
                <h2>Danh sách đặt phòng của bạn</h2>
                <a href="<%= request.getContextPath()%>/home.jsp" class="back-link"><i class="fas fa-arrow-left"></i> Quay lại trang chủ</a>

                <% if (errorMessage != null) {%>
                <p class="error-message"><%= errorMessage%></p>
                <% }%>

                <!-- Bộ lọc và sắp xếp cho danh sách đặt phòng -->
                <form action="<%= request.getContextPath()%>/viewBookings" method="get">
                    <div class="filter-sort">
                        <div>
                            <label for="bookingStatusFilter">Lọc theo trạng thái:</label>
                            <select id="bookingStatusFilter" name="bookingStatusFilter" onchange="this.form.submit()">
                                <option value="all" <%= "all".equals(bookingStatusFilter) || bookingStatusFilter == null ? "selected" : ""%>>Tất cả</option>
                                <option value="pending" <%= "pending".equals(bookingStatusFilter) ? "selected" : ""%>>Chờ thanh toán</option>
                                <option value="paid" <%= "paid".equals(bookingStatusFilter) ? "selected" : ""%>>Đã thanh toán</option>
                                <option value="cancelled" <%= "cancelled".equals(bookingStatusFilter) ? "selected" : ""%>>Đã hủy</option>
                                <option value="completed" <%= "completed".equals(bookingStatusFilter) ? "selected" : ""%>>Đã ở</option>
                            </select>
                        </div>
                        <div class="date-filter">
                            <label for="bookingStartDate">Từ ngày:</label>
                            <input type="date" id="bookingStartDate" name="bookingStartDate" value="<%= bookingStartDate != null ? bookingStartDate : ""%>" onchange="this.form.submit()">
                            <label for="bookingEndDate">Đến ngày:</label>
                            <input type="date" id="bookingEndDate" name="bookingEndDate" value="<%= bookingEndDate != null ? bookingEndDate : ""%>" onchange="this.form.submit()">
                        </div>
                        <div>
                            <label for="bookingSortBy">Sắp xếp theo:</label>
                            <select id="bookingSortBy" name="bookingSortBy" onchange="this.form.submit()">
                                <option value="" <%= bookingSortBy == null ? "selected" : ""%>>Mặc định</option>
                                <option value="dateAsc" <%= "dateAsc".equals(bookingSortBy) ? "selected" : ""%>>Ngày (Cũ nhất trước)</option>
                                <option value="dateDesc" <%= "dateDesc".equals(bookingSortBy) ? "selected" : ""%>>Ngày (Mới nhất trước)</option>
                                <option value="statusAsc" <%= "statusAsc".equals(bookingSortBy) ? "selected" : ""%>>Trạng thái (A-Z)</option>
                                <option value="statusDesc" <%= "statusDesc".equals(bookingSortBy) ? "selected" : ""%>>Trạng thái (Z-A)</option>
                            </select>
                        </div>
                    </div>
                    <!-- Ẩn các tham số khác để giữ trạng thái phân trang và bộ lọc của lịch sử giao dịch -->
                    <input type="hidden" name="bookingPage" value="<%= bookingPage != null ? bookingPage : 1%>">
                    <input type="hidden" name="transactionPage" value="<%= transactionPage != null ? transactionPage : 1%>">
                    <input type="hidden" name="transactionStatusFilter" value="<%= transactionStatusFilter != null ? transactionStatusFilter : "all"%>">
                    <input type="hidden" name="transactionStartDate" value="<%= transactionStartDate != null ? transactionStartDate : ""%>">
                    <input type="hidden" name="transactionEndDate" value="<%= transactionEndDate != null ? transactionEndDate : ""%>">
                    <input type="hidden" name="transactionSortBy" value="<%= transactionSortBy != null ? transactionSortBy : ""%>">
                </form>

                <% if (bookingList == null || bookingList.isEmpty()) { %>
                <p class="no-booking">Bạn chưa có đặt phòng nào.</p>
                <% } else { %>
                <table class="booking-table">
                    <thead>
                        <tr>
                            <th>Tên phòng</th>
                            <th>Ngày nhận</th>
                            <th>Ngày trả</th>
                            <th>Giá</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (BookingDTO booking : bookingList) {
                                RoomDTO room = booking.getRoom();
                                String statusClass = "";
                                String displayStatus = "";

                                if (BookingDAO.STATUS_CANCELLED.equals(booking.getStatus())) {
                                    statusClass = "cancelled";
                                    displayStatus = "Đã hủy";
                                } else if (BookingDAO.STATUS_PAID.equals(booking.getStatus()) || BookingDAO.STATUS_CONFIRMED.equals(booking.getStatus())) {
                                    statusClass = "success";
                                    displayStatus = "Đã thanh toán";
                                } else if (BookingDAO.STATUS_PENDING_PAYMENT.equals(booking.getStatus())) {
                                    statusClass = "pending";
                                    displayStatus = "Chờ thanh toán";
                                } else if (currentDate.after(booking.getCheckOutDate())) {
                                    statusClass = "completed";
                                    displayStatus = "Đã ở";
                                }
                        %>
                        <tr>
                            <td><%= room != null ? room.getName() : "Không xác định"%></td>
                            <td><%= sdfDisplay.format(booking.getCheckInDate())%></td>
                            <td><%= sdfDisplay.format(booking.getCheckOutDate())%></td>
                            <td class="price"><%= String.format("%,.0f", booking.getTotalPrice())%> VND</td>
                            <td class="status <%= statusClass%>"><%= displayStatus%></td>
                            <td class="actions">
                                <% if (BookingDAO.STATUS_PENDING_PAYMENT.equals(booking.getStatus()) && currentDate.before(booking.getCheckOutDate())) {%>
                                <form id="paymentForm_<%= booking.getId()%>" action="<%= request.getContextPath()%>/processPayment" method="post" style="display:inline;">
                                    <input type="hidden" name="bookingId" value="<%= booking.getId()%>">
                                    <input type="hidden" name="amount" value="<%= booking.getTotalPrice()%>">
                                    <button type="submit" class="btn pay"><i class="fas fa-credit-card"></i> Thanh toán</button>
                                </form>
                                <form id="cancelForm_<%= booking.getId()%>" action="<%= request.getContextPath()%>/cancelBooking" method="post" style="display:inline;">
                                    <input type="hidden" name="bookingId" value="<%= booking.getId()%>">
                                    <button type="button" class="btn cancel" onclick="confirmCancel('<%= booking.getId()%>')"><i class="fas fa-times"></i> Hủy</button>
                                </form>
                                <% } %>
                                <% if (room != null) {%>
                                <form action="<%= request.getContextPath()%>/room-details" method="get" style="display:inline;">
                                    <input type="hidden" name="roomId" value="<%= room.getId()%>">
                                    <button type="submit" class="btn view"><i class="fas fa-eye"></i> Xem</button>
                                </form>
                                <% } %>
                            </td>
                        </tr>
                        <% } %>
                    </tbody>
                </table>

                <!-- Phân trang cho danh sách đặt phòng -->
                <div class="pagination">
                    <% if (bookingPage > 1) {%>
                    <a href="<%= request.getContextPath()%>/viewBookings?bookingPage=<%= bookingPage - 1%>&bookingStatusFilter=<%= bookingStatusFilter != null ? bookingStatusFilter : "all"%>&bookingStartDate=<%= bookingStartDate != null ? bookingStartDate : ""%>&bookingEndDate=<%= bookingEndDate != null ? bookingEndDate : ""%>&bookingSortBy=<%= bookingSortBy != null ? bookingSortBy : ""%>&transactionPage=<%= transactionPage%>&transactionStatusFilter=<%= transactionStatusFilter != null ? transactionStatusFilter : "all"%>&transactionStartDate=<%= transactionStartDate != null ? transactionStartDate : ""%>&transactionEndDate=<%= transactionEndDate != null ? transactionEndDate : ""%>&transactionSortBy=<%= transactionSortBy != null ? transactionSortBy : ""%>">Trang trước</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang trước</a>
                    <% } %>

                    <% for (int i = 1; i <= totalBookingPages; i++) {%>
                    <a href="<%= request.getContextPath()%>/viewBookings?bookingPage=<%= i%>&bookingStatusFilter=<%= bookingStatusFilter != null ? bookingStatusFilter : "all"%>&bookingStartDate=<%= bookingStartDate != null ? bookingStartDate : ""%>&bookingEndDate=<%= bookingEndDate != null ? bookingEndDate : ""%>&bookingSortBy=<%= bookingSortBy != null ? bookingSortBy : ""%>&transactionPage=<%= transactionPage%>&transactionStatusFilter=<%= transactionStatusFilter != null ? transactionStatusFilter : "all"%>&transactionStartDate=<%= transactionStartDate != null ? transactionStartDate : ""%>&transactionEndDate=<%= transactionEndDate != null ? transactionEndDate : ""%>&transactionSortBy=<%= transactionSortBy != null ? transactionSortBy : ""%>" class="<%= (i == bookingPage) ? "active" : ""%>"><%= i%></a>
                    <% } %>

                    <% if (bookingPage < totalBookingPages) {%>
                    <a href="<%= request.getContextPath()%>/viewBookings?bookingPage=<%= bookingPage + 1%>&bookingStatusFilter=<%= bookingStatusFilter != null ? bookingStatusFilter : "all"%>&bookingStartDate=<%= bookingStartDate != null ? bookingStartDate : ""%>&bookingEndDate=<%= bookingEndDate != null ? bookingEndDate : ""%>&bookingSortBy=<%= bookingSortBy != null ? bookingSortBy : ""%>&transactionPage=<%= transactionPage%>&transactionStatusFilter=<%= transactionStatusFilter != null ? transactionStatusFilter : "all"%>&transactionStartDate=<%= transactionStartDate != null ? transactionStartDate : ""%>&transactionEndDate=<%= transactionEndDate != null ? transactionEndDate : ""%>&transactionSortBy=<%= transactionSortBy != null ? transactionSortBy : ""%>">Trang sau</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang sau</a>
                    <% } %>
                </div>
                <% }%>
            </div>

            <!-- Lịch sử giao dịch -->
            <div class="container">
                <h2>Lịch sử giao dịch</h2>

                <!-- Bộ lọc và sắp xếp cho lịch sử giao dịch -->
                <form action="<%= request.getContextPath()%>/viewBookings" method="get">
                    <div class="filter-sort">
                        <div>
                            <label for="transactionStatusFilter">Lọc theo trạng thái:</label>
                            <select id="transactionStatusFilter" name="transactionStatusFilter" onchange="this.form.submit()">
                                <option value="all" <%= "all".equals(transactionStatusFilter) || transactionStatusFilter == null ? "selected" : ""%>>Tất cả</option>
                                <option value="paid" <%= "paid".equals(transactionStatusFilter) ? "selected" : ""%>>Thành công</option>
                                <option value="cancelled" <%= "cancelled".equals(transactionStatusFilter) ? "selected" : ""%>>Đã hủy</option>
                            </select>
                        </div>
                        <div class="date-filter">
                            <label for="transactionStartDate">Từ ngày:</label>
                            <input type="date" id="transactionStartDate" name="transactionStartDate" value="<%= transactionStartDate != null ? transactionStartDate : ""%>" onchange="this.form.submit()">
                            <label for="transactionEndDate">Đến ngày:</label>
                            <input type="date" id="transactionEndDate" name="transactionEndDate" value="<%= transactionEndDate != null ? transactionEndDate : ""%>" onchange="this.form.submit()">
                        </div>
                        <div>
                            <label for="transactionSortBy">Sắp xếp theo:</label>
                            <select id="transactionSortBy" name="transactionSortBy" onchange="this.form.submit()">
                                <option value="" <%= transactionSortBy == null ? "selected" : ""%>>Mặc định</option>
                                <option value="dateAsc" <%= "dateAsc".equals(transactionSortBy) ? "selected" : ""%>>Ngày (Cũ nhất trước)</option>
                                <option value="dateDesc" <%= "dateDesc".equals(transactionSortBy) ? "selected" : ""%>>Ngày (Mới nhất trước)</option>
                                <option value="statusAsc" <%= "statusAsc".equals(transactionSortBy) ? "selected" : ""%>>Trạng thái (A-Z)</option>
                                <option value="statusDesc" <%= "statusDesc".equals(transactionSortBy) ? "selected" : ""%>>Trạng thái (Z-A)</option>
                            </select>
                        </div>
                    </div>
                    <!-- Ẩn các tham số khác để giữ trạng thái phân trang và bộ lọc của danh sách đặt phòng -->
                    <input type="hidden" name="bookingPage" value="<%= bookingPage != null ? bookingPage : 1%>">
                    <input type="hidden" name="bookingStatusFilter" value="<%= bookingStatusFilter != null ? bookingStatusFilter : "all"%>">
                    <input type="hidden" name="bookingStartDate" value="<%= bookingStartDate != null ? bookingStartDate : ""%>">
                    <input type="hidden" name="bookingEndDate" value="<%= bookingEndDate != null ? bookingEndDate : ""%>">
                    <input type="hidden" name="bookingSortBy" value="<%= bookingSortBy != null ? bookingSortBy : ""%>">
                    <input type="hidden" name="transactionPage" value="<%= transactionPage != null ? transactionPage : 1%>">
                </form>

                <% if (transactionList == null || transactionList.isEmpty()) { %>
                <p class="no-booking">Bạn chưa có giao dịch nào.</p>
                <% } else { %>
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>Tên phòng</th>
                            <th>Ngày giao dịch</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (BookingDTO transaction : transactionList) {
                                RoomDTO room = transaction.getRoom();
                                String statusClass = "";
                                String displayStatus = "";

                                if (BookingDAO.STATUS_CANCELLED.equals(transaction.getStatus())) {
                                    statusClass = "cancelled";
                                    displayStatus = "Đã hủy";
                                } else if (BookingDAO.STATUS_PAID.equals(transaction.getStatus()) || BookingDAO.STATUS_CONFIRMED.equals(transaction.getStatus())) {
                                    statusClass = "success";
                                    displayStatus = "Thành công";
                                }
                        %>
                        <tr>
                            <td><%= room != null ? room.getName() : "Không xác định"%></td>
                            <td><%= sdfDisplay.format(transaction.getCreatedAt())%></td>
                            <td class="price"><%= String.format("%,.0f", transaction.getTotalPrice())%> VND</td>
                            <td class="status <%= statusClass%>"><%= displayStatus%></td>
                        </tr>
                        <% } %>
                    </tbody>
                </table>

                <!-- Phân trang cho lịch sử giao dịch -->
                <div class="pagination">
                    <% if (transactionPage > 1) {%>
                    <a href="<%= request.getContextPath()%>/viewBookings?bookingPage=<%= bookingPage%>&bookingStatusFilter=<%= bookingStatusFilter != null ? bookingStatusFilter : "all"%>&bookingStartDate=<%= bookingStartDate != null ? bookingStartDate : ""%>&bookingEndDate=<%= bookingEndDate != null ? bookingEndDate : ""%>&bookingSortBy=<%= bookingSortBy != null ? bookingSortBy : ""%>&transactionPage=<%= transactionPage - 1%>&transactionStatusFilter=<%= transactionStatusFilter != null ? transactionStatusFilter : "all"%>&transactionStartDate=<%= transactionStartDate != null ? transactionStartDate : ""%>&transactionEndDate=<%= transactionEndDate != null ? transactionEndDate : ""%>&transactionSortBy=<%= transactionSortBy != null ? transactionSortBy : ""%>">Trang trước</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang trước</a>
                    <% } %>

                    <% for (int i = 1; i <= totalTransactionPages; i++) {%>
                    <a href="<%= request.getContextPath()%>/viewBookings?bookingPage=<%= bookingPage%>&bookingStatusFilter=<%= bookingStatusFilter != null ? bookingStatusFilter : "all"%>&bookingStartDate=<%= bookingStartDate != null ? bookingStartDate : ""%>&bookingEndDate=<%= bookingEndDate != null ? bookingEndDate : ""%>&bookingSortBy=<%= bookingSortBy != null ? bookingSortBy : ""%>&transactionPage=<%= i%>&transactionStatusFilter=<%= transactionStatusFilter != null ? transactionStatusFilter : "all"%>&transactionStartDate=<%= transactionStartDate != null ? transactionStartDate : ""%>&transactionEndDate=<%= transactionEndDate != null ? transactionEndDate : ""%>&transactionSortBy=<%= transactionSortBy != null ? transactionSortBy : ""%>" class="<%= (i == transactionPage) ? "active" : ""%>"><%= i%></a>
                    <% } %>

                    <% if (transactionPage < totalTransactionPages) {%>
                    <a href="<%= request.getContextPath()%>/viewBookings?bookingPage=<%= bookingPage%>&bookingStatusFilter=<%= bookingStatusFilter != null ? bookingStatusFilter : "all"%>&bookingStartDate=<%= bookingStartDate != null ? bookingStartDate : ""%>&bookingEndDate=<%= bookingEndDate != null ? bookingEndDate : ""%>&bookingSortBy=<%= bookingSortBy != null ? bookingSortBy : ""%>&transactionPage=<%= transactionPage + 1%>&transactionStatusFilter=<%= transactionStatusFilter != null ? transactionStatusFilter : "all"%>&transactionStartDate=<%= transactionStartDate != null ? transactionStartDate : ""%>&transactionEndDate=<%= transactionEndDate != null ? transactionEndDate : ""%>&transactionSortBy=<%= transactionSortBy != null ? transactionSortBy : ""%>">Trang sau</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang sau</a>
                    <% } %>
                </div>
                <% }%>
            </div>
        </div>
    </body>
</html>