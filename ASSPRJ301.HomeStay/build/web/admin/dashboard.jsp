<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="dto.UserDTO"%>
<%@page import="dao.ContactDAO"%>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Homestay</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/admin-dashboard.css">
</head>
<body>
    <div class="header-container">
        <%@include file="../header.jsp" %>
    </div>

    <div class="main-content">
        <%
            Object userObj = session.getAttribute("user");
            if (userObj == null || !"AD".equals(((dto.UserDTO) userObj).getRoleID())) {
                response.sendRedirect(request.getContextPath() + "/login-regis.jsp");
            } else {
                ContactDAO contactDAO = new ContactDAO();
                int unreadMessageCount = contactDAO.getUnreadMessageCount();
        %>
        <div class="dashboard-container">
            <h1>Chào mừng Admin: <%= ((UserDTO) userObj).getFullName() %></h1>
            <div class="menu">
                <a href="<%= request.getContextPath() %>/admin/users" class="menu-item"><i class="fas fa-users"></i> Quản lý người dùng</a>
                <a href="<%= request.getContextPath() %>/admin/rooms" class="menu-item"><i class="fas fa-bed"></i> Quản lý phòng</a>
                <a href="<%= request.getContextPath() %>/admin/bookings" class="menu-item"><i class="fas fa-calendar-check"></i> Quản lý đặt phòng</a>
                <a href="<%= request.getContextPath() %>/admin/statistics" class="menu-item"><i class="fas fa-chart-bar"></i> Thống kê</a>
                <a href="<%= request.getContextPath() %>/admin/messages" class="menu-item">
                    <i class="fas fa-envelope"></i> Quản lý tin nhắn
                    <% if (unreadMessageCount > 0) { %>
                    <span class="message-count"><%= unreadMessageCount %></span>
                    <% } %>
                </a>
                <a href="<%= request.getContextPath() %>/admin/promotions" class="menu-item"><i class="fas fa-tag"></i> Quản lý mã khuyến mãi</a>
            </div>
            <a href="<%= request.getContextPath() %>/login?action=logout" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
        </div>
        <%
            }
        %>
    </div>

    <div class="footer-container">
        <%@include file="../footer.jsp" %>
    </div>
</body>
</html>