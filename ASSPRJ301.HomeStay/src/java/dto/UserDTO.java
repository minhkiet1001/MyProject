package dto;

public class UserDTO {

    private String userID;
    private String fullName;
    private String roleID;
    private String password;
    private String gmail;
    private String sdt;
    private String avatarUrl;
    private String token;       // Thêm token
    private boolean isVerified; // Thêm isVerified

    // Constructor đầy đủ
    public UserDTO(String userID, String fullName, String roleID, String password, String gmail, String sdt, String avatarUrl, String token, boolean isVerified) {
        this.userID = userID;
        this.fullName = fullName;
        this.roleID = roleID;
        this.password = password;
        this.gmail = gmail;
        this.sdt = sdt;
        this.avatarUrl = avatarUrl;
        this.token = token;
        this.isVerified = isVerified;
    }

    // Constructor không có token và isVerified (cho tương thích với code cũ)
    public UserDTO(String userID, String fullName, String roleID, String password, String gmail, String sdt, String avatarUrl) {
        this(userID, fullName, roleID, password, gmail, sdt, avatarUrl, null, false);
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRoleID() {
        return roleID;
    }

    public void setRoleID(String roleID) {
        this.roleID = roleID;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getGmail() {
        return gmail;
    }

    public void setGmail(String gmail) {
        this.gmail = gmail;
    }

    public String getSdt() {
        return sdt;
    }

    public void setSdt(String sdt) {
        this.sdt = sdt;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public boolean isIsVerified() {
        return isVerified;
    }

    public void setIsVerified(boolean isVerified) {
        this.isVerified = isVerified;
    }
}
