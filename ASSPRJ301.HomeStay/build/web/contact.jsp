<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="dto.UserDTO"%>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liên hệ - Homestay</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
    <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/contact.css">
</head>
<body>
    <%@include file="header.jsp" %>

    <div class="contact-container">
        <div class="contact-hero animate__animated animate__fadeInDown">
            <h2><i class="fas fa-paper-plane"></i> Liên Hệ Với Chúng Tôi</h2>
            <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7. Đừng ngần ngại liên hệ với chúng tôi qua các phương thức bên dưới.</p>
        </div>

        <% 
            String successMessage = (String) request.getAttribute("successMessage");
            String errorMessage = (String) request.getAttribute("errorMessage");
            if (successMessage != null && !successMessage.isEmpty()) {
        %>
            <div class="success-message animate__animated animate__bounceIn">
                <i class="fas fa-check-circle" style="margin-right: 10px; font-size: 1.2rem;"></i> <%= successMessage %>
            </div>
        <% 
            } else if (errorMessage != null && !errorMessage.isEmpty()) {
        %>
            <div class="error-message animate__animated animate__bounceIn">
                <i class="fas fa-exclamation-circle" style="margin-right: 10px; font-size: 1.2rem;"></i> <%= errorMessage %>
            </div>
        <% 
            } 
        %>

        <div class="card contact-info animate__animated animate__fadeInLeft">
            <h3><i class="fas fa-info-circle"></i> Thông Tin Liên Hệ</h3>
            <p><strong>Địa chỉ:</strong> Vinhomes Grand Park</p>
            <p><strong>Điện thoại:</strong> 0901 234 567</p>
            <p><strong>Email:</strong> mamproject2024@gmail.com</p>
            <p><strong>Giờ làm việc:</strong> 08:00 - 22:00 (Hằng ngày)</p>
        </div>

        <div class="card contact-form animate__animated animate__fadeInRight">
            <h3><i class="fas fa-envelope-open-text"></i> Gửi Tin Nhắn</h3>
            <%
                if (user != null) {
                    String userId = user.getUserID();
                    String fullName = user.getFullName();
                    String email = user.getGmail();
                    String phone = user.getSdt();
            %>
                <form id="contactForm" action="<%=request.getContextPath()%>/ContactController" method="post">
                    <input type="hidden" name="userId" value="<%=userId%>">
                    <div class="form-group">
                        <input type="text" class="form-control" name="fullName" value="<%=fullName%>" readonly required>
                        <label class="form-label"></label>
                    </div>
                    <div class="form-group">
                        <input type="email" class="form-control" name="email" value="<%=email%>" readonly required>
                        <label class="form-label"></label>
                    </div>
                    <div class="form-group">
                        <input type="tel" class="form-control" name="phone" value="<%=phone%>" readonly>
                        <label class="form-label"></label>
                    </div>
                    <div class="form-group">
                        <textarea class="form-control" name="message" required placeholder=" "></textarea>
                        <label class="form-label">Nội dung tin nhắn</label>
                    </div>
                    <button type="submit" class="btn-submit">
                        <i class="fas fa-paper-plane" style="margin-right: 8px;"></i> Gửi
                    </button>
                </form>
            <%
                } else {
            %>
                <div class="info-message animate__animated animate__bounceIn">
                    <i class="fas fa-info-circle" style="margin-right: 10px; font-size: 1.2rem;"></i>
                    Vui lòng <a href="<%=request.getContextPath()%>/login-regis.jsp" style="color: #3498db; text-decoration: underline;">đăng nhập</a> để gửi tin nhắn!
                </div>
            <%
                }
            %>
        </div>

        <div class="card map animate__animated animate__fadeInUp">
            <h3><i class="fas fa-map-marked-alt"></i> Bản Đồ</h3>
            <div class="map-wrapper">
                <iframe src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=S702%20Vinhomes%20GrandPark,%20Qu%E1%BA%ADn%209+(HomeStay)&t=&z=14&ie=UTF8&iwloc=B&output=embed" allowfullscreen></iframe>
            </div>
        </div>

        <div class="card faq animate__animated animate__fadeInLeft">
            <h3><i class="fas fa-question-circle"></i> Câu Hỏi Thường Gặp</h3>
            <div class="faq-item">
                <div class="faq-question"><i class="fas fa-chevron-right"></i> Tôi có thể đặt phòng qua điện thoại không?</div>
                <div class="faq-answer">Có, bạn có thể gọi hotline để đặt phòng nhanh chóng.</div>
            </div>
            <div class="faq-item">
                <div class="faq-question"><i class="fas fa-chevron-right"></i> Chính sách hoàn hủy như thế nào?</div>
                <div class="faq-answer">Vui lòng liên hệ chúng tôi để biết thêm chi tiết.</div>
            </div>
        </div>

        <div class="card social-links animate__animated animate__fadeInRight">
            <h3><i class="fas fa-share-alt"></i> Kết Nối Với Chúng Tôi</h3>
            <div class="social-media">
                <a href="https://www.facebook.com/mamchildrendreamfoundation" target="_blank" class="social-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook">
                </a>
                <a href="https://www.instagram.com/" target="_blank" class="social-item">
                    <img src="https://cdn.pixabay.com/photo/2016/08/09/17/52/instagram-1581266_640.jpg" alt="Instagram">
                </a>
                <a href="https://zalo.me/" target="_blank" class="social-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1024px-Icon_of_Zalo.svg.png" alt="Zalo">
                </a>
            </div>
        </div>
    </div>


    <button id="back-to-top" class="back-to-top" aria-label="Quay lại đầu trang">
        <i class="fas fa-chevron-up"></i>
    </button>

    <script src="<%= request.getContextPath()%>/assets/js/contact.js"></script>
</body>
</html>