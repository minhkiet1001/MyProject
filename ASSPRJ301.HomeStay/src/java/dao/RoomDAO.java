package dao;

import dto.RoomDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import utils.DBUtils;

public class RoomDAO {

    private void setRatingAndReviewCount(RoomDTO room, Connection conn) throws SQLException {
        String sqlRating = "SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount FROM reviews WHERE room_id = ?";
        try (PreparedStatement psRating = conn.prepareStatement(sqlRating)) {
            psRating.setInt(1, room.getId());
            try (ResultSet rsRating = psRating.executeQuery()) {
                if (rsRating.next()) {
                    room.setAverageRating(rsRating.getDouble("avgRating"));
                    room.setReviewCount(rsRating.getInt("reviewCount"));
                }
            }
        }
    }

    public RoomDTO getRoomById(int roomId) throws Exception {
        RoomDTO room = null;
        String sqlRoom = "SELECT id, name, description, price, amenities, image_url FROM rooms WHERE id = ?";
        String sqlImages = "SELECT image_url FROM room_images WHERE room_id = ?";

        try (Connection conn = DBUtils.getConnection();
                PreparedStatement psRoom = conn.prepareStatement(sqlRoom);
                PreparedStatement psImages = conn.prepareStatement(sqlImages)) {

            if (conn == null) {
                throw new Exception("Cannot establish database connection");
            }

            psRoom.setInt(1, roomId);
            try (ResultSet rsRoom = psRoom.executeQuery()) {
                if (rsRoom.next()) {
                    room = new RoomDTO(
                            rsRoom.getInt("id"),
                            rsRoom.getString("name"),
                            rsRoom.getString("description"),
                            rsRoom.getDouble("price"),
                            rsRoom.getString("amenities"),
                            rsRoom.getString("image_url"),
                            null,
                            0.0, // averageRating ban đầu
                            0    // reviewCount ban đầu
                    );

                    // Lấy danh sách hình ảnh chi tiết
                    psImages.setInt(1, roomId);
                    try (ResultSet rsImages = psImages.executeQuery()) {
                        List<String> detailImages = new ArrayList<>();
                        while (rsImages.next()) {
                            detailImages.add(rsImages.getString("image_url"));
                        }
                        room.setDetailImages(detailImages);
                    }

                    // Tính averageRating và reviewCount
                    setRatingAndReviewCount(room, conn);
                }
            }
        } catch (Exception e) {
            throw new Exception("Error retrieving room by ID " + roomId + ": " + e.getMessage(), e);
        }
        return room;
    }

    public RoomDTO getRoomByName(String roomName) throws Exception {
        RoomDTO room = null;
        // Không lấy cột ratings trong truy vấn
        String sqlRoom = "SELECT id, name, description, price, amenities, image_url FROM rooms WHERE name = ?";
        String sqlImages = "SELECT image_url FROM room_images WHERE room_id = ?";

        try (Connection conn = DBUtils.getConnection();
                PreparedStatement psRoom = conn.prepareStatement(sqlRoom);
                PreparedStatement psImages = conn.prepareStatement(sqlImages)) {

            if (conn == null) {
                throw new Exception("Cannot establish database connection");
            }

            psRoom.setString(1, roomName);
            try (ResultSet rsRoom = psRoom.executeQuery()) {
                if (rsRoom.next()) {
                    room = new RoomDTO(
                            rsRoom.getInt("id"),
                            rsRoom.getString("name"),
                            rsRoom.getString("description"),
                            rsRoom.getDouble("price"),
                            rsRoom.getString("amenities"),
                            rsRoom.getString("image_url"),
                            null,
                            0.0,
                            0
                    );

                    psImages.setInt(1, room.getId());
                    try (ResultSet rsImages = psImages.executeQuery()) {
                        List<String> detailImages = new ArrayList<>();
                        while (rsImages.next()) {
                            detailImages.add(rsImages.getString("image_url"));
                        }
                        room.setDetailImages(detailImages);
                    }

                    setRatingAndReviewCount(room, conn);
                }
            }
        } catch (Exception e) {
            throw new Exception("Error retrieving room by name " + roomName + ": " + e.getMessage(), e);
        }
        return room;
    }

