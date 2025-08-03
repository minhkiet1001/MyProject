<%@page import="dao.UserDAO"%>
<%@page import="java.util.List"%>
<%@page import="dao.RoomDAO"%>
<%@page import="java.util.Map"%>
<%@page import="dto.UserDTO"%>
<%@page import="dto.RoomDTO"%>
<%@page import="java.util.Set"%>
<%@page import="java.util.stream.Collectors"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<% request.setCharacterEncoding("UTF-8");%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thống kê - Admin</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/admin-statistics.css">
    </head>
    <body>
        <%
            // Kiểm tra quyền admin mà không khai báo lại user
            Object userObj = session.getAttribute("user");
            if (!(userObj instanceof UserDTO) || !"AD".equals(((UserDTO) userObj).getRoleID())) {
                response.sendRedirect(request.getContextPath() + "/login-regis.jsp");
                return;
            }

            // Lấy các biến từ request
            Integer pendingCount = (Integer) request.getAttribute("pendingCount");
            Integer paidCount = (Integer) request.getAttribute("paidCount");
            Integer cancelledCount = (Integer) request.getAttribute("cancelledCount");
            Double totalRevenue = (Double) request.getAttribute("totalRevenue");
            Integer activeUserCount = (Integer) request.getAttribute("activeUserCount");
            RoomDTO mostBookedRoom = (RoomDTO) request.getAttribute("mostBookedRoom");
            Integer mostBookedCount = (Integer) request.getAttribute("mostBookedCount");
            Set<String> timeOptions = (Set<String>) request.getAttribute("timeOptions");
            RoomDAO roomDAO = (RoomDAO) request.getAttribute("roomDAO");
            String errorMessage = (String) request.getAttribute("errorMessage");

            // Tính tỷ lệ phần trăm cho biểu đồ tròn
            int totalBookings = (pendingCount != null ? pendingCount : 0) + (paidCount != null ? paidCount : 0) + (cancelledCount != null ? cancelledCount : 0);
            double pendingPercent = totalBookings > 0 ? (double) (pendingCount != null ? pendingCount : 0) / totalBookings * 100 : 0;
            double paidPercent = totalBookings > 0 ? (double) (paidCount != null ? paidCount : 0) / totalBookings * 100 : 0;
            double cancelledPercent = totalBookings > 0 ? (double) (cancelledCount != null ? cancelledCount : 0) / totalBookings * 100 : 0;
        %>

        <div class="header-container">
            <%@include file="../header.jsp" %>
        </div>

        <div class="main-content">
            <div class="stats-container">
                <h1>Thống kê</h1>
                <a href="<%= request.getContextPath()%>/admin/dashboard.jsp" class="back-link"><i class="fas fa-arrow-left"></i> Quay lại Dashboard</a>

                <% if (errorMessage != null) {%>
                <div class="message error"><%= errorMessage%></div>
                <% }%>

                <!-- Bộ lọc thời gian -->
                <div class="filter-container">
                    <form action="<%= request.getContextPath()%>/admin/statistics" method="get">
                        <label for="startDate">Từ ngày:</label>
                        <input type="date" id="startDate" name="startDate" value="<%= request.getParameter("startDate") != null ? request.getParameter("startDate") : ""%>">
                        <label for="endDate">Đến ngày:</label>
                        <input type="date" id="endDate" name="endDate" value="<%= request.getParameter("endDate") != null ? request.getParameter("endDate") : ""%>">
                        <button type="submit">Lọc</button>
                    </form>
                    <label for="timeFilter">Hoặc chọn tháng:</label>
                    <select id="timeFilter" onchange="location.href = '<%= request.getContextPath()%>/admin/statistics?time=' + this.value;">
                        <option value="all" <%= "all".equals(request.getParameter("time")) || request.getParameter("time") == null ? "selected" : ""%>>Tất cả</option>
                        <% if (timeOptions != null) {
                                for (String time : timeOptions) {%>
                        <option value="<%= time%>" <%= time.equals(request.getParameter("time")) ? "selected" : ""%>><%= time%></option>
                        <% }
                            }%>
                    </select>
                </div>

                <!-- Thống kê tổng quan -->
                <div class="stats-grid">
                    <div class="stat-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <div class="stat-label">Tổng doanh thu</div>
                        <div class="stat-value revenue"><%= totalRevenue != null ? String.format("%,.0f", totalRevenue) : "0"%> VND</div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-hourglass-half"></i>
                        <div class="stat-label">Chưa thanh toán</div>
                        <div class="stat-value pending"><%= pendingCount != null ? pendingCount : "0"%></div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-check-circle"></i>
                        <div class="stat-label">Đã thanh toán</div>
                        <div class="stat-value paid"><%= paidCount != null ? paidCount : "0"%></div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-times-circle"></i>
                        <div class="stat-label">Đã hủy</div>
                        <div class="stat-value cancelled"><%= cancelledCount != null ? cancelledCount : "0"%></div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <div class="stat-label">User hoạt động</div>
                        <div class="stat-value"><%= activeUserCount != null ? activeUserCount : "0"%></div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-bed"></i>
                        <div class="stat-label">Phòng phổ biến</div>
                        <div class="stat-value"><%= mostBookedRoom != null ? mostBookedRoom.getName() + " (" + (mostBookedCount != null ? mostBookedCount : 0) + ")" : "Chưa có"%></div>
                    </div>
                </div>

                <!-- Biểu đồ số lượng đặt phòng -->
                <div class="chart-container">
                    <h2>Số lượng đặt phòng</h2>
                    <canvas id="bookingChart"></canvas>
                </div>

                <!-- Biểu đồ tỷ lệ trạng thái -->
                <div class="chart-container">
                    <h2>Tỷ lệ trạng thái</h2>
                    <canvas id="statusPieChart"></canvas>
                </div>

                <!-- Thống kê chi tiết theo phòng -->
                <div>
                    <h2>Thống kê theo phòng</h2>
                    <table class="revenue-table">
                        <thead>
                            <tr>
                                <th>Tên phòng</th>
                                <th>Số lượt đặt</th>
                                <th>Số lượt hủy</th>
                                <th>Doanh thu (VND)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% Map<Integer, Double> revenueByRoom = (Map<Integer, Double>) request.getAttribute("revenueByRoom");
                                Map<Integer, Integer> roomBookingCount = (Map<Integer, Integer>) request.getAttribute("roomBookingCount");
                                Map<Integer, Integer> roomCancelCount = (Map<Integer, Integer>) request.getAttribute("roomCancelCount");
                                if (roomBookingCount != null && !roomBookingCount.isEmpty()) {
                                    for (Integer roomId : roomBookingCount.keySet()) {
                                        RoomDTO room = roomDAO != null ? roomDAO.getRoomById(roomId) : null;%>
                            <tr>
                                <td><%= room != null ? room.getName() : "Không xác định"%></td>
                                <td><%= roomBookingCount.getOrDefault(roomId, 0)%></td>
                                <td><%= roomCancelCount != null ? roomCancelCount.getOrDefault(roomId, 0) : 0%></td>
                                <td><%= revenueByRoom != null && revenueByRoom.containsKey(roomId) ? String.format("%,.0f", revenueByRoom.get(roomId)) : "0"%></td>
                            </tr>
                            <% }
                            } else { %>
                            <tr><td colspan="4" style="text-align: center;">Chưa có dữ liệu</td></tr>
                            <% } %>
                        </tbody>
                    </table>
                </div>

                <!-- Top người dùng đặt nhiều nhất -->
                <div>
                    <h2>Top 5 người dùng đặt nhiều nhất</h2>
                    <table class="revenue-table">
                        <thead>
                            <tr>
                                <th>Tên người dùng</th>
                                <th>Số lần đặt</th>
                                <th>Tổng chi tiêu (VND)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% List<Map.Entry<String, Integer>> topUsersByBookings = (List<Map.Entry<String, Integer>>) request.getAttribute("topUsersByBookings");
                                Map<String, Double> userTotalSpent = (Map<String, Double>) request.getAttribute("userTotalSpent");
                                UserDAO userDAO = (UserDAO) request.getAttribute("userDAO");
                                if (topUsersByBookings != null && !topUsersByBookings.isEmpty()) {
                                    for (Map.Entry<String, Integer> entry : topUsersByBookings) {
                                        UserDTO userDTO = userDAO != null ? userDAO.readById(entry.getKey()) : null;%>
                            <tr>
                                <td><%= userDTO != null ? userDTO.getFullName() : entry.getKey()%></td>
                                <td><%= entry.getValue()%></td>
                                <td><%= userTotalSpent != null && userTotalSpent.containsKey(entry.getKey()) ? String.format("%,.0f", userTotalSpent.get(entry.getKey())) : "0"%></td>
                            </tr>
                            <% }
                            } else { %>
                            <tr><td colspan="3" style="text-align: center;">Chưa có dữ liệu</td></tr>
                            <% }%>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="footer-container">
            <%@include file="../footer.jsp" %>
        </div>

        <script>
            // Biểu đồ cột
            const ctxBar = document.getElementById('bookingChart').getContext('2d');
            const bookingChart = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['Chưa thanh toán', 'Đã thanh toán', 'Đã hủy'],
                    datasets: [{
                            label: 'Số lượng đặt phòng',
                            data: [
                                <%= pendingCount != null ? pendingCount : 0%>,
                                <%= paidCount != null ? paidCount : 0%>,
                                <%= cancelledCount != null ? cancelledCount : 0%>
                            ],
                            backgroundColor: ['rgba(230, 126, 34, 0.8)', 'rgba(39, 174, 96, 0.8)', 'rgba(231, 76, 60, 0.8)'],
                            borderColor: ['#e67e22', '#27ae60', '#e74c3c'],
                            borderWidth: 2,
                            borderRadius: 5,
                            barThickness: 40
                        }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {display: true, text: 'Số lượng', font: {size: 14}},
                            grid: {color: 'rgba(0, 0, 0, 0.05)'}
                        },
                        x: {grid: {display: false}}
                    },
                    plugins: {
                        legend: {display: false},
                        tooltip: {
                            backgroundColor: '#34495e',
                            titleFont: {size: 14},
                            bodyFont: {size: 12},
                            padding: 10
                        }
                    },
                    animation: {duration: 1500, easing: 'easeOutBounce'}
                }
            });

            // Biểu đồ tròn cho tỷ lệ trạng thái
            const ctxPie = document.getElementById('statusPieChart').getContext('2d');
            const statusPieChart = new Chart(ctxPie, {
                type: 'pie',
                data: {
                    labels: ['Chưa thanh toán', 'Đã thanh toán', 'Đã hủy'],
                    datasets: [{
                            data: [
                                <%= pendingPercent%>,
                                <%= paidPercent%>,
                                <%= cancelledPercent%>
                            ],
                            backgroundColor: ['#e67e22', '#27ae60', '#e74c3c'],
                            borderColor: '#fff',
                            borderWidth: 2
                        }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {font: {size: 14}, padding: 20}
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.label || '';
                                    if (label)
                                        label += ': ';
                                    label += context.parsed.toFixed(1) + '%';
                                    return label;
                                }
                            },
                            backgroundColor: '#34495e',
                            titleFont: {size: 14},
                            bodyFont: {size: 12},
                            padding: 10
                        }
                    },
                    animation: {duration: 1000, easing: 'easeInOutQuad'}
                }
            });
        </script>
    </body>
</html>