<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="dto.ContactMessageDTO"%>
<%@page import="java.util.List"%>
<%@page import="java.text.SimpleDateFormat"%>
<% request.setCharacterEncoding("UTF-8");%>
<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quản lý tin nhắn - Admin</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <link rel="stylesheet" href="<%= request.getContextPath()%>/assets/css/admin-messages.css">
    </head>
    <body>
        <div class="header-container">
            <%@include file="../header.jsp" %>
        </div>

        <div class="main-content">
            <div class="messages-container">
                <h1>Quản lý tin nhắn</h1>
                <a href="<%= request.getContextPath()%>/admin/dashboard.jsp" class="back-link"><i class="fas fa-arrow-left"></i> Quay lại Dashboard</a>

                <%
                    String successMessage = (String) request.getAttribute("successMessage");
                    String errorMessage = (String) request.getAttribute("errorMessage");
                    String infoMessage = (String) request.getAttribute("infoMessage");
                    if (successMessage != null && !successMessage.isEmpty()) {
                %>
                <div class="message success"><%= successMessage%></div>
                <%
                } else if (errorMessage != null && !errorMessage.isEmpty()) {
                %>
                <div class="message error"><%= errorMessage%></div>
                <%
                } else if (infoMessage != null && !infoMessage.isEmpty()) {
                %>
                <div class="message info"><%= infoMessage%></div>
                <%
                    }
                %>

                <%
                    List<ContactMessageDTO> messageList = (List<ContactMessageDTO>) request.getAttribute("messageList");
                    SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
                    if (messageList == null || messageList.isEmpty()) {
                %>
                <p class="no-data">Không có tin nhắn nào từ người dùng.</p>
                <%
                } else {
                    // Phân trang
                    final int ITEMS_PER_PAGE = 5; // Số lượng tin nhắn trên mỗi trang
                    int currentPage = 1;
                    String pageParam = request.getParameter("page");
                    if (pageParam != null) {
                        try {
                            currentPage = Integer.parseInt(pageParam);
                        } catch (NumberFormatException e) {
                            currentPage = 1;
                        }
                    }

                    int totalMessages = messageList.size();
                    int totalPages = (int) Math.ceil((double) totalMessages / ITEMS_PER_PAGE);
                    if (currentPage < 1) {
                        currentPage = 1;
                    }
                    if (currentPage > totalPages) {
                        currentPage = totalPages;
                    }

                    int start = (currentPage - 1) * ITEMS_PER_PAGE;
                    int end = Math.min(start + ITEMS_PER_PAGE, totalMessages);
                    List<ContactMessageDTO> messagesToShow = totalMessages > 0 ? messageList.subList(start, end) : messageList;
                %>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Người gửi</th>
                            <th>Email</th>
                            <th>Điện thoại</th>
                            <th>Tin nhắn</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <%
                            for (ContactMessageDTO message : messagesToShow) {
                                String statusClass = message.isRead() ? "read" : "unread";
                                String displayStatus = message.isRead() ? "Đã đọc" : "Chưa đọc";
                        %>
                        <tr>
                            <td><%= message.getId()%></td>
                            <td>
                                <%= message.getFullName()%>
                                <% if (message.getUserId() != null) {%>
                                (<%= message.getUserId()%>)
                                <% }%>
                            </td>
                            <td><%= message.getEmail()%></td>
                            <td><%= message.getPhone() != null ? message.getPhone() : ""%></td>
                            <td><%= message.getMessage()%></td>
                            <td><%= dateFormat.format(message.getCreatedAt())%></td>
                            <td class="status <%= statusClass%>"><%= displayStatus%></td>
                            <td>
                                <% if (!message.isRead()) {%>
                                <form action="<%= request.getContextPath()%>/admin/messages?action=markAsRead" method="post" style="display:inline;">
                                    <input type="hidden" name="messageId" value="<%= message.getId()%>">
                                    <input type="hidden" name="page" value="<%= currentPage%>">
                                    <button type="submit" class="btn btn-mark-read"><i class="fas fa-check"></i> Đánh dấu đã đọc</button>
                                </form>
                                <% } %>
                            </td>
                        </tr>
                        <%
                            }
                        %>
                    </tbody>
                </table>

                <!-- Phân trang -->
                <div class="pagination">
                    <% if (currentPage > 1) {%>
                    <a href="<%= request.getContextPath()%>/admin/messages?page=<%= currentPage - 1%>">Trang trước</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang trước</a>
                    <% } %>

                    <% for (int i = 1; i <= totalPages; i++) {%>
                    <a href="<%= request.getContextPath()%>/admin/messages?page=<%= i%>" class="<%= (i == currentPage) ? "active" : ""%>"><%= i%></a>
                    <% } %>

                    <% if (currentPage < totalPages) {%>
                    <a href="<%= request.getContextPath()%>/admin/messages?page=<%= currentPage + 1%>">Trang sau</a>
                    <% } else { %>
                    <a href="#" class="disabled">Trang sau</a>
                    <% } %>
                </div>
                <%
                    }
                %>
            </div>
        </div>

        <div class="footer-container">
            <%@include file="../footer.jsp" %>
        </div>
    </body>
</html>