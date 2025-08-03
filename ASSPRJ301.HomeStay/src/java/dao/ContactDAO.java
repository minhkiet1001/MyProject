package dao;

import dto.ContactMessageDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import utils.DBUtils;

public class ContactDAO {

    public boolean create(ContactMessageDTO message) throws SQLException, ClassNotFoundException {
        String sql = "INSERT INTO contact_messages (user_id, full_name, email, phone, message) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, message.getUserId());
            ps.setString(2, message.getFullName());
            ps.setString(3, message.getEmail());
            ps.setString(4, message.getPhone());
            ps.setString(5, message.getMessage());
            return ps.executeUpdate() > 0;
        }
    }

    public List<ContactMessageDTO> getAllMessages() throws SQLException, ClassNotFoundException {
        List<ContactMessageDTO> messages = new ArrayList<>();
        String sql = "SELECT id, user_id, full_name, email, phone, message, created_at, is_read FROM contact_messages ORDER BY created_at DESC";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                messages.add(new ContactMessageDTO(
                    rs.getInt("id"),
                    rs.getString("user_id"),
                    rs.getString("full_name"),
                    rs.getString("email"),
                    rs.getString("phone"),
                    rs.getString("message"),
                    rs.getTimestamp("created_at"),
                    rs.getBoolean("is_read")
                ));
            }
        }
        return messages;
    }

    public boolean markAsRead(int messageId) throws SQLException, ClassNotFoundException {
        String sql = "UPDATE contact_messages SET is_read = 1 WHERE id = ?";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, messageId);
            return ps.executeUpdate() > 0;
        }
    }
    public int getUnreadMessageCount() {
        String sql = "SELECT COUNT(*) FROM contact_messages WHERE is_read = 0";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, "Error counting unread messages", ex);
        }
        return 0;
    }
}