    public List<RoomDTO> getAllRooms() throws Exception {
        List<RoomDTO> roomList = new ArrayList<>();
        // Không lấy cột ratings trong truy vấn
        String sqlRoom = "SELECT id, name, description, price, amenities, image_url FROM rooms";
        String sqlImages = "SELECT image_url FROM room_images WHERE room_id = ?";

        try (Connection conn = DBUtils.getConnection();
                PreparedStatement psRoom = conn.prepareStatement(sqlRoom);
                PreparedStatement psImages = conn.prepareStatement(sqlImages)) {

            if (conn == null) {
                throw new Exception("Cannot establish database connection");
            }

            try (ResultSet rsRoom = psRoom.executeQuery()) {
                while (rsRoom.next()) {
                    RoomDTO room = new RoomDTO(
                            rsRoom.getInt("id"),
                            rsRoom.getString("name"),
                            rsRoom.getString("description"),
                            rsRoom.getDouble("price"),
                            rsRoom.getString("amenities"),
                            rsRoom.getString("image_url"),
                            null,
                            0.0,
                            0
                    );

                    psImages.setInt(1, room.getId());
                    try (ResultSet rsImages = psImages.executeQuery()) {
                        List<String> detailImages = new ArrayList<>();
                        while (rsImages.next()) {
                            detailImages.add(rsImages.getString("image_url"));
                        }
                        room.setDetailImages(detailImages);
                    }

                    setRatingAndReviewCount(room, conn);
                    roomList.add(room);
                }
            }
        } catch (Exception e) {
            throw new Exception("Error retrieving all rooms: " + e.getMessage(), e);
        }
        return roomList;
    }

