<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="dto.UserDTO"%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cập nhật thông tin cá nhân</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/profile.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    </head>
    <body>
        <div class="header-container">
            <%@include file="header.jsp" %>
        </div>

        <div class="main-content">
            <%
                if (user == null) {
                    response.sendRedirect("login-regis.jsp");
                    return;
                }
            %>
            <div class="sidebar">
                <h3>Tài khoản: <%= user.getUserID()%></h3>
                <%
                    String section = request.getParameter("section") != null ? request.getParameter("section") : "profile";
                %>
                <a href="<%= request.getContextPath()%>/profile?section=profile" class="<%= section.equals("profile") ? "active" : ""%>">
                    <i class="fas fa-user"></i> Thông tin cá nhân
                </a>
                <a href="<%= request.getContextPath()%>/profile?section=security" class="<%= section.equals("security") ? "active" : ""%>">
                    <i class="fas fa-shield-alt"></i> Bảo mật
                </a>
            </div>

            <div class="content-area">
                <% if (section.equals("profile")) { %>
                <div class="form-container">
                    <h2>Cập nhật thông tin cá nhân</h2>
                    <%
                        String successMessage = (String) request.getAttribute("successMessage");
                        String errorMessage = (String) request.getAttribute("errorMessage");
                    %>
                    <% if (successMessage != null) {%>
                    <div class="form-message success"><i class="fas fa-check-circle"></i> <%= successMessage%></div>
                    <% } %>
                    <% if (errorMessage != null) {%>
                    <div class="form-message error"><i class="fas fa-exclamation-circle"></i> <%= errorMessage%></div>
                    <% }%>
                    <form action="<%= request.getContextPath()%>/updateProfile" method="post">
                        <input type="hidden" name="userId" value="<%= user.getUserID()%>">
                        <div class="form-group">
                            <label for="fullName">Họ và tên:</label>
                            <div class="input-container">
                                <input type="text" id="fullName" name="fullName" value="<%= user.getFullName() != null ? user.getFullName() : ""%>">
                                <i class="fas fa-id-card"></i>
                            </div>
                            <% if (request.getAttribute("errorFullName") != null) {%>
                            <div class="message error"><i class="fas fa-exclamation-circle"></i> <%= request.getAttribute("errorFullName")%></div>
                            <% }%>
                        </div>
                        <div class="form-group">
                            <label for="gmail">Gmail:</label>
                            <div class="input-container">
                                <input type="email" id="gmail" name="gmail" value="<%= user.getGmail() != null ? user.getGmail() : ""%>"
                                       <%= user.isIsVerified() ? "readonly" : ""%>>
                                <i class="fas fa-envelope"></i>
                            </div>
                            <% if (user.isIsVerified()) { %>
                            <div class="verified-indicator"><i class="fas fa-check-circle"></i> Email đã được xác nhận</div>
                            <% } %>
                            <% if (request.getAttribute("errorGmail") != null) {%>
                            <div class="message error"><i class="fas fa-exclamation-circle"></i> <%= request.getAttribute("errorGmail")%></div>
                            <% }%>
                        </div>
                        <div class="form-group">
                            <label for="sdt">Số điện thoại:</label>
                            <div class="input-container">
                                <input type="text" id="sdt" name="sdt" value="<%= user.getSdt() != null ? user.getSdt() : ""%>">
                                <i class="fas fa-phone"></i>
                            </div>
                            <% if (request.getAttribute("errorSdt") != null) {%>
                            <div class="message error"><i class="fas fa-exclamation-circle"></i> <%= request.getAttribute("errorSdt")%></div>
                            <% }%>
                        </div>
                        <div class="form-group">
                            <label for="avatar">Avatar:</label>
                            <input type="file" id="avatar" name="avatar" accept="image/*">
                            <input type="hidden" id="avatarUrl" name="avatarUrl" value="<%= user.getAvatarUrl() != null ? user.getAvatarUrl() : ""%>">
                            <div id="avatarPreview" class="avatar-preview-container">
                                <% if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {%>
                                <img src="<%= user.getAvatarUrl()%>" alt="Avatar hiện tại" class="avatar-preview">
                                <span class="avatar-preview-caption">Avatar hiện tại</span>
                                <% } else {%>
                                <img src="<%= request.getContextPath()%>/images/default-avatar.png" alt="Avatar mặc định" class="avatar-preview">
                                <span class="avatar-preview-caption">Chưa có avatar</span>
                                <% } %>
                            </div>
                            <% if (request.getAttribute("errorAvatar") != null) {%>
                            <div class="message error"><i class="fas fa-exclamation-circle"></i> <%= request.getAttribute("errorAvatar")%></div>
                            <% } %>
                        </div>
                        <button type="submit"><i class="fas fa-save"></i> Cập nhật</button>
                    </form>
                </div>
                <% } else if (section.equals("security")) { %>
                <div class="form-container">
                    <h2>Đổi mật khẩu</h2>
                    <%
                        String changePassSuccess = (String) request.getAttribute("changePassSuccess");
                        String changePassError = (String) request.getAttribute("changePassError");
                    %>
                    <% if (changePassSuccess != null) {%>
                    <div class="form-message success"><i class="fas fa-check-circle"></i> <%= changePassSuccess%></div>
                    <% } %>
                    <% if (changePassError != null) {%>
                    <div class="form-message error"><i class="fas fa-exclamation-circle"></i> <%= changePassError%></div>
                    <% }%>
                    <form action="<%= request.getContextPath()%>/changePassword" method="post">
                        <input type="hidden" name="userId" value="<%= user.getUserID()%>">
                        <div class="form-group">
                            <label for="currentPassword">Mật khẩu hiện tại:</label>
                            <div class="input-container">
                                <input type="password" id="currentPassword" name="currentPassword" required>
                                <i class="fas fa-lock"></i>
                            </div>
                            <% if (request.getAttribute("errorCurrentPassword") != null) {%>
                            <div class="message error"><i class="fas fa-exclamation-circle"></i> <%= request.getAttribute("errorCurrentPassword")%></div>
                            <% } %>
                        </div>
                        <div class="form-group">
                            <label for="newPassword">Mật khẩu mới:</label>
                            <div class="input-container">
                                <input type="password" id="newPassword" name="newPassword" required>
                                <i class="fas fa-key"></i>
                            </div>
                            <% if (request.getAttribute("errorNewPassword") != null) {%>
                            <div class="message error"><i class="fas fa-exclamation-circle"></i> <%= request.getAttribute("errorNewPassword")%></div>
                            <% } %>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Xác nhận mật khẩu mới:</label>
                            <div class="input-container">
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <% if (request.getAttribute("errorConfirmPassword") != null) {%>
                            <div class="message error"><i class="fas fa-exclamation-circle"></i> <%= request.getAttribute("errorConfirmPassword")%></div>
                            <% } %>
                        </div>
                        <button type="submit"><i class="fas fa-key"></i> Đổi mật khẩu</button>
                    </form>
                </div>
                <% }%>
            </div>
        </div>

        <div class="footer-container">
            <%@include file="footer.jsp" %>
        </div>

        <script>
            $(document).ready(function () {
                // Xử lý upload ảnh avatar và hiển thị preview
                $('#avatar').on('change', function () {
                    const file = this.files[0];
                    const $avatarPreview = $('#avatarPreview');
                    $avatarPreview.empty(); // Xóa preview cũ trước khi thêm mới
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            $avatarPreview.append('<img src="' + e.target.result + '" alt="Avatar Preview" class="avatar-preview">');
                            $avatarPreview.append('<span class="avatar-preview-caption">Ảnh mới được chọn</span>');
                            $('#avatarUrl').val(e.target.result); // Lưu base64 vào input hidden
                        };
                        reader.readAsDataURL(file);
                    } else {
                        // Giữ giá trị cũ nếu không chọn file mới
                        const currentAvatarUrl = '<%= user.getAvatarUrl() != null ? user.getAvatarUrl() : ""%>';
                        if (currentAvatarUrl) {
                            $avatarPreview.append('<img src="' + currentAvatarUrl + '" alt="Avatar hiện tại" class="avatar-preview">');
                            $avatarPreview.append('<span class="avatar-preview-caption">Avatar hiện tại</span>');
                        } else {
                            $avatarPreview.append('<img src="<%= request.getContextPath()%>/images/default-avatar.png" alt="Avatar mặc định" class="avatar-preview">');
                            $avatarPreview.append('<span class="avatar-preview-caption">Chưa có avatar</span>');
                        }
                        $('#avatarUrl').val(currentAvatarUrl);
                    }
                });
            });
        </script>
    </body>
</html>