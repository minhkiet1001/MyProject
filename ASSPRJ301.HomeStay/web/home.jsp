<%@page import="dto.UserDTO"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Trang chủ - Homestay</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/home.css">
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
</head>
<body>
    <div class="header-container">
        <%@include file="header.jsp" %>
    </div>

    <div class="main-content">
        <div class="banner">
            <div class="banner-content">
                <h1>Khám phá Homestay tuyệt vời của bạn!</h1>
                <p>Đặt ngay hôm nay để tận hưởng không gian nghỉ dưỡng đẳng cấp với giá ưu đãi.</p>
                <a href="#highlighted-rooms" class="btn-view-details">Khám phá ngay</a>
            </div>
        </div>

        <section class="intro">
            <h2>Về Homestay của chúng tôi</h2>
            <p>Chào mừng bạn đến với Homestay của sự thư giãn và đẳng cấp. Chúng tôi mang đến không gian sống ấm cúng, tiện nghi hiện đại và dịch vụ tận tâm, giúp bạn có một kỳ nghỉ đáng nhớ giữa lòng thiên nhiên.</p>
        </section>

        <section id="highlighted-rooms" class="highlighted-rooms">
            <h2 class="section-title">Phòng nổi bật</h2>
            <div class="room-grid">
                <div class="room">
                    <img src="https://mia.vn/media/uploads/blog-du-lich/top-11-homestay-ba-vi-01-1700960372.jpeg" alt="Phòng Deluxe">
                    <div class="room-info">
                        <div>
                            <h3>Phòng Deluxe</h3>
                            <p>Không gian ấm cúng, lý tưởng cho các cặp đôi.</p>
                            <p class="price">1.200.000đ / đêm</p>
                        </div>
                        <div class="btn-container">
                            <% if (user != null) { %>
                            <a href="room-details?roomId=21" class="btn-view-details">Xem chi tiết</a>
                            <% } else { %>
                            <a href="login-regis.jsp" class="btn-view-details">Đăng nhập để đặt</a>
                            <% } %>
                        </div>
                    </div>
                </div>

                <div class="room">
                    <img src="https://dongtiengroup.vn/wp-content/uploads/2024/05/thiet-ke-homestay-nha-vuon-5.jpg" alt="Phòng VIP">
                    <div class="room-info">
                        <div>
                            <h3>Phòng VIP</h3>
                            <p>Sang trọng với view biển tuyệt đẹp.</p>
                            <p class="price">1.800.000đ / đêm</p>
                        </div>
                        <div class="btn-container">
                            <% if (user != null) { %>
                            <a href="room-details?roomId=2" class="btn-view-details">Xem chi tiết</a>
                            <% } else { %>
                            <a href="login-regis.jsp" class="btn-view-details">Đăng nhập để đặt</a>
                            <% } %>
                        </div>
                    </div>
                </div>

                <div class="room">
                    <img src="https://sakos.vn/wp-content/uploads/2023/05/momo-upload-api-220510091852-637877711328579007.jpeg" alt="Phòng Gia Đình">
                    <div class="room-info">
                        <div>
                            <h3>Phòng Gia Đình</h3>
                            <p>Rộng rãi, thoáng mát cho cả gia đình.</p>
                            <p class="price">2.500.000đ / đêm</p>
                        </div>
                        <div class="btn-container">
                            <% if (user != null) { %>
                            <a href="room-details?roomId=3" class="btn-view-details">Xem chi tiết</a>
                            <% } else { %>
                            <a href="login-regis.jsp" class="btn-view-details">Đăng nhập để đặt</a>
                            <% } %>
                        </div>
                    </div>
                </div>
            </div>
            <div class="more-rooms">
                <a href="<%= request.getContextPath() %>/search.jsp">Xem nhiều phòng khác tại đây</a>
            </div>
        </section>
    </div>

    <div class="footer-container">
        <%@include file="footer.jsp" %>
    </div>
</body>
</html>