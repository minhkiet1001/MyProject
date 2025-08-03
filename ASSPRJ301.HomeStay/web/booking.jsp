<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="dto.RoomDTO, dao.RoomDAO"%>
<%@page import="java.util.List"%>

<%
    String roomIdParam = request.getParameter("roomId");
    RoomDAO roomDAO = new RoomDAO();
    RoomDTO room = null;

    if (roomIdParam != null && !roomIdParam.trim().isEmpty()) {
        int roomId = Integer.parseInt(roomIdParam);
        room = roomDAO.getRoomById(roomId);
    }

    String successMessage = (String) request.getAttribute("successMessage");
    String errorMessage = (String) request.getAttribute("errorMessage");
%>

<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt phòng - Homestay</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            /* Reset CSS */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
            }

            body {
                background-color: #f4f7fa;
                color: #333;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }

            .header-container, .footer-container {
                width: 100%;
                z-index: 1000;
            }

            .header-container {
                position: fixed;
                top: 0;
                left: 0;
                height: 70px;
                box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            }

            .footer-container {
                position: relative;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 80px;
                z-index: 999;
            }

            .main-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                padding: 100px 0 80px;
                overflow: auto;
                max-width: 1300px;
                margin: 0 auto;
                width: 90%;
            }

            .booking-container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                padding: 0;
                margin-bottom: 40px;
                overflow: hidden;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
            }

            .booking-container:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
            }

            .room-slideshow-container {
                position: relative;
                height: 100%;
                overflow: hidden;
            }

            .room-slideshow {
                position: relative;
                height: 100%;
                width: 100%;
                overflow: hidden;
            }

            .room-slideshow img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: none;
                transition: opacity 0.5s ease-in-out;
            }

            .room-slideshow img.active {
                display: block;
            }

            .slideshow-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.4));
                z-index: 1;
            }

            .slideshow-controls {
                position: absolute;
                bottom: 20px;
                left: 0;
                width: 100%;
                display: flex;
                justify-content: center;
                gap: 10px;
                z-index: 2;
            }

            .slideshow-indicator {
                width: 40px;
                height: 4px;
                background: rgba(255,255,255,0.5);
                border-radius: 2px;
                cursor: pointer;
                transition: background 0.3s ease;
            }

            .slideshow-indicator.active {
                background: #fff;
            }

            .prev, .next {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.8);
                color: #333;
                border: none;
                width: 40px;
                height: 40px;
                cursor: pointer;
                border-radius: 50%;
                font-size: 18px;
                z-index: 2;
                transition: all 0.3s ease;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .prev:hover, .next:hover {
                background: rgba(255, 255, 255, 0.95);
                transform: translateY(-50%) scale(1.1);
            }

            .prev { left: 20px; }
            .next { right: 20px; }

            .booking-content {
                padding: 40px;
                display: flex;
                flex-direction: column;
            }

            .booking-details {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-bottom: 30px;
            }

            .booking-room-name {
                font-size: 34px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 5px;
                line-height: 1.2;
            }

            .booking-description {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin-bottom: 25px;
            }

            .detail-item {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                color: #555;
                margin-bottom: 10px;
            }

            .detail-item i {
                color: #4ECDC4;
                width: 20px;
                text-align: center;
            }

            .detail-item strong {
                color: #2c3e50;
                margin-right: 5px;
            }

            .price-tag {
                display: inline-block;
                background: linear-gradient(135deg, #4ECDC4, #2E9990);
                color: white;
                padding: 8px 16px;
                border-radius: 30px;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
            }

            .amenities-list {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-top: 10px;
            }

            .amenity-tag {
                background: #f1f8f7;
                color: #2E9990;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .amenity-tag i {
                font-size: 12px;
            }

            .ratings-display {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .stars {
                color: #FFD700;
                font-size: 18px;
            }

            .booking-form-container {
                background: #f1f8f7;
                border-radius: 15px;
                padding: 25px;
                margin-top: auto;
            }

            .form-title {
                font-size: 22px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .form-title i {
                color: #4ECDC4;
            }

            .booking-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .booking-form label {
                font-size: 15px;
                font-weight: 500;
                color: #2c3e50;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .booking-form label i {
                color: #4ECDC4;
            }

            .booking-form input[type="date"],
            .booking-form input[type="text"] {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                font-size: 15px;
                transition: all 0.3s ease;
                background: #fff;
            }

            .booking-form input[type="date"]:focus,
            .booking-form input[type="text"]:focus {
                border-color: #4ECDC4;
                outline: none;
                box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
            }

            .total-price {
                background: white;
                padding: 15px;
                border-radius: 10px;
                font-size: 18px;
                font-weight: 600;
                color: #2c3e50;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }

            .total-price-amount {
                color: #4ECDC4;
                font-size: 22px;
            }

            .btn-book {
                display: inline-block;
                margin-top: 20px;
                padding: 15px 30px;
                background: linear-gradient(45deg, #4ECDC4, #2E9990);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                font-size: 18px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
                border: none;
                cursor: pointer;
                width: 100%;
                text-align: center;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }

            .btn-book:hover {
                background: linear-gradient(45deg, #2E9990, #4ECDC4);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(78, 205, 196, 0.5);
            }

            .btn-book:disabled {
                background: #95a5a6;
                cursor: not-allowed;
                box-shadow: none;
                transform: none;
            }

            .btn-book i {
                font-size: 16px;
            }

            .btn-reset {
                display: inline-block;
                padding: 10px 20px;
                background: linear-gradient(45deg, #e74c3c, #c0392b);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
                border: none;
                cursor: pointer;
                width: auto;
                text-align: center;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }

            .btn-reset:hover {
                background: linear-gradient(45deg, #c0392b, #e74c3c);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(231, 76, 60, 0.5);
            }

            .message {
                padding: 12px 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                font-size: 15px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .message i {
                font-size: 18px;
            }

            .message.error {
                background: #ffefef;
                color: #e74c3c;
                border-left: 4px solid #e74c3c;
            }

            .message.success {
                background: #ebfbf5;
                color: #27ae60;
                border-left: 4px solid #27ae60;
            }

            .availability-message {
                padding: 12px 15px;
                border-radius: 10px;
                margin-top: 15px;
                font-size: 15px;
                font-weight: 500;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: all 0.3s ease;
            }

            .availability-message i {
                font-size: 16px;
            }

            .availability-message.available {
                background: #ebfbf5;
                color: #27ae60;
                border-left: 4px solid #27ae60;
            }

            .availability-message.unavailable {
                background: #ffefef;
                color: #e74c3c;
                border-left: 4px solid #e74c3c;
            }

            .btn-back {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                margin-top: 20px;
                padding: 14px 25px;
                background: linear-gradient(45deg, #4ECDC4, #2E9990);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
            }

            .btn-back:hover {
                background: linear-gradient(45deg, #2E9990, #4ECDC4);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(78, 205, 196, 0.5);
            }

            .no-room-container {
                text-align: center;
                margin-top: 80px;
                background: white;
                padding: 50px 30px;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            }

            .no-room-icon {
                font-size: 60px;
                color: #95a5a6;
                margin-bottom: 20px;
            }

            .no-room-title {
                font-size: 28px;
                color: #2c3e50;
                margin-bottom: 20px;
            }

            @media (max-width: 992px) {
                .booking-container {
                    grid-template-columns: 1fr;
                }

                .room-slideshow-container {
                    height: 400px;
                }
            }

            @media (max-width: 768px) {
                .main-content {
                    padding: 90px 0 70px;
                    width: 95%;
                }

                .booking-content {
                    padding: 30px 20px;
                }

                .booking-room-name {
                    font-size: 26px;
                }

                .room-slideshow-container {
                    height: 300px;
                }

                .detail-item, .booking-description {
                    font-size: 15px;
                }

                .amenity-tag {
                    font-size: 13px;
                }

                .price-tag {
                    font-size: 16px;
                }

                .form-title {
                    font-size: 20px;
                }

                .booking-form label {
                    font-size: 14px;
                }

                .booking-form input[type="date"] {
                    padding: 10px;
                    font-size: 14px;
                }

                .total-price {
                    font-size: 16px;
                }

                .total-price-amount {
                    font-size: 20px;
                }

                .btn-book {
                    padding: 14px 20px;
                    font-size: 16px;
                }

                .message, .availability-message {
                    font-size: 14px;
                    padding: 10px;
                }
            }
        </style>
    </head>
    <body>
        <div class="header-container">
            <%@include file="header.jsp" %>
        </div>

        <div class="main-content">
            <%
                if (room == null) {
            %>
            <div class="no-room-container">
                <i class="fas fa-home-alt no-room-icon"></i>
                <h2 class="no-room-title">Không tìm thấy thông tin phòng!</h2>
                <a href="home.jsp" class="btn-back"><i class="fas fa-arrow-left"></i> Quay lại trang chủ</a>
            </div>
            <%
            } else {
            %>
            <div class="booking-container">
                <div class="room-slideshow-container">
                    <div class="room-slideshow">
                        <%
                            List<String> detailImages = room.getDetailImages();
                            if (detailImages == null || detailImages.isEmpty()) {
                                detailImages = new java.util.ArrayList<>();
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
                        <div class="slideshow-overlay"></div>
                        <button class="prev" onclick="changeImage(-1)"><i class="fas fa-chevron-left"></i></button>
                        <button class="next" onclick="changeImage(1)"><i class="fas fa-chevron-right"></i></button>

                        <div class="slideshow-controls">
                            <%
                                for (int i = 0; i < detailImages.size(); i++) {
                                    String activeClass = (i == 0) ? "active" : "";
                            %>
                            <div class="slideshow-indicator <%= activeClass%>" onclick="showImageDirect(<%= i%>)"></div>
                            <%
                                }
                            %>
                        </div>
                    </div>
                </div>

                <div class="booking-content">
                    <div class="booking-details">
                        <h1 class="booking-room-name"><%= room.getName()%></h1>
                        <div class="price-tag"><i class="fas fa-tag"></i> <span id="room-price"><%= room.getPrice()%></span> đ / đêm</div>

                        <p class="booking-description"><%= room.getDescription()%></p>

                        <div class="detail-item">
                            <i class="fas fa-star"></i>
                            <div class="ratings-display">
                                <strong>Đánh giá:</strong>
                                <div class="stars">
                                    <%
                                        double rating = room.getAverageRating();
                                        for (int i = 1; i <= 5; i++) {
                                            if (i <= rating) {
                                    %>
                                    <i class="fas fa-star"></i>
                                    <%
                                    } else if (i - rating < 1 && i - rating > 0) {
                                    %>
                                    <i class="fas fa-star-half-alt"></i>
                                    <%
                                    } else {
                                    %>
                                    <i class="far fa-star"></i>
                                    <%
                                            }
                                        }
                                    %>
                                </div>
                                (<%= room.getAverageRating()%>)
                            </div>
                        </div>

                        <div class="detail-item">
                            <i class="fas fa-wifi"></i>
                            <div>
                                <strong>Tiện nghi:</strong>
                                <div class="amenities-list">
                                    <%
                                        String amenities = room.getAmenities();
                                        if (amenities != null && !amenities.isEmpty()) {
                                            String[] amenitiesList = amenities.split(",");
                                            for (String amenity : amenitiesList) {
                                                amenity = amenity.trim();
                                                String icon = "fas fa-check";

                                                if (amenity.toLowerCase().contains("wifi")) {
                                                    icon = "fas fa-wifi";
                                                } else if (amenity.toLowerCase().contains("điều hòa")) {
                                                    icon = "fas fa-snowflake";
                                                } else if (amenity.toLowerCase().contains("tivi")) {
                                                    icon = "fas fa-tv";
                                                } else if (amenity.toLowerCase().contains("nước")) {
                                                    icon = "fas fa-water";
                                                } else if (amenity.toLowerCase().contains("bếp")) {
                                                    icon = "fas fa-utensils";
                                                } else if (amenity.toLowerCase().contains("giặt")) {
                                                    icon = "fas fa-tshirt";
                                                } else if (amenity.toLowerCase().contains("đỗ xe")) {
                                                    icon = "fas fa-parking";
                                                }
                                    %>
                                    <div class="amenity-tag"><i class="<%= icon%>"></i> <%= amenity%></div>
                                    <%
                                            }
                                        }
                                    %>
                                </div>
                            </div>
                        </div>
                    </div>

                    <% if (errorMessage != null) {%>
                    <div class="message error"><i class="fas fa-exclamation-circle"></i> <%= errorMessage%></div>
                    <% } %>
                    <% if (successMessage != null) {%>
                    <div class="message success"><i class="fas fa-check-circle"></i> <%= successMessage%></div>
                    <% }%>

                    <div class="booking-form-container">
                        <h3 class="form-title"><i class="fas fa-calendar-check"></i> Đặt phòng ngay</h3>

                        <form action="bookRoom" method="post" onsubmit="return validateForm()" class="booking-form">
                            <input type="hidden" name="roomId" value="<%= room.getId()%>">
                            <input type="hidden" id="appliedPromoCode" name="promoCode" value="">
                            <input type="hidden" id="appliedDiscountAmount" name="discountAmount" value="0">

                            <div class="form-group">
                                <label for="checkInDate"><i class="fas fa-calendar-plus"></i> Ngày nhận phòng:</label>
                                <input type="date" id="checkInDate" name="checkInDate" required onchange="checkAvailability()">
                            </div>

                            <div class="form-group">
                                <label for="checkOutDate"><i class="fas fa-calendar-minus"></i> Ngày trả phòng:</label>
                                <input type="date" id="checkOutDate" name="checkOutDate" required onchange="checkAvailability()">
                            </div>

                            <!-- Form mã giảm giá -->
                            <div class="form-group">
                                <label for="promoCode"><i class="fas fa-ticket-alt"></i> Nhập mã giảm giá:</label>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="promoCode" name="promoCodeInput" placeholder="Nhập mã giảm giá">
                                    <button type="button" onclick="applyPromoCode()" class="btn-book" style="padding: 10px 20px; width: auto;">
                                        <i class="fas fa-check"></i> Áp dụng
                                    </button>
                                    <button type="button" onclick="resetPromoCode()" class="btn-reset" style="padding: 10px 20px; width: auto;">
                                        <i class="fas fa-times"></i> Hủy
                                    </button>
                                </div>
                            </div>

                            <!-- Hiển thị thông báo mã giảm giá -->
                            <div id="promo-message" class="availability-message" style="display: none;"></div>

                            <!-- Hiển thị tổng tiền -->
                            <div class="total-price">
                                <span>Tổng tiền:</span>
                                <span class="total-price-amount"><span id="total-price">0</span> đ</span>
                            </div>

                            <!-- Hiển thị số tiền giảm (nếu có) -->
                            <div id="discount-info" class="total-price" style="display: none;">
                                <span>Đã giảm:</span>
                                <span class="total-price-amount"><span id="discount-amount">0</span> đ</span>
                            </div>

                            <!-- Hiển thị giá cuối cùng -->
                            <div class="total-price">
                                <span>Thành tiền:</span>
                                <span class="total-price-amount"><span id="final-price">0</span> đ</span>
                            </div>

                            <div id="availability-message" class="availability-message" style="display: none;"></div>

                            <button type="submit" id="bookButton" class="btn-book" disabled>
                                
                                <i class="fas fa-check-circle"></i> Xác nhận đặt phòng
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <%
                }
            %>
        </div>

        <div class="footer-container">
            <%@include file="footer.jsp" %>
        </div>

        <script>
            let currentIndex = 0;
            const images = document.querySelectorAll('.room-slideshow img');
            const indicators = document.querySelectorAll('.slideshow-indicator');

            function showImage(index) {
                images.forEach((img, i) => {
                    img.classList.remove('active');
                    indicators[i].classList.remove('active');
                    if (i === index) {
                        img.classList.add('active');
                        indicators[i].classList.add('active');
                    }
                });
            }

            function changeImage(direction) {
                currentIndex += direction;
                if (currentIndex < 0) {
                    currentIndex = images.length - 1;
                } else if (currentIndex >= images.length) {
                    currentIndex = 0;
                }
                showImage(currentIndex);
            }

            function showImageDirect(index) {
                currentIndex = index;
                showImage(currentIndex);
            }

            // Auto slideshow
            let slideshowInterval = setInterval(() => {
                changeImage(1);
            }, 5000);

            // Reset interval when manually changing images
            document.querySelector('.room-slideshow').addEventListener('click', () => {
                clearInterval(slideshowInterval);
                slideshowInterval = setInterval(() => {
                    changeImage(1);
                }, 5000);
            });

            showImage(currentIndex);

            function validateForm() {
                let checkIn = new Date(document.getElementById("checkInDate").value);
                let checkOut = new Date(document.getElementById("checkOutDate").value);
                let today = new Date();
                today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison

                if (checkIn < today) {
                    alert("Ngày nhận phòng phải từ hôm nay trở đi.");
                    return false;
                }
                if (checkOut <= checkIn) {
                    alert("Ngày trả phòng phải sau ngày nhận phòng.");
                    return false;
                }
                return true;
            }

            // Biến toàn cục để lưu thông tin giá
            let originalTotalPrice = 0; // Giá gốc trước khi giảm
            let discountAmount = 0; // Số tiền giảm

            function calculateTotal() {
                let pricePerNight = <%= room != null ? room.getPrice() : 0%>;
                let checkIn = new Date(document.getElementById("checkInDate").value);
                let checkOut = new Date(document.getElementById("checkOutDate").value);

                if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && checkOut > checkIn) {
                    let nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                    originalTotalPrice = pricePerNight * nights;
                    document.getElementById("total-price").innerText = originalTotalPrice.toLocaleString();

                    // Cập nhật giá cuối cùng dựa trên số tiền giảm hiện tại
                    let finalPrice = originalTotalPrice - discountAmount;
                    document.getElementById("final-price").innerText = finalPrice.toLocaleString();
                } else {
                    originalTotalPrice = 0;
                    document.getElementById("total-price").innerText = "0";
                    document.getElementById("final-price").innerText = "0";
                    document.getElementById("discount-info").style.display = "none";
                }
            }

            function checkAvailability() {
                let roomId = <%= room != null ? room.getId() : -1%>;
                let checkInDate = document.getElementById("checkInDate").value;
                let checkOutDate = document.getElementById("checkOutDate").value;
                let bookButton = document.getElementById("bookButton");
                let availabilityMessage = document.getElementById("availability-message");

                calculateTotal(); // Tính tổng tiền khi thay đổi ngày

                if (checkInDate && checkOutDate && validateDates()) {
                    let xhr = new XMLHttpRequest();
                    xhr.open("GET", "checkAvailability?roomId=" + roomId + "&checkInDate=" + checkInDate + "&checkOutDate=" + checkOutDate, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            let response = JSON.parse(xhr.responseText);
                            if (response.available) {
                                availabilityMessage.style.display = "flex";
                                availabilityMessage.className = "availability-message available";
                                availabilityMessage.innerHTML = '<i class="fas fa-check-circle"></i> Phòng còn trống cho khoảng thời gian bạn chọn';
                                bookButton.disabled = false;
                            } else {
                                availabilityMessage.style.display = "flex";
                                availabilityMessage.className = "availability-message unavailable";
                                availabilityMessage.innerHTML = '<i class="fas fa-times-circle"></i> Phòng đã được đặt trong khoảng thời gian này';
                                bookButton.disabled = true;
                            }
                        } else if (xhr.readyState === 4) {
                            availabilityMessage.style.display = "flex";
                            availabilityMessage.className = "availability-message unavailable";
                            availabilityMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Lỗi khi kiểm tra trạng thái phòng';
                            bookButton.disabled = true;
                        }
                    };
                    xhr.send();
                } else {
                    availabilityMessage.style.display = "none";
                    bookButton.disabled = true;
                }
            }

            function validateDates() {
                let checkIn = new Date(document.getElementById("checkInDate").value);
                let checkOut = new Date(document.getElementById("checkOutDate").value);
                let today = new Date();
                today.setHours(0, 0, 0, 0);

                return checkIn >= today && checkOut > checkIn;
            }

            function applyPromoCode() {
                let promoCode = document.getElementById("promoCode").value;
                let checkInDate = document.getElementById("checkInDate").value;
                let checkOutDate = document.getElementById("checkOutDate").value;
                let promoMessage = document.getElementById("promo-message");

                if (!promoCode) {
                    promoMessage.style.display = "flex";
                    promoMessage.className = "availability-message unavailable";
                    promoMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng nhập mã giảm giá';
                    return;
                }

                if (!checkInDate || !checkOutDate) {
                    promoMessage.style.display = "flex";
                    promoMessage.className = "availability-message unavailable";
                    promoMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng chọn ngày nhận và trả phòng trước';
                    return;
                }

                if (originalTotalPrice <= 0) {
                    promoMessage.style.display = "flex";
                    promoMessage.className = "availability-message unavailable";
                    promoMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Vui lòng tính tổng tiền trước khi áp dụng mã giảm giá';
                    return;
                }

                let xhr = new XMLHttpRequest();
                xhr.open("POST", "apply-promotion", true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                let response = JSON.parse(xhr.responseText);
                                if (response.success) {
                                    discountAmount = response.discountAmount;
                                    promoMessage.style.display = "flex";
                                    promoMessage.className = "availability-message available";
                                    promoMessage.innerHTML = '<i class="fas fa-check-circle"></i> Áp dụng mã giảm giá thành công! Giảm ' + discountAmount.toLocaleString() + ' đ';

                                    // Cập nhật thông tin giảm giá
                                    document.getElementById("discount-info").style.display = "flex";
                                    document.getElementById("discount-amount").innerText = discountAmount.toLocaleString();
                                    let finalPrice = originalTotalPrice - discountAmount;
                                    document.getElementById("final-price").innerText = finalPrice.toLocaleString();

                                    // Lưu thông tin mã giảm giá và số tiền giảm vào hidden inputs
                                    document.getElementById("appliedPromoCode").value = promoCode;
                                    document.getElementById("appliedDiscountAmount").value = discountAmount;
                                } else {
                                    discountAmount = 0;
                                    promoMessage.style.display = "flex";
                                    promoMessage.className = "availability-message unavailable";
                                    promoMessage.innerHTML = '<i class="fas fa-times-circle"></i> ' + response.message;
                                    document.getElementById("discount-info").style.display = "none";
                                    document.getElementById("final-price").innerText = originalTotalPrice.toLocaleString();

                                    // Reset hidden inputs
                                    document.getElementById("appliedPromoCode").value = "";
                                    document.getElementById("appliedDiscountAmount").value = 0;
                                }
                            } catch (e) {
                                console.error("Lỗi parse JSON:", e);
                                console.log("Phản hồi từ server:", xhr.responseText);
                                promoMessage.style.display = "flex";
                                promoMessage.className = "availability-message unavailable";
                                promoMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Lỗi khi xử lý phản hồi từ server';
                            }
                        } else {
                            console.error("Lỗi HTTP:", xhr.status, xhr.statusText);
                            console.log("Phản hồi từ server:", xhr.responseText);
                            promoMessage.style.display = "flex";
                            promoMessage.className = "availability-message unavailable";
                            promoMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Lỗi khi kiểm tra mã giảm giá (HTTP ' + xhr.status + ')';
                        }
                    }
                };
                xhr.send("promoCode=" + encodeURIComponent(promoCode) + "&totalPrice=" + originalTotalPrice);
            }

            function resetPromoCode() {
                // Reset các giá trị liên quan đến mã giảm giá
                discountAmount = 0;
                document.getElementById("promoCode").value = ""; // Xóa input mã giảm giá
                document.getElementById("promo-message").style.display = "none"; // Ẩn thông báo
                document.getElementById("discount-info").style.display = "none"; // Ẩn phần "Đã giảm"
                document.getElementById("discount-amount").innerText = "0"; // Reset số tiền giảm
                document.getElementById("final-price").innerText = originalTotalPrice.toLocaleString(); // Đưa giá cuối cùng về giá gốc

                // Reset hidden inputs
                document.getElementById("appliedPromoCode").value = "";
                document.getElementById("appliedDiscountAmount").value = 0;
            }

            // Format price display on load
            window.onload = function () {
                const priceElement = document.getElementById("room-price");
                if (priceElement) {
                    const price = parseInt(priceElement.innerText);
                    priceElement.innerText = price.toLocaleString();
                }

                // Set min date for date inputs
                const today = new Date().toISOString().split('T')[0];
                document.getElementById("checkInDate").min = today;
                document.getElementById("checkOutDate").min = today;
            };
        </script>
    </body>
</html>