<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="java.util.List"%>
<%@page import="dto.RoomDTO"%>
<% request.setCharacterEncoding("UTF-8");%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quản lý phòng - Admin</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/admin-rooms.css">
    </head>
    <body>
        <div class="header-container">
            <%@include file="../header.jsp" %>
        </div>

        <div class="main-content">
            <div class="rooms-container">
                <%
                    Object userObj = session.getAttribute("user");
                    if (userObj == null || !"AD".equals(((dto.UserDTO) userObj).getRoleID())) {
                        response.sendRedirect(request.getContextPath() + "/login-regis.jsp");
                    } else {
                %>
                <h1>Quản lý phòng</h1>
                <a href="<%= request.getContextPath()%>/admin/dashboard.jsp" class="back-link"><i class="fas fa-arrow-left"></i> Quay lại Dashboard</a>
                <button class="btn btn-add" onclick="toggleForm('addForm')"><i class="fas fa-plus"></i> Thêm phòng</button>

                <%
                    String successMessage = (String) request.getAttribute("successMessage");
                    String errorMessage = (String) request.getAttribute("errorMessage");
                    if (successMessage != null) {
                %>
                <div class="message success"><%= successMessage%></div>
                <% } else if (errorMessage != null) {%>
                <div class="message error"><%= errorMessage%></div>
                <% }%>

                <!-- Form thêm phòng -->
                <div class="form-container" id="addForm">
                    <form action="<%= request.getContextPath()%>/admin/rooms?action=add" method="post">
                        <label for="addName">Tên phòng:</label>
                        <input type="text" id="addName" name="name" required>

                        <label for="addDescription">Mô tả:</label>
                        <textarea id="addDescription" name="description"></textarea>

                        <label for="addPrice">Giá (VND):</label>
                        <input type="number" id="addPrice" name="price" step="1000" min="0" required>

                        <label for="addAmenities">Tiện nghi:</label>
                        <input type="text" id="addAmenities" name="amenities">

                        <label for="addImageUpload">Hình ảnh chính:</label>
                        <input type="file" id="addImageUpload" accept="image/*">
                        <input type="hidden" id="addImageUrl" name="imageUrl"> <!-- Lưu base64 -->
                        <div id="addImagePreview" class="image-preview-container"></div>

                        <label for="addDetailImagesUpload">Ảnh chi tiết:</label>
                        <input type="file" id="addDetailImagesUpload" accept="image/*" multiple>
                        <input type="hidden" id="addDetailImages" name="detailImages"> <!-- Lưu base64 -->
                        <div id="addDetailImagesPreview" class="image-preview-container"></div>
                        <div class="note">Chọn nhiều ảnh để hiển thị chi tiết phòng</div>

                        <button type="submit" class="btn btn-add">Lưu</button>
                        <button type="button" class="btn btn-delete" onclick="toggleForm('addForm')">Hủy</button>
                    </form>
                </div>

                <!-- Form sửa phòng -->
                <%
                    RoomDTO editRoom = (RoomDTO) request.getAttribute("editRoom");
                    boolean showEditForm = editRoom != null;
                    String detailImagesText = showEditForm && editRoom.getDetailImages() != null ? String.join("\n", editRoom.getDetailImages()) : "";
                %>
                <div class="form-container <%= showEditForm ? "active" : ""%>" id="editForm">
                    <form action="<%= request.getContextPath()%>/admin/rooms?action=edit" method="post">
                        <input type="hidden" name="roomId" value="<%= showEditForm ? editRoom.getId() : ""%>">

                        <label for="editName">Tên phòng:</label>
                        <input type="text" id="editName" name="name" value="<%= showEditForm ? editRoom.getName() : ""%>" required>

                        <label for="editDescription">Mô tả:</label>
                        <textarea id="editDescription" name="description"><%= showEditForm && editRoom.getDescription() != null ? editRoom.getDescription() : ""%></textarea>

                        <label for="editPrice">Giá (VND):</label>
                        <input type="number" id="editPrice" name="price" step="1000" min="0" value="<%= showEditForm ? editRoom.getPrice() : ""%>" required>

                        <label for="editAmenities">Tiện nghi:</label>
                        <input type="text" id="editAmenities" name="amenities" value="<%= showEditForm && editRoom.getAmenities() != null ? editRoom.getAmenities() : ""%>">

                        <label for="editImageUpload">Hình ảnh chính:</label>
                        <input type="file" id="editImageUpload" accept="image/*">
                        <input type="hidden" id="editImageUrl" name="imageUrl" value="<%= showEditForm && editRoom.getImageUrl() != null ? editRoom.getImageUrl() : ""%>"> <!-- Lưu base64 -->
                        <div id="editImagePreview" class="image-preview-container">
                            <% if (showEditForm && editRoom.getImageUrl() != null && !editRoom.getImageUrl().isEmpty()) {%>
                            <img src="<%= editRoom.getImageUrl()%>" alt="Preview" class="image-preview">
                            <% }%>
                        </div>

                        <label for="editDetailImagesUpload">Ảnh chi tiết:</label>
                        <input type="file" id="editDetailImagesUpload" accept="image/*" multiple>
                        <input type="hidden" id="editDetailImages" name="detailImages" value="<%= detailImagesText%>"> <!-- Lưu base64 -->
                        <div id="editDetailImagesPreview" class="image-preview-container">
                            <% if (showEditForm && editRoom.getDetailImages() != null) {
                                    for (String img : editRoom.getDetailImages()) {%>
                            <img src="<%= img%>" alt="Detail Preview" class="image-preview">
                            <%  }
                                } %>
                        </div>
                        <div class="note">Chọn nhiều ảnh để hiển thị chi tiết phòng</div>

                        <button type="submit" class="btn btn-add">Lưu</button>
                        <button type="button" class="btn btn-delete" onclick="toggleForm('editForm')">Hủy</button>
                    </form>
                </div>

                <%
                    List<RoomDTO> roomList = (List<RoomDTO>) request.getAttribute("roomList");
                    if (roomList == null || roomList.isEmpty()) {
                %>
                <p class="no-data">Không có phòng nào trong hệ thống.</p>
                <%
                } else {
                    // Phân trang
                    final int ITEMS_PER_PAGE = 5; // Số lượng phòng trên mỗi trang
                    int currentPage = 1;
                    String pageParam = request.getParameter("page");
                    if (pageParam != null) {
                        try {
                            currentPage = Integer.parseInt(pageParam);
                        } catch (NumberFormatException e) {
                            currentPage = 1;
                        }
                    }

                    int totalRooms = roomList.size();
                    int totalPages = (int) Math.ceil((double) totalRooms / ITEMS_PER_PAGE);
                    if (currentPage < 1) {
                        currentPage = 1;
                    }
                    if (currentPage > totalPages) {
                        currentPage = totalPages;
                    }

                    int start = (currentPage - 1) * ITEMS_PER_PAGE;
                    int end = Math.min(start + ITEMS_PER_PAGE, totalRooms);
                    List<RoomDTO> roomsToShow = totalRooms > 0 ? roomList.subList(start, end) : roomList;
                %>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên phòng</th>
                            <th>Mô tả</th>
                            <th>Giá (VND)</th>
                            <th>Tiện nghi</th>
                            <th>Đánh giá</th>
                            <th>Hình ảnh chính</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (RoomDTO room : roomsToShow) {%>
                        <tr>
                            <td><%= room.getId()%></td>
                            <td><%= room.getName()%></td>
                            <td><%= room.getDescription() != null ? room.getDescription() : "Chưa có mô tả"%></td>
                            <td><%= String.format("%,.0f", room.getPrice())%></td>
                            <td><%= room.getAmenities() != null ? room.getAmenities() : "Chưa có tiện nghi"%></td>
                            <td><%= room.getAverageRating()%></td>
                            <td>
                                <% if (room.getImageUrl() != null && !room.getImageUrl().isEmpty()) {%>
                                <img src="<%= room.getImageUrl()%>" alt="Hình ảnh chính" class="image-preview" onerror="this.src='<%= request.getContextPath()%>/images/placeholder.jpg';">
                                <% } else { %>
                                Chưa có ảnh
                                <% }%>
                            </td>
                            <td class="actions">
                                <a href="<%= request.getContextPath()%>/admin/rooms?action=edit&roomId=<%= room.getId()%>&page=<%= currentPage%>" class="btn btn-edit"><i class="fas fa-edit"></i> Sửa</a>
                                <button class="btn btn-delete" onclick="confirmDelete('<%= room.getId()%>', <%= currentPage%>)"><i class="fas fa-trash"></i> Xóa</button>
                            </td>
                        </tr>
                        <% } %>
                    </tbody>
                </table>

                <!-- Phân trang -->
                <div class="pagination">
                    <% if (currentPage > 1) {%>
                    <a href="<%= request.getContextPath()%>/admin/rooms?page=<%= currentPage - 1%>">Trang trước</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang trước</a>
                    <% } %>

                    <% for (int i = 1; i <= totalPages; i++) {%>
                    <a href="<%= request.getContextPath()%>/admin/rooms?page=<%= i%>" class="<%= (i == currentPage) ? "active" : ""%>"><%= i%></a>
                    <% } %>

                    <% if (currentPage < totalPages) {%>
                    <a href="<%= request.getContextPath()%>/admin/rooms?page=<%= currentPage + 1%>">Trang sau</a>
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
            $(document).ready(function () {
                // Xử lý upload ảnh chính cho form thêm phòng
                $('#addImageUpload').on('change', function () {
                    const file = this.files[0];
                    const $imagePreview = $('#addImagePreview');
                    $imagePreview.empty(); // Xóa preview cũ trước khi thêm mới
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            $imagePreview.append('<img src="' + e.target.result + '" alt="Preview" class="image-preview">');
                            $('#addImageUrl').val(e.target.result); // Lưu base64 vào input ẩn
                        };
                        reader.readAsDataURL(file);
                    } else {
                        $('#addImageUrl').val('');
                    }
                });

                // Xử lý upload ảnh chi tiết cho form thêm phòng
                $('#addDetailImagesUpload').on('change', function () {
                    const files = this.files;
                    const $detailImagesPreview = $('#addDetailImagesPreview');
                    const $detailImagesTextarea = $('#addDetailImages');
                    $detailImagesPreview.empty(); // Xóa preview cũ trước khi thêm mới
                    $detailImagesTextarea.val('');
                    if (files && files.length > 0) {
                        for (let i = 0; i < files.length; i++) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                $detailImagesPreview.append('<img src="' + e.target.result + '" alt="Detail Preview" class="image-preview">');
                                $detailImagesTextarea.val($detailImagesTextarea.val() + e.target.result + '\n');
                            };
                            reader.readAsDataURL(files[i]);
                        }
                    }
                });

                // Xử lý upload ảnh chính cho form sửa phòng
                $('#editImageUpload').on('change', function () {
                    const file = this.files[0];
                    const $imagePreview = $('#editImagePreview');
                    $imagePreview.empty(); // Xóa preview cũ trước khi thêm mới
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            $imagePreview.append('<img src="' + e.target.result + '" alt="Preview" class="image-preview">');
                            $('#editImageUrl').val(e.target.result); // Lưu base64 vào input ẩn
                        };
                        reader.readAsDataURL(file);
                    } else {
                        $('#editImageUrl').val('');
                    }
                });

                // Xử lý upload ảnh chi tiết cho form sửa phòng
                $('#editDetailImagesUpload').on('change', function () {
                    const files = this.files;
                    const $detailImagesPreview = $('#editDetailImagesPreview');
                    const $detailImagesTextarea = $('#editDetailImages');
                    $detailImagesPreview.empty(); // Xóa preview cũ trước khi thêm mới
                    $detailImagesTextarea.val('');
                    if (files && files.length > 0) {
                        for (let i = 0; i < files.length; i++) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                $detailImagesPreview.append('<img src="' + e.target.result + '" alt="Detail Preview" class="image-preview">');
                                $detailImagesTextarea.val($detailImagesTextarea.val() + e.target.result + '\n');
                            };
                            reader.readAsDataURL(files[i]);
                        }
                    }
                });

                // Giữ nguyên các hàm toggleForm và confirmDelete
                window.toggleForm = function (formId) {
                    const form = document.getElementById(formId);
                    form.classList.toggle('active');
                };

                window.confirmDelete = function (roomId, page) {
                    if (confirm("Bạn có chắc chắn muốn xóa phòng này không?")) {
                        window.location.href = '<%= request.getContextPath()%>/admin/rooms?action=delete&roomId=' + roomId + '&page=' + page;
                    }
                };
            });
        </script>
    </body>
</html>