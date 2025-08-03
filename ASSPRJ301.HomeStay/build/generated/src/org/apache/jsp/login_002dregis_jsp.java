package org.apache.jsp;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;
import dto.UserDTO;
import dao.NotificationDAO;

public final class login_002dregis_jsp extends org.apache.jasper.runtime.HttpJspBase
    implements org.apache.jasper.runtime.JspSourceDependent {

  private static final JspFactory _jspxFactory = JspFactory.getDefaultFactory();

  private static java.util.List<String> _jspx_dependants;

  static {
    _jspx_dependants = new java.util.ArrayList<String>(2);
    _jspx_dependants.add("/header.jsp");
    _jspx_dependants.add("/footer.jsp");
  }

  private org.glassfish.jsp.api.ResourceInjector _jspx_resourceInjector;

  public java.util.List<String> getDependants() {
    return _jspx_dependants;
  }

  public void _jspService(HttpServletRequest request, HttpServletResponse response)
        throws java.io.IOException, ServletException {

    PageContext pageContext = null;
    HttpSession session = null;
    ServletContext application = null;
    ServletConfig config = null;
    JspWriter out = null;
    Object page = this;
    JspWriter _jspx_out = null;
    PageContext _jspx_page_context = null;

    try {
      response.setContentType("text/html;charset=UTF-8");
      pageContext = _jspxFactory.getPageContext(this, request, response,
      			null, true, 8192, true);
      _jspx_page_context = pageContext;
      application = pageContext.getServletContext();
      config = pageContext.getServletConfig();
      session = pageContext.getSession();
      out = pageContext.getOut();
      _jspx_out = out;
      _jspx_resourceInjector = (org.glassfish.jsp.api.ResourceInjector) application.getAttribute("com.sun.appserv.jsp.resource.injector");

      out.write("\n");
      out.write("<!DOCTYPE html>\n");
      out.write("<html lang=\"vi\">\n");
      out.write("<head>\n");
      out.write("    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n");
      out.write("    <title>Đăng nhập & Đăng ký</title>\n");
      out.write("    <link href=\"https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap\" rel=\"stylesheet\">\n");
      out.write("    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css\">\n");
      out.write("    <link rel=\"stylesheet\" href=\"");
      out.print( request.getContextPath());
      out.write("/assets/css/login-regis.css\">\n");
      out.write("</head>\n");
      out.write("<body>\n");
      out.write("    ");
      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("<!DOCTYPE html>\n");
      out.write("<html>\n");
      out.write("<head>\n");
      out.write("    <meta charset=\"UTF-8\">\n");
      out.write("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
      out.write("    <title>Header</title>\n");
      out.write("    <link rel=\"stylesheet\" href=\"");
      out.print( request.getContextPath());
      out.write("/assets/css/header.css\">\n");
      out.write("</head>\n");
      out.write("<body>\n");
      out.write("    <header>\n");
      out.write("        <div class=\"container\">\n");
      out.write("            <div class=\"logo\">🏡 KiBaKa Homestay</div>\n");
      out.write("            <nav>\n");
      out.write("                <ul class=\"nav-links\">\n");
      out.write("                    <li><a href=\"");
      out.print( request.getContextPath());
      out.write("/home.jsp\">Trang chủ</a></li>\n");
      out.write("                    <li><a href=\"");
      out.print( request.getContextPath());
      out.write("/search.jsp\">Homestay</a></li>\n");
      out.write("                    <li><a href=\"");
      out.print( request.getContextPath());
      out.write("/services.jsp\">Dịch vụ</a></li>\n");
      out.write("                    <li><a href=\"");
      out.print( request.getContextPath());
      out.write("/contact.jsp\">Liên hệ</a></li>\n");
      out.write("                    ");

                        UserDTO user = (UserDTO) session.getAttribute("user");
                        NotificationDAO notificationDAO = new NotificationDAO();
                        int unreadCount = (user != null) ? notificationDAO.getUnreadCount(user.getUserID()) : 0;
                    
      out.write("\n");
      out.write("                    <li>\n");
      out.write("                        <a href=\"");
      out.print( request.getContextPath());
      out.write("/notifications.jsp\">\n");
      out.write("                            Thông báo\n");
      out.write("                            ");
 if (unreadCount > 0) { 
      out.write("\n");
      out.write("                            <span class=\"notification-count\">");
      out.print( unreadCount );
      out.write("</span>\n");
      out.write("                            ");
 } 
      out.write("\n");
      out.write("                        </a>\n");
      out.write("                    </li>\n");
      out.write("                    ");

                        if (user != null && "AD".equals(user.getRoleID())) {
                    
      out.write("\n");
      out.write("                    <li><a href=\"");
      out.print( request.getContextPath());
      out.write("/admin/dashboard.jsp\">Admin Dashboard</a></li>\n");
      out.write("                    ");
 } 
      out.write("\n");
      out.write("                </ul>\n");
      out.write("            </nav>\n");
      out.write("            <div class=\"header-right\">\n");
      out.write("                ");

                    if (user != null) {
                        String fullName = user.getFullName();
                        String avatarInitial = fullName != null && !fullName.isEmpty() ? fullName.substring(0, 1).toUpperCase() : "U";
                
      out.write("\n");
      out.write("                <div class=\"user-info\">\n");
      out.write("                    <div class=\"user-avatar\">\n");
      out.write("                        ");
 if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
      out.write("\n");
      out.write("                        <img src=\"");
      out.print( user.getAvatarUrl());
      out.write("\" alt=\"Avatar\">\n");
      out.write("                        ");
 } else {
      out.write("\n");
      out.write("                        <span>");
      out.print( avatarInitial);
      out.write("</span>\n");
      out.write("                        ");
 } 
      out.write("\n");
      out.write("                    </div>\n");
      out.write("                    <ul class=\"dropdown-menu\">\n");
      out.write("                        <li class=\"user-profile\">\n");
      out.write("                            <div class=\"avatar\">\n");
      out.write("                                ");
 if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
      out.write("\n");
      out.write("                                <img src=\"");
      out.print( user.getAvatarUrl());
      out.write("\" alt=\"Avatar\">\n");
      out.write("                                ");
 } else {
      out.write("\n");
      out.write("                                <span>");
      out.print( avatarInitial);
      out.write("</span>\n");
      out.write("                                ");
 }
      out.write("\n");
      out.write("                            </div>\n");
      out.write("                            <span class=\"name\">");
      out.print( fullName != null ? fullName : "Người dùng");
      out.write("</span>\n");
      out.write("                        </li>\n");
      out.write("                        <li><a href=\"");
      out.print( request.getContextPath());
      out.write("/viewBookings\">Đơn của tôi</a></li>\n");
      out.write("                        <li><a href=\"");
      out.print( request.getContextPath());
      out.write("/profile.jsp\">Thông tin cá nhân</a></li>\n");
      out.write("                        <li><a href=\"");
      out.print( request.getContextPath());
      out.write("/login?action=logout\">Đăng xuất</a></li>\n");
      out.write("                    </ul>\n");
      out.write("                </div>\n");
      out.write("                ");
 } else {
      out.write("\n");
      out.write("                <a href=\"");
      out.print( request.getContextPath());
      out.write("/login-regis.jsp\" class=\"login-btn\">Đăng nhập</a>\n");
      out.write("                ");
 }
      out.write("\n");
      out.write("            </div>\n");
      out.write("            <div class=\"menu-toggle\">☰</div>\n");
      out.write("        </div>\n");
      out.write("    </header>\n");
      out.write("\n");
      out.write("    <script src=\"");
      out.print( request.getContextPath());
      out.write("/assets/js/header.js\"></script>\n");
      out.write("</body>\n");
      out.write("</html>");
      out.write(" \n");
      out.write("\n");
      out.write("    <div class=\"login-container\">\n");
      out.write("        <!-- Form đăng nhập -->\n");
      out.write("        <div class=\"form-wrapper\" id=\"loginForm\" style=\"");
      out.print( request.getAttribute("showRegisterForm") != null && (boolean) request.getAttribute("showRegisterForm") ? "display: none;" : "");
      out.write("\">\n");
      out.write("            <h2 class=\"form-title\">Đăng nhập</h2>\n");
      out.write("            ");
 if (request.getAttribute("errorMessage") != null) { 
      out.write("\n");
      out.write("                <div class=\"message error-message\">");
      out.print( request.getAttribute("errorMessage") );
      out.write("</div>\n");
      out.write("            ");
 } 
      out.write("\n");
      out.write("            ");
 if (request.getAttribute("successMessage") != null) { 
      out.write("\n");
      out.write("                <div class=\"message success-message\">");
      out.print( request.getAttribute("successMessage") );
      out.write("</div>\n");
      out.write("            ");
 } 
      out.write("\n");
      out.write("            <form action=\"login\" method=\"post\">\n");
      out.write("                <input type=\"hidden\" name=\"action\" value=\"login\" />\n");
      out.write("                <div class=\"form-group\">\n");
      out.write("                    <label for=\"userId\">Tên đăng nhập</label>\n");
      out.write("                    <div class=\"input-container\">\n");
      out.write("                        <input type=\"text\" id=\"userId\" name=\"txtUsername\" value=\"");
      out.print( request.getParameter("txtUsername") != null ? request.getParameter("txtUsername") : "");
      out.write("\" required />\n");
      out.write("                        <i class=\"fas fa-user\"></i>\n");
      out.write("                    </div>\n");
      out.write("                    ");
 if (request.getAttribute("errorUsername") != null) { 
      out.write("\n");
      out.write("                        <p class=\"error\">");
      out.print( request.getAttribute("errorUsername") );
      out.write("</p>\n");
      out.write("                    ");
 } 
      out.write("\n");
      out.write("                </div>\n");
      out.write("                <div class=\"form-group\">\n");
      out.write("                    <label for=\"password\">Mật khẩu</label>\n");
      out.write("                    <div class=\"input-container\">\n");
      out.write("                        <input type=\"password\" id=\"password\" name=\"txtPassword\" required />\n");
      out.write("                        <i class=\"fas fa-lock\"></i>\n");
      out.write("                    </div>\n");
      out.write("                    ");
 if (request.getAttribute("errorPassword") != null) { 
      out.write("\n");
      out.write("                        <p class=\"error\">");
      out.print( request.getAttribute("errorPassword") );
      out.write("</p>\n");
      out.write("                    ");
 } 
      out.write("\n");
      out.write("                </div>\n");
      out.write("                <button type=\"submit\" class=\"submit-btn\">Đăng nhập</button>\n");
      out.write("            </form>\n");
      out.write("            <p class=\"switch-form\">Chưa có tài khoản? <a href=\"#\" onclick=\"showRegister()\">Đăng ký ngay</a></p>\n");
      out.write("            <p class=\"switch-form\"><a href=\"forgotPassword\">Quên mật khẩu?</a></p>\n");
      out.write("        </div>\n");
      out.write("\n");
      out.write("        <!-- Form đăng ký -->\n");
      out.write("        <div class=\"form-wrapper\" id=\"registerForm\" style=\"");
      out.print( request.getAttribute("showRegisterForm") != null && (boolean) request.getAttribute("showRegisterForm") ? "" : "display: none;");
      out.write("\">\n");
      out.write("            <h2 class=\"form-title\">Đăng ký</h2>\n");
      out.write("            ");
 if (request.getAttribute("errorMessage") != null && request.getAttribute("showRegisterForm") != null && (boolean) request.getAttribute("showRegisterForm")) { 
      out.write("\n");
      out.write("                <div class=\"message error-message\">");
      out.print( request.getAttribute("errorMessage") );
      out.write("</div>\n");
      out.write("            ");
 } 
      out.write("\n");
      out.write("            ");
 if (request.getAttribute("successMessage") != null && (request.getAttribute("showRegisterForm") == null || !(boolean) request.getAttribute("showRegisterForm"))) { 
      out.write("\n");
      out.write("                <div class=\"message success-message\">");
      out.print( request.getAttribute("successMessage") );
      out.write("</div>\n");
      out.write("            ");
 } 
      out.write("\n");
      out.write("            <form action=\"register\" method=\"post\">\n");
      out.write("                <div class=\"form-group\">\n");
      out.write("                    <label for=\"newUsername\">Tên đăng nhập</label>\n");
      out.write("                    <div class=\"input-container\">\n");
      out.write("                        <input type=\"text\" id=\"newUsername\" name=\"txtNewUsername\" value=\"");
      out.print( request.getParameter("txtNewUsername") != null ? request.getParameter("txtNewUsername") : "");
      out.write("\" required />\n");
      out.write("                        <i class=\"fas fa-user\"></i>\n");
      out.write("                    </div>\n");
      out.write("                    ");
 if (request.getAttribute("errorNewUsername") != null) { 
      out.write("\n");
      out.write("                        <p class=\"error\">");
      out.print( request.getAttribute("errorNewUsername") );
      out.write("</p>\n");
      out.write("                    ");
 } 
      out.write("\n");
      out.write("                </div>\n");
      out.write("                <div class=\"form-group\">\n");
      out.write("                    <label for=\"fullName\">Họ và tên</label>\n");
      out.write("                    <div class=\"input-container\">\n");
      out.write("                        <input type=\"text\" id=\"fullName\" name=\"txtFullName\" value=\"");
      out.print( request.getParameter("txtFullName") != null ? request.getParameter("txtFullName") : "");
      out.write("\" required />\n");
      out.write("                        <i class=\"fas fa-id-card\"></i>\n");
      out.write("                    </div>\n");
      out.write("                    ");
 if (request.getAttribute("errorFullName") != null) { 
      out.write("\n");
      out.write("                        <p class=\"error\">");
      out.print( request.getAttribute("errorFullName") );
      out.write("</p>\n");
      out.write("                    ");
 } 
      out.write("\n");
      out.write("                </div>\n");
      out.write("                <div class=\"form-group\">\n");
      out.write("                    <label for=\"gmail\">Gmail</label>\n");
      out.write("                    <div class=\"input-container\">\n");
      out.write("                        <input type=\"email\" id=\"gmail\" name=\"txtGmail\" value=\"");
      out.print( request.getParameter("txtGmail") != null ? request.getParameter("txtGmail") : "");
      out.write("\" required />\n");
      out.write("                        <i class=\"fas fa-envelope\"></i>\n");
      out.write("                    </div>\n");
      out.write("                    ");
 if (request.getAttribute("errorGmail") != null) { 
      out.write("\n");
      out.write("                        <p class=\"error\">");
      out.print( request.getAttribute("errorGmail") );
      out.write("</p>\n");
      out.write("                    ");
 } 
      out.write("\n");
      out.write("                </div>\n");
      out.write("                <div class=\"form-group\">\n");
      out.write("                    <label for=\"sdt\">Số điện thoại</label>\n");
      out.write("                    <div class=\"input-container\">\n");
      out.write("                        <input type=\"text\" id=\"sdt\" name=\"txtSdt\" value=\"");
      out.print( request.getParameter("txtSdt") != null ? request.getParameter("txtSdt") : "");
      out.write("\" />\n");
      out.write("                        <i class=\"fas fa-phone\"></i>\n");
      out.write("                    </div>\n");
      out.write("                    ");
 if (request.getAttribute("errorSdt") != null) { 
      out.write("\n");
      out.write("                        <p class=\"error\">");
      out.print( request.getAttribute("errorSdt") );
      out.write("</p>\n");
      out.write("                    ");
 } 
      out.write("\n");
      out.write("                </div>\n");
      out.write("                <div class=\"form-group\">\n");
      out.write("                    <label for=\"newPassword\">Mật khẩu</label>\n");
      out.write("                    <div class=\"input-container\">\n");
      out.write("                        <input type=\"password\" id=\"newPassword\" name=\"txtNewPassword\" required />\n");
      out.write("                        <i class=\"fas fa-lock\"></i>\n");
      out.write("                    </div>\n");
      out.write("                    ");
 if (request.getAttribute("errorNewPassword") != null) { 
      out.write("\n");
      out.write("                        <p class=\"error\">");
      out.print( request.getAttribute("errorNewPassword") );
      out.write("</p>\n");
      out.write("                    ");
 } 
      out.write("\n");
      out.write("                </div>\n");
      out.write("                <div class=\"form-group\">\n");
      out.write("                    <label for=\"confirmPassword\">Nhập lại mật khẩu</label>\n");
      out.write("                    <div class=\"input-container\">\n");
      out.write("                        <input type=\"password\" id=\"confirmPassword\" name=\"txtConfirmPassword\" required />\n");
      out.write("                        <i class=\"fas fa-lock\"></i>\n");
      out.write("                    </div>\n");
      out.write("                    ");
 if (request.getAttribute("errorConfirmPassword") != null) { 
      out.write("\n");
      out.write("                        <p class=\"error\">");
      out.print( request.getAttribute("errorConfirmPassword") );
      out.write("</p>\n");
      out.write("                    ");
 } 
      out.write("\n");
      out.write("                </div>\n");
      out.write("                <button type=\"submit\" class=\"submit-btn\">Đăng ký</button>\n");
      out.write("            </form>\n");
      out.write("            <p class=\"switch-form\">Đã có tài khoản? <a href=\"#\" onclick=\"showLogin()\">Đăng nhập</a></p>\n");
      out.write("        </div>\n");
      out.write("    </div>\n");
      out.write("\n");
      out.write("    ");
      out.write("\n");
      out.write("<footer>\n");
      out.write("    <div class=\"footer-content\">\n");
      out.write("        <p>© 2025 Homestay Booking. Tất cả quyền lợi được bảo vệ.</p>\n");
      out.write("\n");
      out.write("        <!-- Social media logos (images) -->\n");
      out.write("        <div class=\"social-logos\">\n");
      out.write("            <a href=\"https://www.facebook.com\" class=\"logo-link\" target=\"_blank\" rel=\"noopener noreferrer\">\n");
      out.write("                <img src=\"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/512px-2021_Facebook_icon.svg.png\" alt=\"Facebook\" loading=\"lazy\">\n");
      out.write("            </a>\n");
      out.write("            <a href=\"https://www.instagram.com\" class=\"logo-link\" target=\"_blank\" rel=\"noopener noreferrer\">\n");
      out.write("                <img src=\"https://cdn-icons-png.flaticon.com/512/1409/1409946.png\" alt=\"Instagram\" loading=\"lazy\">\n");
      out.write("            </a>\n");
      out.write("            <a href=\"https://zalo.me\" class=\"logo-link\" target=\"_blank\" rel=\"noopener noreferrer\">\n");
      out.write("                <img src=\"https://haiauint.vn/wp-content/uploads/2024/02/zalo-icon.png\" alt=\"Zalo\" loading=\"lazy\">\n");
      out.write("            </a>\n");
      out.write("        </div>\n");
      out.write("    </div>\n");
      out.write("</footer>\n");
      out.write("\n");
      out.write("<link rel=\"stylesheet\" href=\"");
      out.print( request.getContextPath());
      out.write("/assets/css/footer.css\">");
      out.write("\n");
      out.write("\n");
      out.write("    <script>\n");
      out.write("        function showRegister() {\n");
      out.write("            document.getElementById(\"loginForm\").style.display = \"none\";\n");
      out.write("            document.getElementById(\"registerForm\").style.display = \"block\";\n");
      out.write("        }\n");
      out.write("\n");
      out.write("        function showLogin() {\n");
      out.write("            document.getElementById(\"registerForm\").style.display = \"none\";\n");
      out.write("            document.getElementById(\"loginForm\").style.display = \"block\";\n");
      out.write("        }\n");
      out.write("\n");
      out.write("        window.onload = function () {\n");
      out.write("            ");
 if (request.getAttribute("showRegisterForm") != null && (boolean) request.getAttribute("showRegisterForm")) { 
      out.write("\n");
      out.write("                showRegister();\n");
      out.write("            ");
 } else { 
      out.write("\n");
      out.write("                showLogin();\n");
      out.write("            ");
 } 
      out.write("\n");
      out.write("        };\n");
      out.write("    </script>\n");
      out.write("</body>\n");
      out.write("</html>");
    } catch (Throwable t) {
      if (!(t instanceof SkipPageException)){
        out = _jspx_out;
        if (out != null && out.getBufferSize() != 0)
          out.clearBuffer();
        if (_jspx_page_context != null) _jspx_page_context.handlePageException(t);
        else throw new ServletException(t);
      }
    } finally {
      _jspxFactory.releasePageContext(_jspx_page_context);
    }
  }
}
