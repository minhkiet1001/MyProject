package dao;

import dto.UserDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import utils.DBUtils;
import utils.PasswordUtils;

public class UserDAO implements IDAO<UserDTO, String> {

    @Override
    public UserDTO readById(String id) {
        String sql = "SELECT [userID], [fullName], [roleID], [password], [gmail], [sdt], [avatar_url], [token], [isVerified] "
                + "FROM [tblUsers] WHERE userID = ?";
        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new UserDTO(
                            rs.getString("userID"),
                            rs.getString("fullName"),
                            rs.getString("roleID"),
                            rs.getString("password"),
                            rs.getString("gmail"),
                            rs.getString("sdt"),
                            rs.getString("avatar_url"),
                            rs.getString("token"), 
                            rs.getBoolean("isVerified") 
                    );
                }
            }
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }

    @Override
    public boolean create(UserDTO user) {
        boolean success = false;
        String sql = "INSERT INTO tblUsers (userID, fullName, roleID, password, gmail, sdt, avatar_url, token, isVerified) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, user.getUserID());
            ps.setString(2, user.getFullName());
            ps.setString(3, user.getRoleID());
            ps.setString(4, PasswordUtils.hashPassword(user.getPassword()));
            ps.setString(5, user.getGmail());
            ps.setString(6, user.getSdt());
            ps.setString(7, user.getAvatarUrl());
            ps.setString(8, user.getToken());
            ps.setBoolean(9, user.isIsVerified());

            success = ps.executeUpdate() > 0;
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
        return success;
    }

    @Override
    public boolean update(UserDTO user) {
        boolean success = false;
        String sql = "UPDATE tblUsers SET fullName = ?, roleID = ?, gmail = ?, sdt = ?, avatar_url = ?, token = ?, isVerified = ? WHERE userID = ?";

        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getRoleID());
            ps.setString(3, user.getGmail());
            ps.setString(4, user.getSdt());
            ps.setString(5, user.getAvatarUrl());
            ps.setString(6, user.getToken());
            ps.setBoolean(7, user.isIsVerified());
            ps.setString(8, user.getUserID());

            success = ps.executeUpdate() > 0;
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
        return success;
    }

    public boolean updatePassword(String userId, String newPassword) {
        boolean success = false;
        String sql = "UPDATE tblUsers SET password = ? WHERE userID = ?";

        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, PasswordUtils.hashPassword(newPassword));
            ps.setString(2, userId);

            success = ps.executeUpdate() > 0;
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
        return success;
    }

    @Override
    public boolean delete(String id) {
        boolean success = false;
        String sql = "DELETE FROM tblUsers WHERE userID = ?";

        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            success = ps.executeUpdate() > 0;
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
        return success;
    }

    @Override
    public List<UserDTO> search(String searchTerm) {
        return null; // Chưa triển khai
    }

    @Override
    public List<UserDTO> readAll() {
        List<UserDTO> userList = new ArrayList<>();
        String sql = "SELECT [userID], [fullName], [roleID], [password], [gmail], [sdt], [avatar_url], [token], [isVerified] "
                + "FROM [tblUsers]";
        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                UserDTO user = new UserDTO(
                        rs.getString("userID"),
                        rs.getString("fullName"),
                        rs.getString("roleID"),
                        rs.getString("password"),
                        rs.getString("gmail"),
                        rs.getString("sdt"),
                        rs.getString("avatar_url"),
                        rs.getString("token"),
                        rs.getBoolean("isVerified")
                );
                userList.add(user);
            }
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
        return userList;
    }

    public List<UserDTO> getAllAdmins() {
        List<UserDTO> admins = new ArrayList<>();
        String sql = "SELECT [userID], [fullName], [roleID], [password], [gmail], [sdt], [avatar_url], [token], [isVerified] "
                + "FROM tblUsers WHERE roleID = 'AD'";
        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                UserDTO admin = new UserDTO(
                        rs.getString("userID"),
                        rs.getString("fullName"),
                        rs.getString("roleID"),
                        rs.getString("password"),
                        rs.getString("gmail"),
                        rs.getString("sdt"),
                        rs.getString("avatar_url"),
                        rs.getString("token"),
                        rs.getBoolean("isVerified")
                );
                admins.add(admin);
            }
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
        return admins;
    }

    // Phương thức mới để kiểm tra email đã tồn tại hay chưa
    public boolean isEmailExists(String email) {
        String sql = "SELECT COUNT(*) FROM tblUsers WHERE gmail = ?";
        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0; // Trả về true nếu email đã tồn tại
                }
            }
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, "Error checking email existence", ex);
        }
        return false;
    }

    // Phương thức mới để xác thực token
    public boolean verifyUser(String token) {
        boolean success = false;
        String sql = "UPDATE tblUsers SET isVerified = 1, token = NULL WHERE token = ? AND isVerified = 0";
        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, token);
            success = ps.executeUpdate() > 0;
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, "Error verifying user", ex);
        }
        return success;
    }
    
    // Tìm người dùng theo email
    public UserDTO getUserByEmail(String email) {
        String sql = "SELECT [userID], [fullName], [roleID], [password], [gmail], [sdt], [avatar_url], [token], [isVerified] "
                + "FROM [tblUsers] WHERE gmail = ?";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new UserDTO(
                            rs.getString("userID"),
                            rs.getString("fullName"),
                            rs.getString("roleID"),
                            rs.getString("password"),
                            rs.getString("gmail"),
                            rs.getString("sdt"),
                            rs.getString("avatar_url"),
                            rs.getString("token"),
                            rs.getBoolean("isVerified")
                    );
                }
            }
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, "Error getting user by email", ex);
        }
        return null;
    }

    // Lưu token đặt lại mật khẩu
    public boolean saveResetPasswordToken(String userId, String token) {
        String sql = "UPDATE tblUsers SET token = ? WHERE userID = ?";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, token);
            ps.setString(2, userId);
            return ps.executeUpdate() > 0;
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, "Error saving reset password token", ex);
        }
        return false;
    }

    // Xác thực token đặt lại mật khẩu
    public UserDTO validateResetPasswordToken(String token) {
        String sql = "SELECT [userID], [fullName], [roleID], [password], [gmail], [sdt], [avatar_url], [token], [isVerified] "
                + "FROM [tblUsers] WHERE token = ?";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, token);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    // Kiểm tra thời gian hết hạn (giả định 24 giờ)
                    // Nếu bạn đã thêm cột token_expiry, bạn có thể kiểm tra trực tiếp trong SQL
                    return new UserDTO(
                            rs.getString("userID"),
                            rs.getString("fullName"),
                            rs.getString("roleID"),
                            rs.getString("password"),
                            rs.getString("gmail"),
                            rs.getString("sdt"),
                            rs.getString("avatar_url"),
                            rs.getString("token"),
                            rs.getBoolean("isVerified")
                    );
                }
            }
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, "Error validating reset password token", ex);
        }
        return null;
    }

    // Xóa token sau khi sử dụng
    public boolean clearToken(String userId) {
        String sql = "UPDATE tblUsers SET token = NULL WHERE userID = ?";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            return ps.executeUpdate() > 0;
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(UserDAO.class.getName()).log(Level.SEVERE, "Error clearing token", ex);
        }
        return false;
    }
}
