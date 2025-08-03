<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="dto.UserDTO"%>
<%@page import="dao.NotificationDAO"%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Header</title>
    <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/header.css">
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">🏡 KiBaKa Homestay</div>
            <nav>
                <ul class="nav-links">
                    <li><a href="<%= request.getContextPath()%>/home.jsp">Trang chủ</a></li>
                    <li><a href="<%= request.getContextPath()%>/search.jsp">Homestay</a></li>
                    <li><a href="<%= request.getContextPath()%>/services.jsp">Dịch vụ</a></li>
                    <li><a href="<%= request.getContextPath()%>/contact.jsp">Liên hệ</a></li>
                    <%
                        UserDTO user = (UserDTO) session.getAttribute("user");
                        NotificationDAO notificationDAO = new NotificationDAO();
                        int unreadCount = (user != null) ? notificationDAO.getUnreadCount(user.getUserID()) : 0;
                    %>
                    <li>
                        <a href="<%= request.getContextPath()%>/notifications.jsp">
                            Thông báo
                            <% if (unreadCount > 0) { %>
                            <span class="notification-count"><%= unreadCount %></span>
                            <% } %>
                        </a>
                    </li>
                    <%
                        if (user != null && "AD".equals(user.getRoleID())) {
                    %>
                    <li><a href="<%= request.getContextPath()%>/admin/dashboard.jsp">Admin Dashboard</a></li>
                    <% } %>
                </ul>
            </nav>
            <div class="header-right">
                <%
                    if (user != null) {
                        String fullName = user.getFullName();
                        String avatarInitial = fullName != null && !fullName.isEmpty() ? fullName.substring(0, 1).toUpperCase() : "U";
                %>
                <div class="user-info">
                    <div class="user-avatar">
                        <% if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {%>
                        <img src="<%= user.getAvatarUrl()%>" alt="Avatar">
                        <% } else {%>
                        <span><%= avatarInitial%></span>
                        <% } %>
                    </div>
                    <ul class="dropdown-menu">
                        <li class="user-profile">
                            <div class="avatar">
                                <% if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {%>
                                <img src="<%= user.getAvatarUrl()%>" alt="Avatar">
                                <% } else {%>
                                <span><%= avatarInitial%></span>
                                <% }%>
                            </div>
                            <span class="name"><%= fullName != null ? fullName : "Người dùng"%></span>
                        </li>
                        <li><a href="<%= request.getContextPath()%>/viewBookings">Đơn của tôi</a></li>
                        <li><a href="<%= request.getContextPath()%>/profile.jsp">Thông tin cá nhân</a></li>
                        <li><a href="<%= request.getContextPath()%>/login?action=logout">Đăng xuất</a></li>
                    </ul>
                </div>
                <% } else {%>
                <a href="<%= request.getContextPath()%>/login-regis.jsp" class="login-btn">Đăng nhập</a>
                <% }%>
            </div>
            <div class="menu-toggle">☰</div>
        </div>
    </header>

    <script src="<%= request.getContextPath()%>/assets/js/header.js"></script>
</body>
</html>