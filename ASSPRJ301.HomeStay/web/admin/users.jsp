<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="java.util.List"%>
<%@page import="dto.UserDTO"%>
<% request.setCharacterEncoding("UTF-8");%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quản lý người dùng - Admin</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/admin-users.css">
    </head>
    <body>
        <div class="header-container">
            <%@include file="../header.jsp" %>
        </div>

        <div class="main-content">
            <div class="users-container">
                <%
                    Object userObj = session.getAttribute("user");
                    if (userObj == null || !"AD".equals(((dto.UserDTO) userObj).getRoleID())) {
                        response.sendRedirect(request.getContextPath() + "/login-regis.jsp");
                    } else {
                %>
                <h1>Quản lý người dùng</h1>
                <a href="<%= request.getContextPath()%>/admin/dashboard.jsp" class="back-link"><i class="fas fa-arrow-left"></i> Quay lại Dashboard</a>
                <button class="btn btn-add" onclick="toggleForm('addForm')"><i class="fas fa-plus"></i> Thêm người dùng</button>

                <%
                    String successMessage = (String) request.getAttribute("successMessage");
                    String errorMessage = (String) request.getAttribute("errorMessage");
                    if (successMessage != null) {
                %>
                <div class="message success"><%= successMessage%></div>
                <% } else if (errorMessage != null) {%>
                <div class="message error"><%= errorMessage%></div>
                <% }%>

                <!-- Form thêm người dùng -->
                <div class="form-container" id="addForm">
                    <form action="<%= request.getContextPath()%>/admin/users?action=add" method="post">
                        <label for="addUserID">ID người dùng:</label>
                        <input type="text" id="addUserID" name="userID" required>

                        <label for="addFullName">Họ và tên:</label>
                        <input type="text" id="addFullName" name="fullName" required>

                        <label for="addRoleID">Vai trò:</label>
                        <select id="addRoleID" name="roleID" required>
                            <option value="US">Người dùng (US)</option>
                            <option value="AD">Admin (AD)</option>
                        </select>

                        <label for="addPassword">Mật khẩu:</label>
                        <input type="password" id="addPassword" name="password" required>

                        <label for="addGmail">Email:</label>
                        <input type="email" id="addGmail" name="gmail" placeholder="example@gmail.com">
                        <div class="note">Email phải đúng định dạng (ví dụ: example@gmail.com)</div>

                        <label for="addSdt">Số điện thoại:</label>
                        <input type="text" id="addSdt" name="sdt" placeholder="+84912345678">
                        <div class="note">Số điện thoại từ 9-12 số, có thể bắt đầu bằng +</div>

                        <button type="submit" class="btn btn-add">Lưu</button>
                        <button type="button" class="btn btn-delete" onclick="toggleForm('addForm')">Hủy</button>
                    </form>
                </div>

                <!-- Form sửa người dùng -->
                <%
                    UserDTO editUser = (UserDTO) request.getAttribute("editUser");
                    boolean showEditForm = editUser != null;
                %>
                <div class="form-container <%= showEditForm ? "active" : ""%>" id="editForm">
                    <form action="<%= request.getContextPath()%>/admin/users?action=edit" method="post">
                        <input type="hidden" name="userID" value="<%= showEditForm ? editUser.getUserID() : ""%>">

                        <label for="editFullName">Họ và tên:</label>
                        <input type="text" id="editFullName" name="fullName" value="<%= showEditForm ? editUser.getFullName() : ""%>" required>

                        <label for="editRoleID">Vai trò:</label>
                        <select id="editRoleID" name="roleID" required>
                            <option value="US" <%= showEditForm && "US".equals(editUser.getRoleID()) ? "selected" : ""%>>Người dùng (US)</option>
                            <option value="AD" <%= showEditForm && "AD".equals(editUser.getRoleID()) ? "selected" : ""%>>Admin (AD)</option>
                        </select>

                        <label for="editGmail">Email:</label>
                        <input type="email" id="editGmail" name="gmail" value="<%= showEditForm && editUser.getGmail() != null ? editUser.getGmail() : ""%>" placeholder="example@domain.com">
                        <div class="note">Email phải đúng định dạng (ví dụ: example@domain.com)</div>

                        <label for="editSdt">Số điện thoại:</label>
                        <input type="text" id="editSdt" name="sdt" value="<%= showEditForm && editUser.getSdt() != null ? editUser.getSdt() : ""%>" placeholder="+84912345678">
                        <div class="note">Số điện thoại từ 9-12 số, có thể bắt đầu bằng +</div>

                        <button type="submit" class="btn btn-add">Lưu</button>
                        <button type="button" class="btn btn-delete" onclick="toggleForm('editForm')">Hủy</button>
                    </form>
                </div>

                <%
                    List<UserDTO> userList = (List<UserDTO>) request.getAttribute("userList");
                    if (userList == null || userList.isEmpty()) {
                %>
                <p class="no-data">Không có người dùng nào trong hệ thống.</p>
                <%
                } else {
                    // Phân trang
                    final int ITEMS_PER_PAGE = 5; // Số lượng người dùng trên mỗi trang
                    int currentPage = 1;
                    String pageParam = request.getParameter("page");
                    if (pageParam != null) {
                        try {
                            currentPage = Integer.parseInt(pageParam);
                        } catch (NumberFormatException e) {
                            currentPage = 1;
                        }
                    }

                    int totalUsers = userList.size();
                    int totalPages = (int) Math.ceil((double) totalUsers / ITEMS_PER_PAGE);
                    if (currentPage < 1) {
                        currentPage = 1;
                    }
                    if (currentPage > totalPages) {
                        currentPage = totalPages;
                    }

                    int start = (currentPage - 1) * ITEMS_PER_PAGE;
                    int end = Math.min(start + ITEMS_PER_PAGE, totalUsers);
                    List<UserDTO> usersToShow = totalUsers > 0 ? userList.subList(start, end) : userList;
                %>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Họ và tên</th>
                            <th>Vai trò</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (UserDTO currentUser : usersToShow) {%>
                        <tr>
                            <td><%= currentUser.getUserID()%></td>
                            <td><%= currentUser.getFullName() != null ? currentUser.getFullName() : "Chưa cập nhật"%></td>
                            <td><%= currentUser.getRoleID()%></td>
                            <td><%= currentUser.getGmail() != null ? currentUser.getGmail() : "Chưa cập nhật"%></td>
                            <td><%= currentUser.getSdt() != null ? currentUser.getSdt() : "Chưa cập nhật"%></td>
                            <td class="actions">
                                <a href="<%= request.getContextPath()%>/admin/users?action=edit&userID=<%= currentUser.getUserID()%>&page=<%= currentPage%>" class="btn btn-edit"><i class="fas fa-edit"></i> Sửa</a>
                                <button class="btn btn-delete" onclick="confirmDelete('<%= currentUser.getUserID()%>', <%= currentPage%>)"><i class="fas fa-trash"></i> Xóa</button>
                            </td>
                        </tr>
                        <% } %>
                    </tbody>
                </table>

                <!-- Phân trang -->
                <div class="pagination">
                    <% if (currentPage > 1) {%>
                    <a href="<%= request.getContextPath()%>/admin/users?page=<%= currentPage - 1%>">Trang trước</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang trước</a>
                    <% } %>

                    <% for (int i = 1; i <= totalPages; i++) {%>
                    <a href="<%= request.getContextPath()%>/admin/users?page=<%= i%>" class="<%= (i == currentPage) ? "active" : ""%>"><%= i%></a>
                    <% } %>

                    <% if (currentPage < totalPages) {%>
                    <a href="<%= request.getContextPath()%>/admin/users?page=<%= currentPage + 1%>">Trang sau</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang sau</a>
                    <% } %>
                </div>
                <%
                    }
                %>
                <% }%>
            </div>
        </div>

        <div class="footer-container">
            <%@include file="../footer.jsp" %>
        </div>

        <script>
            function toggleForm(formId) {
                const form = document.getElementById(formId);
                form.classList.toggle('active');
            }

            function confirmDelete(userID, page) {
                if (confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
                    window.location.href = '<%= request.getContextPath()%>/admin/users?action=delete&userID=' + userID + '&page=' + page;
                }
            }
        </script>
    </body>
</html>