    public boolean create(RoomDTO room) throws Exception {
        // Không thêm cột ratings vào truy vấn INSERT
        String sqlRoom = "INSERT INTO rooms (name, description, price, amenities, image_url) VALUES (?, ?, ?, ?, ?)";
        String sqlImages = "INSERT INTO room_images (room_id, image_url) VALUES (?, ?)";

        try (Connection conn = DBUtils.getConnection()) {
            if (conn == null) {
                throw new Exception("Cannot establish database connection");
            }

            try (PreparedStatement psRoom = conn.prepareStatement(sqlRoom, PreparedStatement.RETURN_GENERATED_KEYS)) {
                psRoom.setString(1, room.getName());
                psRoom.setString(2, room.getDescription());
                psRoom.setDouble(3, room.getPrice());
                psRoom.setString(4, room.getAmenities());
                psRoom.setString(5, room.getImageUrl());

                int affectedRows = psRoom.executeUpdate();
                if (affectedRows == 0) {
                    return false;
                }

                try (ResultSet generatedKeys = psRoom.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        int roomId = generatedKeys.getInt(1);
                        room.setId(roomId);

                        if (room.getDetailImages() != null && !room.getDetailImages().isEmpty()) {
                            try (PreparedStatement psImages = conn.prepareStatement(sqlImages)) {
                                for (String imageUrl : room.getDetailImages()) {
                                    psImages.setInt(1, roomId);
                                    psImages.setString(2, imageUrl);
                                    psImages.addBatch();
                                }
                                psImages.executeBatch();
                            }
                        }
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        } catch (Exception e) {
            throw new Exception("Error creating room: " + e.getMessage(), e);
        }
    }

    public boolean update(RoomDTO room) throws Exception {
        // Không cập nhật cột ratings trong truy vấn UPDATE
        String sqlRoom = "UPDATE rooms SET name = ?, description = ?, price = ?, amenities = ?, image_url = ? WHERE id = ?";
        String sqlDeleteImages = "DELETE FROM room_images WHERE room_id = ?";
        String sqlInsertImages = "INSERT INTO room_images (room_id, image_url) VALUES (?, ?)";

        try (Connection conn = DBUtils.getConnection()) {
            if (conn == null) {
                throw new Exception("Cannot establish database connection");
            }

            try (PreparedStatement psRoom = conn.prepareStatement(sqlRoom)) {
                psRoom.setString(1, room.getName());
                psRoom.setString(2, room.getDescription());
                psRoom.setDouble(3, room.getPrice());
                psRoom.setString(4, room.getAmenities());
                psRoom.setString(5, room.getImageUrl());
                psRoom.setInt(6, room.getId());

                int affectedRows = psRoom.executeUpdate();
                if (affectedRows == 0) {
                    return false;
                }

                try (PreparedStatement psDelete = conn.prepareStatement(sqlDeleteImages)) {
                    psDelete.setInt(1, room.getId());
                    psDelete.executeUpdate();
                }

                if (room.getDetailImages() != null && !room.getDetailImages().isEmpty()) {
                    try (PreparedStatement psInsert = conn.prepareStatement(sqlInsertImages)) {
                        for (String imageUrl : room.getDetailImages()) {
                            psInsert.setInt(1, room.getId());
                            psInsert.setString(2, imageUrl);
                            psInsert.addBatch();
                        }
                        psInsert.executeBatch();
                    }
                }
                return true;
            }
        } catch (Exception e) {
            throw new Exception("Error updating room: " + e.getMessage(), e);
        }
    }

    public boolean delete(int roomId) throws Exception {
        String sqlDeleteImages = "DELETE FROM room_images WHERE room_id = ?";
        String sqlDeleteRoom = "DELETE FROM rooms WHERE id = ?";

        try (Connection conn = DBUtils.getConnection()) {
            if (conn == null) {
                throw new Exception("Cannot establish database connection");
            }

            try (PreparedStatement psDeleteImages = conn.prepareStatement(sqlDeleteImages)) {
                psDeleteImages.setInt(1, roomId);
                psDeleteImages.executeUpdate();
            }

            try (PreparedStatement psDeleteRoom = conn.prepareStatement(sqlDeleteRoom)) {
                psDeleteRoom.setInt(1, roomId);
                int affectedRows = psDeleteRoom.executeUpdate();
                return affectedRows > 0;
            }
        } catch (Exception e) {
            throw new Exception("Error deleting room: " + e.getMessage(), e);
        }
    }

    public List<RoomDTO> getFilteredRooms(String homestayName, double minPrice, double maxPrice, String amenities) {
        List<RoomDTO> rooms = new ArrayList<>();
        // Không lấy cột ratings trong truy vấn
        String sql = "SELECT id, name, description, price, amenities, image_url FROM rooms WHERE 1=1";

        if (homestayName != null && !homestayName.isEmpty()) {
            sql += " AND LOWER(name) LIKE ?";
        }
        sql += " AND price BETWEEN ? AND ?";
        if (amenities != null && !amenities.isEmpty()) {
            sql += " AND LOWER(amenities) LIKE ?";
        }

        try (Connection conn = DBUtils.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            int index = 1;
            if (homestayName != null && !homestayName.isEmpty()) {
                ps.setString(index++, "%" + homestayName.toLowerCase() + "%");
            }
            ps.setDouble(index++, minPrice);
            ps.setDouble(index++, maxPrice);
            if (amenities != null && !amenities.isEmpty()) {
                ps.setString(index++, "%" + amenities.toLowerCase() + "%");
            }

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                RoomDTO room = new RoomDTO(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getDouble("price"),
                        rs.getString("amenities"),
                        rs.getString("image_url"),
                        new ArrayList<>(),
                        0.0,
                        0
                );
                setRatingAndReviewCount(room, conn);
                rooms.add(room);
            }
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return rooms;
    }
}