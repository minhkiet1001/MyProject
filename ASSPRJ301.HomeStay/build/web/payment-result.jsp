<%-- 
    Document   : payment-result
    Created on : Mar 14, 2025, 10:38:41 PM
    Author     : cbao
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <title>Kết quả thanh toán</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .message { font-size: 24px; margin-bottom: 20px; }
        .success { color: #27ae60; }
        .error { color: #e74c3c; }
        a { text-decoration: none; color: #1abc9c; font-weight: bold; }
        a:hover { color: #16a085; }
    </style>
</head>
<body>
    <div class="message <%= "0".equals(request.getParameter("resultCode")) ? "success" : "error"%>">
        <%= request.getAttribute("message")%>
    </div>
    <a href="<%= request.getContextPath()%>/viewBookings"><i class="fas fa-arrow-left"></i> Quay lại danh sách đặt phòng</a>
</body>
</html>
