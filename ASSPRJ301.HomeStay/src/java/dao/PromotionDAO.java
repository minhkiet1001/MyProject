package dao;

import dto.PromotionDTO;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import utils.DBUtils;

public class PromotionDAO {


    public PromotionDTO getPromotionByCode(String promoCode) throws ClassNotFoundException {
        String query = "SELECT * FROM Promotion WHERE code = ? AND start_date <= GETDATE() AND end_date >= GETDATE()";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, promoCode);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                PromotionDTO promotion = new PromotionDTO();
                promotion.setId(rs.getInt("id"));
                promotion.setCode(rs.getString("code"));
                promotion.setDiscountType(rs.getString("discount_type"));
                promotion.setDiscountAmount(rs.getDouble("discount_amount"));
                promotion.setStartDate(rs.getDate("start_date"));
                promotion.setEndDate(rs.getDate("end_date"));
                promotion.setUsageLimit(rs.getInt("usage_limit"));
                promotion.setUsageCount(rs.getInt("usage_count"));
                return promotion;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi truy vấn cơ sở dữ liệu: " + e.getMessage(), e);
        }
        return null;
    }

    public void incrementUsageCount(String promoCode) throws ClassNotFoundException {
        String query = "UPDATE Promotion SET usage_count = usage_count + 1 WHERE code = ?";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, promoCode);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi cập nhật usage_count: " + e.getMessage(), e);
        }
    }
    public boolean createPromotion(PromotionDTO promotion) throws ClassNotFoundException {
        String query = "INSERT INTO Promotion (code, discount_type, discount_amount, start_date, end_date, usage_limit, usage_count) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtils.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, promotion.getCode());
            stmt.setString(2, promotion.getDiscountType());
            stmt.setDouble(3, promotion.getDiscountAmount());
            stmt.setDate(4, new java.sql.Date(promotion.getStartDate().getTime()));
            stmt.setDate(5, new java.sql.Date(promotion.getEndDate().getTime()));
            stmt.setObject(6, promotion.getUsageLimit(), java.sql.Types.INTEGER);
            stmt.setInt(7, promotion.getUsageCount());

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi thêm mã khuyến mãi: " + e.getMessage(), e);
        }
    }
}