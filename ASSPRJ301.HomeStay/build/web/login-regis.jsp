<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Đăng nhập & Đăng ký</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/login-regis.css">
</head>
<body>
    <%@include file="header.jsp" %> 

    <div class="login-container">
        <!-- Form đăng nhập -->
        <div class="form-wrapper" id="loginForm" style="<%= request.getAttribute("showRegisterForm") != null && (boolean) request.getAttribute("showRegisterForm") ? "display: none;" : ""%>">
            <h2 class="form-title">Đăng nhập</h2>
            <% if (request.getAttribute("errorMessage") != null) { %>
                <div class="message error-message"><%= request.getAttribute("errorMessage") %></div>
            <% } %>
            <% if (request.getAttribute("successMessage") != null) { %>
                <div class="message success-message"><%= request.getAttribute("successMessage") %></div>
            <% } %>
            <form action="login" method="post">
                <input type="hidden" name="action" value="login" />
                <div class="form-group">
                    <label for="userId">Tên đăng nhập</label>
                    <div class="input-container">
                        <input type="text" id="userId" name="txtUsername" value="<%= request.getParameter("txtUsername") != null ? request.getParameter("txtUsername") : ""%>" required />
                        <i class="fas fa-user"></i>
                    </div>
                    <% if (request.getAttribute("errorUsername") != null) { %>
                        <p class="error"><%= request.getAttribute("errorUsername") %></p>
                    <% } %>
                </div>
                <div class="form-group">
                    <label for="password">Mật khẩu</label>
                    <div class="input-container">
                        <input type="password" id="password" name="txtPassword" required />
                        <i class="fas fa-lock"></i>
                    </div>
                    <% if (request.getAttribute("errorPassword") != null) { %>
                        <p class="error"><%= request.getAttribute("errorPassword") %></p>
                    <% } %>
                </div>
                <button type="submit" class="submit-btn">Đăng nhập</button>
            </form>
            <p class="switch-form">Chưa có tài khoản? <a href="#" onclick="showRegister()">Đăng ký ngay</a></p>
            <p class="switch-form"><a href="forgotPassword">Quên mật khẩu?</a></p>
        </div>

        <!-- Form đăng ký -->
        <div class="form-wrapper" id="registerForm" style="<%= request.getAttribute("showRegisterForm") != null && (boolean) request.getAttribute("showRegisterForm") ? "" : "display: none;"%>">
            <h2 class="form-title">Đăng ký</h2>
            <% if (request.getAttribute("errorMessage") != null && request.getAttribute("showRegisterForm") != null && (boolean) request.getAttribute("showRegisterForm")) { %>
                <div class="message error-message"><%= request.getAttribute("errorMessage") %></div>
            <% } %>
            <% if (request.getAttribute("successMessage") != null && (request.getAttribute("showRegisterForm") == null || !(boolean) request.getAttribute("showRegisterForm"))) { %>
                <div class="message success-message"><%= request.getAttribute("successMessage") %></div>
            <% } %>
            <form action="register" method="post">
                <div class="form-group">
                    <label for="newUsername">Tên đăng nhập</label>
                    <div class="input-container">
                        <input type="text" id="newUsername" name="txtNewUsername" value="<%= request.getParameter("txtNewUsername") != null ? request.getParameter("txtNewUsername") : ""%>" required />
                        <i class="fas fa-user"></i>
                    </div>
                    <% if (request.getAttribute("errorNewUsername") != null) { %>
                        <p class="error"><%= request.getAttribute("errorNewUsername") %></p>
                    <% } %>
                </div>
                <div class="form-group">
                    <label for="fullName">Họ và tên</label>
                    <div class="input-container">
                        <input type="text" id="fullName" name="txtFullName" value="<%= request.getParameter("txtFullName") != null ? request.getParameter("txtFullName") : ""%>" required />
                        <i class="fas fa-id-card"></i>
                    </div>
                    <% if (request.getAttribute("errorFullName") != null) { %>
                        <p class="error"><%= request.getAttribute("errorFullName") %></p>
                    <% } %>
                </div>
                <div class="form-group">
                    <label for="gmail">Gmail</label>
                    <div class="input-container">
                        <input type="email" id="gmail" name="txtGmail" value="<%= request.getParameter("txtGmail") != null ? request.getParameter("txtGmail") : ""%>" required />
                        <i class="fas fa-envelope"></i>
                    </div>
                    <% if (request.getAttribute("errorGmail") != null) { %>
                        <p class="error"><%= request.getAttribute("errorGmail") %></p>
                    <% } %>
                </div>
                <div class="form-group">
                    <label for="sdt">Số điện thoại</label>
                    <div class="input-container">
                        <input type="text" id="sdt" name="txtSdt" value="<%= request.getParameter("txtSdt") != null ? request.getParameter("txtSdt") : ""%>" />
                        <i class="fas fa-phone"></i>
                    </div>
                    <% if (request.getAttribute("errorSdt") != null) { %>
                        <p class="error"><%= request.getAttribute("errorSdt") %></p>
                    <% } %>
                </div>
                <div class="form-group">
                    <label for="newPassword">Mật khẩu</label>
                    <div class="input-container">
                        <input type="password" id="newPassword" name="txtNewPassword" required />
                        <i class="fas fa-lock"></i>
                    </div>
                    <% if (request.getAttribute("errorNewPassword") != null) { %>
                        <p class="error"><%= request.getAttribute("errorNewPassword") %></p>
                    <% } %>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Nhập lại mật khẩu</label>
                    <div class="input-container">
                        <input type="password" id="confirmPassword" name="txtConfirmPassword" required />
                        <i class="fas fa-lock"></i>
                    </div>
                    <% if (request.getAttribute("errorConfirmPassword") != null) { %>
                        <p class="error"><%= request.getAttribute("errorConfirmPassword") %></p>
                    <% } %>
                </div>
                <button type="submit" class="submit-btn">Đăng ký</button>
            </form>
            <p class="switch-form">Đã có tài khoản? <a href="#" onclick="showLogin()">Đăng nhập</a></p>
        </div>
    </div>

    <%@include file="footer.jsp" %>

    <script>
        function showRegister() {
            document.getElementById("loginForm").style.display = "none";
            document.getElementById("registerForm").style.display = "block";
        }

        function showLogin() {
            document.getElementById("registerForm").style.display = "none";
            document.getElementById("loginForm").style.display = "block";
        }

        window.onload = function () {
            <% if (request.getAttribute("showRegisterForm") != null && (boolean) request.getAttribute("showRegisterForm")) { %>
                showRegister();
            <% } else { %>
                showLogin();
            <% } %>
        };
    </script>
</body>
</html>