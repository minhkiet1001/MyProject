<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý mã khuyến mãi</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/admin-promotions.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="header-container">
        <%@include file="../header.jsp" %>
    </div>

    <div class="main-content">
        <div class="promotions-container">
            <h1>Thêm mã khuyến mãi</h1>
            <% if (request.getAttribute("errorMessage") != null) { %>
                <div class="message error"><%= request.getAttribute("errorMessage") %></div>
            <% } %>
            <% if (request.getAttribute("successMessage") != null) { %>
                <div class="message success"><%= request.getAttribute("successMessage") %></div>
            <% } %>
            <form action="<%= request.getContextPath() %>/admin/promotions?action=add" method="POST">
                <label>Mã khuyến mãi:</label>
                <input type="text" name="code" required><br>

                <label>Loại giảm giá:</label>
                <select name="discountType">
                    <option value="PERCENTAGE">Phần trăm</option>
                    <option value="FIXED">Số tiền cố định</option>
                </select><br>

                <label>Số tiền giảm giá:</label>
                <input type="number" name="discountAmount" step="0.01" required><br>

                <label>Ngày bắt đầu:</label>
                <input type="date" name="startDate" required><br>

                <label>Ngày kết thúc:</label>
                <input type="date" name="endDate" required><br>

                <label>Giới hạn sử dụng (để trống nếu không giới hạn):</label>
                <input type="number" name="usageLimit"><br>

                <button type="submit">Thêm mã khuyến mãi</button>
            </form>
            <a href="<%= request.getContextPath() %>/admin/dashboard.jsp" class="back-link"><i class="fas fa-arrow-left"></i> Quay lại Dashboard</a>
        </div>
    </div>

    <div class="footer-container">
        <%@include file="../footer.jsp" %>
    </div>
</body>
</html>