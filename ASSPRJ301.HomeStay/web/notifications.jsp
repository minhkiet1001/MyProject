<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="dto.NotificationDTO"%>
<%@page import="dao.NotificationDAO"%>
<%@page import="java.util.List"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="dto.UserDTO"%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thông báo</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/notifications.css">
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    </head>
    <body>
        <div class="header-container">
            <%@include file="header.jsp" %>
        </div>

        <div class="main-content">
            <div class="notifications-container">
                <h2>Thông báo</h2>
                <a href="<%= request.getContextPath()%>/home.jsp" class="back-link"><i class="fas fa-arrow-left"></i> Quay lại trang chủ</a>

                <%
                    if (user == null) {
                %>
                <p class="no-notifications">Vui lòng đăng nhập để xem thông báo!</p>
                <%
                } else {
                    List<NotificationDTO> notifications = notificationDAO.getNotificationsByUserId(user.getUserID());
                    SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");

                    // Phân trang
                    final int ITEMS_PER_PAGE = 5; // Số lượng thông báo trên mỗi trang
                    int currentPage = 1;
                    String pageParam = request.getParameter("page");
                    if (pageParam != null) {
                        try {
                            currentPage = Integer.parseInt(pageParam);
                        } catch (NumberFormatException e) {
                            currentPage = 1;
                        }
                    }

                    int totalNotifications = notifications.size();
                    int totalPages = (int) Math.ceil((double) totalNotifications / ITEMS_PER_PAGE);
                    if (currentPage < 1) {
                        currentPage = 1;
                    }
                    if (currentPage > totalPages) {
                        currentPage = totalPages;
                    }

                    int start = (currentPage - 1) * ITEMS_PER_PAGE;
                    int end = Math.min(start + ITEMS_PER_PAGE, totalNotifications);
                    List<NotificationDTO> notificationsToShow = totalNotifications > 0 ? notifications.subList(start, end) : notifications;

                    if (notifications.isEmpty()) {
                %>
                <p class="no-notifications">Bạn chưa có thông báo nào.</p>
                <%
                } else {
                %>
                <div class="notification-list">
                    <% for (NotificationDTO notification : notificationsToShow) {%>
                    <div class="notification-item <%= notification.isIsRead() ? "" : "unread"%>" id="notification-<%= notification.getNotificationId()%>">
                        <p class="message"><%= notification.getMessage()%></p>
                        <p class="timestamp"><small><%= dateFormat.format(notification.getCreatedAt())%></small></p>
                                <% if (!notification.isIsRead()) {%>
                        <button class="btn-mark-read" onclick="markAsRead(<%= notification.getNotificationId()%>)">Đánh dấu đã đọc</button>
                        <% } %>
                    </div>
                    <% } %>
                </div>

                <!-- Phân trang -->
                <div class="pagination">
                    <% if (currentPage > 1) {%>
                    <a href="<%= request.getContextPath()%>/notifications.jsp?page=<%= currentPage - 1%>">Trang trước</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang trước</a>
                    <% } %>

                    <% for (int i = 1; i <= totalPages; i++) {%>
                    <a href="<%= request.getContextPath()%>/notifications.jsp?page=<%= i%>" class="<%= (i == currentPage) ? "active" : ""%>"><%= i%></a>
                    <% } %>

                    <% if (currentPage < totalPages) {%>
                    <a href="<%= request.getContextPath()%>/notifications.jsp?page=<%= currentPage + 1%>">Trang sau</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang sau</a>
                    <% } %>
                </div>
                <%
                        }
                    }
                %>
            </div>
        </div>

   

        <script>
            function markAsRead(notificationId) {
                $.ajax({
                    url: '<%= request.getContextPath()%>/markNotificationAsRead',
                    type: 'POST',
                    data: {notificationId: notificationId},
                    success: function (response) {
                        const notificationItem = $('#notification-' + notificationId);
                        notificationItem.removeClass('unread');
                        notificationItem.find('.btn-mark-read').fadeOut(300, function () {
                            $(this).remove();
                        });
                        showTempMessage('Thông báo đã được đánh dấu là đã đọc!', 'success');
                    },
                    error: function () {
                        showTempMessage('Có lỗi xảy ra khi đánh dấu đã đọc.', 'error');
                    }
                });
            }

            function showTempMessage(message, type) {
                const tempMessage = $('<div/>', {
                    class: 'temp-message ' + type,
                    text: message
                });
                $('body').append(tempMessage);
                setTimeout(() => tempMessage.remove(), 2000);
            }
        </script>
    </body>
</html>