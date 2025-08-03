<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ page import="dto.RoomDTO" %>
<%@ page import="dto.ReviewDTO" %>
<%@ page import="dao.ReviewDAO" %>
<%@ page import="dao.UserDAO" %>
<%@ page import="dto.UserDTO" %>
<%@ page import="java.util.List" %>
<%@ page import="java.text.SimpleDateFormat" %>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chi tiết phòng</title>
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/room-details.css">
        <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
    </head>
    <body>
        <div class="header-container">
            <%@include file="header.jsp" %>
        </div>

        <div class="main-content">
            <%
                RoomDTO room = (RoomDTO) request.getAttribute("room");
                if (room == null) {
            %>
            <div style="text-align: center; margin-top: 50px;">
                <h2 style="font-size: 28px; color: #2c3e50;">Không tìm thấy thông tin phòng!</h2>
                <a href="home.jsp" class="btn-book" style="background: linear-gradient(45deg, #5DC1B9, #4ECDC4); padding: 12px 25px; font-size: 18px;">Quay lại trang chủ</a>
            </div>
            <%
            } else {
            %>

            <div class="room-layout">
                <!-- Phần 1: Gallery (Bên trái) -->
                <div class="room-gallery-section">
                    <div class="room-gallery">
                        <%
                            List<String> detailImages = room.getDetailImages();
                            if (detailImages == null || detailImages.isEmpty()) {
                                detailImages = new java.util.ArrayList<String>();
                                detailImages.add(room.getImageUrl());
                            } else if (!detailImages.contains(room.getImageUrl())) {
                                detailImages.add(0, room.getImageUrl());
                            }
                            for (int i = 0; i < detailImages.size(); i++) {
                                String imageUrl = detailImages.get(i);
                                String activeClass = (i == 0) ? "active" : "";
                        %>
                        <img src="<%= imageUrl%>" alt="<%= room.getName()%>" class="<%= activeClass%>">
                        <%
                            }
                        %>
                        <button class="prev" onclick="changeImage(-1)">❮</button>
                        <button class="next" onclick="changeImage(1)">❯</button>
                    </div>
                </div>

                <!-- Phần giữa: Thông tin chi tiết (Có thể cuộn) -->
                <div class="scrollable-content">
                    <div class="room-info-section">
                        <h2><%= room.getName()%></h2>
                        <p><%= room.getDescription() != null ? room.getDescription() : "Chưa có mô tả"%></p>
                        <p><strong>Giá:</strong> <%= String.format("%,.0f", room.getPrice())%>đ / đêm</p>
                        <p><strong>Tiện nghi:</strong> <%= room.getAmenities() != null ? room.getAmenities() : "Không có thông tin"%></p>
                        <p><strong>Đánh giá:</strong> <%= String.format("%.1f", room.getAverageRating())%> ⭐ (<%= room.getReviewCount()%> đánh giá)</p>

                        <!-- Amenities -->
                        <div class="room-amenities">
                            <h3>Tiện ích</h3>
                            <div class="amenities-list">
                                <div class="amenity-item"><i class="fas fa-wifi"></i><p>Wifi miễn phí</p></div>
                                <div class="amenity-item"><i class="fas fa-swimming-pool"></i><p>Hồ bơi</p></div>
                                <div class="amenity-item"><i class="fas fa-parking"></i><p>Bãi đỗ xe</p></div>
                                <div class="amenity-item"><i class="fas fa-utensils"></i><p>Nhiều tiện ích xung quanh</p></div>
                            </div>
                        </div>

                        <!-- Reviews -->
                        <div class="room-reviews">
                            <h3>Đánh giá</h3>
                            <% if (user != null) {%>
                            <div class="review-form">
                                <h4>Viết đánh giá của bạn</h4>
                                <form action="submit-review" method="post">
                                    <input type="hidden" name="roomId" value="<%= room.getId()%>">
                                    <div class="rating-stars">
                                        <span class="star" data-value="1">★</span>
                                        <span class="star" data-value="2">★</span>
                                        <span class="star" data-value="3">★</span>
                                        <span class="star" data-value="4">★</span>
                                        <span class="star" data-value="5">★</span>
                                    </div>
                                    <input type="hidden" name="rating" id="rating-value" value="0">
                                    <textarea name="comment" placeholder="Nhập bình luận của bạn..." rows="4" required></textarea>
                                    <button type="submit">Gửi đánh giá</button>
                                </form>
                            </div>
                            <% } else { %>
                            <p>Vui lòng <a href="login-regis.jsp">đăng nhập</a> để viết đánh giá.</p>
                            <% } %>

                            <div class="review-list">
                                <%
                                    ReviewDAO reviewDAO = new ReviewDAO();
                                    UserDAO userDAO = new UserDAO();
                                    List<ReviewDTO> reviews = reviewDAO.getReviewsByRoomId(room.getId());
                                    SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");
                                    if (reviews != null && !reviews.isEmpty()) {
                                        for (ReviewDTO review : reviews) {
                                            UserDTO reviewer = userDAO.readById(review.getUserId());
                                            String reviewerName = reviewer != null ? reviewer.getFullName() : review.getUserId();
                                            StringBuilder stars = new StringBuilder();
                                            int rating = (int) review.getRating();
                                            for (int i = 0; i < rating; i++) {
                                                stars.append("⭐");
                                            }
                                %>
                                <div class="review-item">
                                    <p><strong><%= reviewerName%>:</strong></p>
                                    <p class="rating"><%= stars.toString()%></p>
                                    <p><%= review.getComment()%></p>
                                    <p><small><%= sdf.format(review.getCreatedAt())%></small></p>
                                </div>
                                <%
                                    }
                                } else {
                                %>
                                <p>Chưa có đánh giá nào cho phòng này.</p>
                                <%
                                    }
                                %>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Phần 3: Hành động (Bên phải) -->
                <!-- Phần 3: Hành động (Bên phải) -->
                <div class="action-info-section">
                    <div class="price"><%= String.format("%,.0f", room.getPrice())%>đ</div>
                    <div class="rating">
                        Đánh giá: <%= String.format("%.1f", room.getAverageRating())%> <span class="stars">⭐</span> (<%= room.getReviewCount()%> đánh giá)
                    </div>
                    <% if (user != null) {%>
                    <a href="booking.jsp?roomId=<%= room.getId()%>" class="btn-book">Đặt ngay</a>
                    <% } else { %>
                    <a href="login-regis.jsp" class="btn-book">Đăng nhập để đặt</a>
                    <% } %>
                    <!-- Tích hợp phần thông tin liên hệ -->
                    <div class="contact-info">
                        <h4>Liên hệ nhanh</h4>
                        <p><i class="fas fa-phone-alt"></i> 0123 654 789</p>
                        <p><i class="fas fa-envelope"></i> mamproject2024@gmail.com</p>
                        <a href="https://www.facebook.com/mamchildrendreamfoundation/" target="_blank" class="btn-contact" style="background: linear-gradient(45deg, #1877F2, #3B5998);">
                            <i class="fab fa-facebook-f"></i> Liên hệ qua Facebook
                        </a>
                        <a href="https://www.instagram.com/" target="_blank" class="btn-contact" style="background: linear-gradient(45deg, #C13584, #E1306C, #F77737);">
                            <i class="fab fa-instagram"></i> Liên hệ qua Instagram
                        </a>
                        <a href="https://zalo.me/0909123456" target="_blank" class="btn-contact" style="background: linear-gradient(45deg, #00A2FF, #0078D4);">
                            <i class="fas fa-comment-dots"></i> Liên hệ qua Zalo
                        </a>
                    </div>
                </div>
            </div>

            <!-- Phần bản đồ (Nằm dưới cùng) -->
            <div class="room-location">
                <h3>Vị trí</h3>
                <p><strong>Địa chỉ:</strong> S702 Vinhome Grand Park, Quận 9</p>
                <iframe src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=S702%20Vinhomes%20GrandPark,%20Qu%E1%BA%ADn%209+(HomeStay)&t=&z=14&ie=UTF8&iwloc=B&output=embed" allowfullscreen="" loading="lazy"></iframe>
            </div>
            <%
                }
            %>
        </div>

        <div class="footer-container">
            <%@include file="footer.jsp" %>
        </div>

        <script>
            var currentIndex = 0;
            var images = document.querySelectorAll('.room-gallery img');
            function showImage(index) {
                images.forEach(function (img, i) {
                    img.classList.remove('active');
                    if (i === index)
                        img.classList.add('active');
                });
            }
            function changeImage(direction) {
                currentIndex += direction;
                if (currentIndex < 0)
                    currentIndex = images.length - 1;
                else if (currentIndex >= images.length)
                    currentIndex = 0;
                showImage(currentIndex);
            }
            showImage(currentIndex);

            // Rating Stars
            var stars = document.querySelectorAll('.rating-stars .star');
            var ratingInput = document.getElementById('rating-value');
            stars.forEach(function (star) {
                star.addEventListener('click', function () {
                    var value = star.getAttribute('data-value');
                    ratingInput.value = value;
                    stars.forEach(function (s) {
                        s.classList.remove('active');
                        if (s.getAttribute('data-value') <= value)
                            s.classList.add('active');
                    });
                });
            });
        </script>
    </body>
</html>