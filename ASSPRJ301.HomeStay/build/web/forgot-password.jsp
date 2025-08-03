<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Quên mật khẩu</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/forgot-password.css">
</head>
<body>
    <%@include file="header.jsp" %>

    <div class="forgot-password-container">
        <div class="form-wrapper">
            <h2 class="form-title">Quên mật khẩu</h2>
            <% if (request.getAttribute("errorMessage") != null) { %>
                <div class="message error-message"><%= request.getAttribute("errorMessage") %></div>
            <% } %>
            <% if (request.getAttribute("successMessage") != null) { %>
                <div class="message success-message"><%= request.getAttribute("successMessage") %></div>
            <% } %>
            <form action="forgotPassword" method="post">
                <div class="form-group">
                    <label for="email">Email</label>
                    <div class="input-container">
                        <input type="email" id="email" name="email" value="<%= request.getAttribute("email") != null ? request.getAttribute("email") : ""%>" required />
                        <i class="fas fa-envelope"></i>
                    </div>
                </div>
                <button type="submit" class="submit-btn">Gửi liên kết đặt lại</button>
            </form>
            <p class="switch-form"><a href="login-regis.jsp">Quay lại đăng nhập</a></p>
        </div>
    </div>

    <%@include file="footer.jsp" %>
</body>
</html>