package dao;

import dto.ReviewDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import utils.DBUtils;

public class ReviewDAO {

    public boolean create(ReviewDTO review) throws SQLException, ClassNotFoundException {
        String sql = "INSERT INTO reviews (room_id, user_id, rating, comment) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, review.getRoomId());
            ps.setString(2, review.getUserId());
            ps.setFloat(3, review.getRating());
            ps.setString(4, review.getComment());
            return ps.executeUpdate() > 0;
        }
    }

    public List<ReviewDTO> getReviewsByRoomId(int roomId) throws SQLException, ClassNotFoundException {
        List<ReviewDTO> reviews = new ArrayList<>();
        String sql = "SELECT * FROM reviews WHERE room_id = ? ORDER BY created_at DESC";
        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, roomId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ReviewDTO review = new ReviewDTO(
                            rs.getInt("id"),
                            rs.getInt("room_id"),
                            rs.getString("user_id"),
                            rs.getFloat("rating"),
                            rs.getString("comment"),
                            rs.getTimestamp("created_at")
                    );
                    reviews.add(review);
                }
            }
        }
        return reviews;
    }
}
