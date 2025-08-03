<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Đặt lại mật khẩu</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/reset-password.css">
</head>
<body>
    <%@include file="header.jsp" %>

    <div class="reset-password-container">
        <div class="form-wrapper">
            <h2 class="form-title">Đặt lại mật khẩu</h2>
            <% if (request.getAttribute("errorMessage") != null) { %>
                <div class="message error-message"><%= request.getAttribute("errorMessage") %></div>
            <% } %>
            <% if (request.getAttribute("successMessage") != null) { %>
                <div class="message success-message"><%= request.getAttribute("successMessage") %></div>
            <% } else { %>
                <form action="resetPassword" method="post">
                    <input type="hidden" name="token" value="<%= request.getAttribute("token") %>">
                    <div class="form-group">
                        <label for="newPassword">Mật khẩu mới</label>
                        <div class="input-container">
                            <input type="password" id="newPassword" name="newPassword" required />
                            <i class="fas fa-lock"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Xác nhận mật khẩu</label>
                        <div class="input-container">
                            <input type="password" id="confirmPassword" name="confirmPassword" required />
                            <i class="fas fa-lock"></i>
                        </div>
                    </div>
                    <button type="submit" class="submit-btn">Đặt lại mật khẩu</button>
                </form>
            <% } %>
            <p class="switch-form"><a href="login-regis.jsp">Quay lại đăng nhập</a></p>
        </div>
    </div>

    <%@include file="footer.jsp" %>
</body>
</html>