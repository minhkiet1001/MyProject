<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="java.util.List"%>
<%@page import="dto.RoomDTO"%>
<%@page import="dao.RoomDAO"%>
<%@include file="header.jsp" %>
<%
    RoomDAO roomDAO = new RoomDAO();
    List<RoomDTO> rooms = roomDAO.getAllRooms();
%>

<!DOCTYPE html>
<html lang="vi">
    <head>
        <title>Tìm kiếm Homestay</title>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/search.css">        
    </head>
    <body>
        <div class="main-content">
            <!-- Phần lọc bên trái -->
            <div class="search-container">
                <h2>Tìm kiếm Homestay</h2>
                <a href="<%= request.getContextPath()%>/home.jsp" class="back-link">← Quay lại trang chủ</a>

                <div class="filter-section">
                    <div class="filter-group">
                        <label>Tên Homestay:</label>
                        <input type="text" id="searchName" placeholder="Nhập tên homestay">
                    </div>

                    <div class="price-filter">
                        <label>Giá:</label>
                        <div class="slider-container">
                            <div class="range" id="priceRange"></div>
                            <input type="range" id="minPrice" min="1000000" max="10000000" value="1000000">
                            <input type="range" id="maxPrice" min="1000000" max="10000000" value="10000000">
                        </div>
                        <div class="price-values">
                            <span id="minPriceValue">1.000.000đ</span>
                            <span id="maxPriceValue">10.000.000đ</span>
                        </div>
                    </div>

                    <div class="filter-group">
                        <label>Tiện ích:</label>
                        <select id="amenities">
                            <option value="">Tất cả</option>
                            <option value="WiFi">WiFi</option>
                            <option value="Bể bơi">Bể bơi</option>
                            <option value="Gym">Gym</option>
                        </select>
                    </div>

                    <button id="filterBtn">Lọc ngay</button>
                </div>
            </div>

            <!-- Phần danh sách phòng bên phải -->
            <div class="room-list-container">
                <div class="search-result" id="searchResult">
                    Tìm thấy <%= rooms.size()%> homestay phù hợp
                </div>
                <div id="roomList" class="room-list">
                    <%
                        final int ITEMS_PER_PAGE = 6; // Đặt 6 homestay mỗi trang
                        int currentPage = 1;
                        String pageParam = request.getParameter("page");
                        if (pageParam != null) {
                            try {
                                currentPage = Integer.parseInt(pageParam);
                            } catch (NumberFormatException e) {
                                currentPage = 1;
                            }
                        }

                        int totalRooms = rooms.size();
                        int totalPages = (int) Math.ceil((double) totalRooms / ITEMS_PER_PAGE);
                        if (currentPage < 1) {
                            currentPage = 1;
                        }
                        if (currentPage > totalPages) {
                            currentPage = totalPages;
                        }

                        int start = (currentPage - 1) * ITEMS_PER_PAGE;
                        int end = Math.min(start + ITEMS_PER_PAGE, totalRooms);
                        List<RoomDTO> roomsToShow = totalRooms > 0 ? rooms.subList(start, end) : rooms;

                        for (RoomDTO room : roomsToShow) {
                    %>
                    <div class="room-item">
                        <div class="room-content">
                            <div class="room-image">
                                <img src="<%= room.getImageUrl()%>" alt="Hình ảnh phòng">
                            </div>
                            <h3><%= room.getName()%></h3>
                            <p><i class="fas fa-tag"></i> Khởi giá từ <%= String.format("%,.0f", room.getPrice())%> VND</p>
                            <p><i class="fas fa-wifi"></i> Tiện ích: <%= room.getAmenities() != null ? room.getAmenities() : "Chưa có tiện ích"%></p>
                            <p><i class="fas fa-star"></i> Đánh giá: <%= room.getAverageRating()%>/5</p>
                            <button onclick="roomDetails(<%= room.getId()%>)">Xem chi tiết</button>
                        </div>
                    </div>
                    <% } %>
                </div>

                <!-- Phân trang -->
                <div class="pagination">
                    <% if (currentPage > 1) {%>
                    <a href="<%= request.getContextPath()%>/search.jsp?page=<%= currentPage - 1%>"><i class="fas fa-chevron-left"></i> Trang trước</a>
                    <% } else { %>
                    <a href="#" class="disabled"><i class="fas fa-chevron-left"></i> Trang trước</a>
                    <% } %>

                    <% for (int i = 1; i <= totalPages; i++) {%>
                    <a href="<%= request.getContextPath()%>/search.jsp?page=<%= i%>" class="<%= (i == currentPage) ? "active" : ""%>"><%= i%></a>
                    <% } %>

                    <% if (currentPage < totalPages) {%>
                    <a href="<%= request.getContextPath()%>/search.jsp?page=<%= currentPage + 1%>">Trang sau <i class="fas fa-chevron-right"></i></a>
                        <% } else { %>
                    <a href="#" class="disabled">Trang sau <i class="fas fa-chevron-right"></i></a>
                        <% }%>
                </div>
            </div>
        </div>

        <script>
            $(document).ready(function () {
                const minPriceSlider = document.getElementById("minPrice");
                const maxPriceSlider = document.getElementById("maxPrice");
                const minPriceValue = document.getElementById("minPriceValue");
                const maxPriceValue = document.getElementById("maxPriceValue");
                const priceRange = document.getElementById("priceRange");

                const minPrice = 1000000; // 1 triệu
                const maxPrice = 10000000; // 10 triệu

                function formatPrice(price) {
                    return price.toLocaleString("vi-VN") + "đ";
                }

                function updatePriceRange() {
                    const minVal = parseInt(minPriceSlider.value);
                    const maxVal = parseInt(maxPriceSlider.value);

                    if (minVal > maxVal) {
                        minPriceSlider.value = maxVal;
                        return;
                    }
                    if (maxVal < minVal) {
                        maxPriceSlider.value = minVal;
                        return;
                    }

                    minPriceValue.textContent = formatPrice(minVal);
                    maxPriceValue.textContent = formatPrice(maxVal);

                    const minPercent = ((minVal - minPrice) / (maxPrice - minPrice)) * 100;
                    const maxPercent = ((maxVal - minPrice) / (maxPrice - minPrice)) * 100;
                    priceRange.style.left = minPercent + "%";
                    priceRange.style.width = (maxPercent - minPercent) + "%";
                }

                minPriceSlider.addEventListener("input", updatePriceRange);
                maxPriceSlider.addEventListener("input", updatePriceRange);

                updatePriceRange();

                $("#filterBtn").click(function () {
                    var searchName = $("#searchName").val();
                    var minPrice = $("#minPrice").val();
                    var maxPrice = $("#maxPrice").val();
                    var amenities = $("#amenities").val();
                    var page = <%= currentPage%>; // Lấy trang hiện tại từ server

                    $.ajax({
                        url: "RoomFilterServlet",
                        type: "GET",
                        data: {
                            searchName: searchName,
                            minPrice: minPrice,
                            maxPrice: maxPrice,
                            amenities: amenities,
                            page: page // Gửi thêm tham số page
                        },
                        success: function (response) {
                            $("#roomList").html(response);
                            $("#roomList").css({
                                'display': 'grid',
                                'grid-template-columns': 'repeat(auto-fill, minmax(320px, 1fr))',
                                'gap': '30px',
                                'padding': '20px 0'
                            });

                            // Cập nhật phân trang và kết quả tìm kiếm sau khi lọc
                            updatePaginationAndResult(searchName, minPrice, maxPrice, amenities);
                        },
                        error: function (xhr, status, error) {
                            console.error("Lỗi khi lọc phòng: ", error);
                        }
                    });
                });

                // Hàm cập nhật phân trang và kết quả tìm kiếm
                function updatePaginationAndResult(searchName, minPrice, maxPrice, amenities) {
                    $.ajax({
                        url: "RoomFilterServlet",
                        type: "GET",
                        data: {
                            searchName: searchName,
                            minPrice: minPrice,
                            maxPrice: maxPrice,
                            amenities: amenities,
                            getTotal: true // Tham số để lấy tổng số phòng
                        },
                        success: function (totalRooms) {
                            const totalPages = Math.ceil(totalRooms / <%= ITEMS_PER_PAGE%>);
                            let paginationHtml = '';

                            // Cập nhật kết quả tìm kiếm
                            $("#searchResult").text("Tìm thấy " + totalRooms + " homestay phù hợp");

                            // Cập nhật phân trang
                            if (<%= currentPage%> > 1) {
                                paginationHtml += '<a href="javascript:loadPage(' + (<%= currentPage%> - 1) + ')"><i class="fas fa-chevron-left"></i> Trang trước</a>';
                            } else {
                                paginationHtml += '<a href="#" class="disabled"><i class="fas fa-chevron-left"></i> Trang trước</a>';
                            }

                            for (let i = 1; i <= totalPages; i++) {
                                paginationHtml += '<a href="javascript:loadPage(' + i + ')" class="' + (i == <%= currentPage%> ? "active" : "") + '">' + i + '</a>';
                            }

                            if (<%= currentPage%> < totalPages) {
                                paginationHtml += '<a href="javascript:loadPage(' + (<%= currentPage%> + 1) + ')">Trang sau <i class="fas fa-chevron-right"></i></a>';
                            } else {
                                paginationHtml += '<a href="#" class="disabled">Trang sau <i class="fas fa-chevron-right"></i></a>';
                            }

                            $(".pagination").html(paginationHtml);
                        },
                        error: function (xhr, status, error) {
                            console.error("Lỗi khi lấy tổng số phòng: ", error);
                        }
                    });
                }

                // Hàm tải trang khi nhấp vào phân trang
                window.loadPage = function (page) {
                    var searchName = $("#searchName").val();
                    var minPrice = $("#minPrice").val();
                    var maxPrice = $("#maxPrice").val();
                    var amenities = $("#amenities").val();

                    $.ajax({
                        url: "RoomFilterServlet",
                        type: "GET",
                        data: {
                            searchName: searchName,
                            minPrice: minPrice,
                            maxPrice: maxPrice,
                            amenities: amenities,
                            page: page
                        },
                        success: function (response) {
                            $("#roomList").html(response);
                            $("#roomList").css({
                                'display': 'grid',
                                'grid-template-columns': 'repeat(auto-fill, minmax(320px, 1fr))',
                                'gap': '30px',
                                'padding': '20px 0'
                            });
                            updatePaginationAndResult(searchName, minPrice, maxPrice, amenities); // Cập nhật lại phân trang và kết quả
                        },
                        error: function (xhr, status, error) {
                            console.error("Lỗi khi tải trang: ", error);
                        }
                    });
                };
            });

            function roomDetails(roomId) {
                window.location.href = "room-details?roomId=" + roomId;
            }
        </script>
    </body>
</html>