<%@page import="dto.UserDTO"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <title>Trang chủ - Homestay</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/services.css">  
        <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
    </head>
    <body>
        <div class="header-container">
            <%@include file="header.jsp" %>
        </div>

        <div class="main-content">
            <div class="banner">
                <div class="banner-slider">
                    <div class="slide">
                        <div class="banner-content">
                            <h1>Chào mừng đến với Homestay của chúng tôi!</h1>
                            <p>Trải nghiệm không gian thư giãn và dịch vụ tuyệt vời.</p>
                        </div>
                    </div>
                    <div class="slide">
                        <div class="banner-content">
                            <h1>Khám phá không gian tuyệt đẹp</h1>
                            <p>Thư giãn giữa thiên nhiên xanh mát tại homestay của chúng tôi.</p>
                        </div>
                    </div>
                    <div class="slide">
                        <div class="banner-content">
                            <h1>Dịch vụ cao cấp dành cho bạn</h1>
                            <p>Hưởng thụ sự sang trọng và tiện nghi đỉnh cao.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Intro Section (Chữ chạy từ trái sang phải kiểu biển LED) -->
            <section class="intro">
                <div class="intro-content">
                    <div class="text-container">
                        <h2>Về chúng tôi</h2>
                    </div>
                    <div class="text-container">
                        <p>Homestay của chúng tôi mang đến không gian ấm cúng, tiện nghi và sạch sẽ, giúp bạn cảm thấy như đang ở nhà. Đội ngũ nhân viên thân thiện, luôn sẵn sàng hỗ trợ để mang lại trải nghiệm tốt nhất cho khách hàng. Chúng tôi cam kết cung cấp dịch vụ chất lượng với mức giá hợp lý, giúp bạn tận hưởng kỳ nghỉ trọn vẹn.</p>
                    </div>
                </div>
                <div class="intro-image">
                    <img src="https://ik.imagekit.io/tvlk/blog/2022/11/homestay-da-lat-view-dep-23.png" alt="Homestay Image">
                </div>
            </section>

            <!-- Services Section -->
            <section class="services-section">
                <h2>Dịch vụ nổi bật</h2>
                <div class="services-grid">
                    <!-- Service 1: Infinity Pool (Hình bên trái, nội dung bên phải) -->
                    <div class="service-item service-item-left">
                        <div class="service-image">
                            <img src="https://tecwood.com.vn/upload/mau-ho-boi-dep.jpg" alt="Bể bơi bốn mùa">
                        </div>
                        <div class="service-content">
                            <h3>Bể bơi bốn mùa</h3>
                            <p>Bể bơi bốn mùa trong nhà tại tầng 4 của khách sạn, với công nghệ làm ấm nước và điều nhiệt độ liên tục, là nơi quý khách có thể tận hưởng không gian thư giãn và rèn luyện cơ thể 4 mùa trong năm.</p>
                        </div>
                    </div>

                    <!-- Service 2: Gym & Yoga (Hình bên phải, nội dung bên trái) -->
                    <div class="service-item service-item-right">
                        <div class="service-image">
                            <img src="https://www.vietnambooking.com/wp-content/uploads/2017/10/khach-san-co-phong-tap-the-hinh-khong-7-7-2018-2.jpg" alt="Câu lạc bộ Gym & Yoga">
                        </div>
                        <div class="service-content">
                            <h3>Câu lạc bộ Gym & Yoga</h3>
                            <p>Tận hưởng không gian rèn luyện sức khỏe với những trang thiết bị hiện đại nhất tại câu lạc bộ Gym & Yoga trong khách sạn. Tiện ích này đáp ứng mọi nhu cầu tập luyện của quý khách.</p>
                        </div>
                    </div>

                    <!-- Service 3: Spa & Massage (Hình bên trái, nội dung bên phải) -->
                    <div class="service-item service-item-left">
                        <div class="service-image">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3sji02LlMhmx8utCHFTcadOeppqb3NbXD4Q&s" alt="Spa & Massage">
                        </div>
                        <div class="service-content">
                            <h3>Spa & Massage</h3>
                            <p>Trải nghiệm thư giãn tuyệt đối với các liệu trình spa cao cấp và massage chuyên nghiệp, giúp bạn phục hồi năng lượng sau ngày dài.</p>
                        </div>
                    </div>

                    <!-- Service 4: Nhà hàng sang trọng (Hình bên phải, nội dung bên trái) -->
                    <div class="service-item service-item-right">
                        <div class="service-image">
                            <img src="https://halotravel.vn/wp-content/uploads/2021/02/nha-hang-sang-trong-sai-gon-the-log-1024x682.jpg" alt="Nhà hàng sang trọng">
                        </div>
                        <div class="service-content">
                            <h3>Nhà hàng sang trọng</h3>
                            <p>Thưởng thức các món ăn tinh tế từ khắp nơi trên thế giới, với không gian sang trọng và dịch vụ chuyên nghiệp.</p>
                        </div>
                    </div>

                    <!-- Service 5: Bar & Lounge (Hình bên trái, nội dung bên phải) -->
                    <div class="service-item service-item-left">
                        <div class="service-image">
                            <img src="https://acihome.vn/uploads/19/quay-bar-resort-cao-cap-doc-dao.jpg" alt="Bar & Lounge">
                        </div>
                        <div class="service-content">
                            <h3>Bar & Lounge</h3>
                            <p>Khu vực bar và lounge hiện đại, nơi bạn có thể thư giãn với đồ uống yêu thích và ngắm cảnh đêm tuyệt đẹp.</p>
                        </div>
                    </div>

                    <!-- Service 6: Tour & Trải nghiệm địa phương (Hình bên phải, nội dung bên trái) -->
                    <div class="service-item service-item-right">
                        <div class="service-image">
                            <img src="https://dalatravel.vn/wp-content/uploads/2021/03/tai-sao-nen-dat-tour-du-lich-da-lat-thay-vi-di-du-lich-tu-tuc-1.jpg" alt="Tour & Trải nghiệm địa phương">
                        </div>
                        <div class="service-content">
                            <h3>Tour & Trải nghiệm địa phương</h3>
                            <p>Khám phá văn hóa địa phương với các tour du lịch được thiết kế riêng, mang đến trải nghiệm độc đáo và ý nghĩa.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div class="footer-container">
            <%@include file="footer.jsp" %>
        </div>

        <!-- JavaScript cho carousel banner -->
        <script>
            let slideIndex = 0;
            const slides = document.querySelectorAll('.slide');

            function showSlide(index) {
                slides.forEach(slide => slide.classList.remove('active'));
                slides[index].classList.add('active');
            }

            function nextSlide() {
                slideIndex = (slideIndex + 1) % slides.length;
                showSlide(slideIndex);
            }

            // Tự động chuyển slide mỗi 5 giây (5000ms)
            setInterval(nextSlide, 5000);

            // Hiển thị slide đầu tiên khi tải trang
            showSlide(slideIndex);
        </script>
    </body>
</html>