package dto;

import java.util.Date;

public class BookingDTO {

    private int id;
    private UserDTO user;
    private RoomDTO room;
    private Date checkInDate;
    private Date checkOutDate;
    private double totalPrice; // Giá gốc
    private String status;
    private Date createdAt;
    private String promoCode; // Mã giảm giá
    private double discountAmount; // Số tiền giảm

    public BookingDTO() {
    }

    public BookingDTO(int id, UserDTO user, RoomDTO room, Date checkInDate, Date checkOutDate, double totalPrice, String status, Date createdAt) {
        this.id = id;
        this.user = user;
        this.room = room;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.totalPrice = totalPrice;
        this.status = status;
        this.createdAt = createdAt;
    }

    public BookingDTO(int id, UserDTO user, RoomDTO room, Date checkInDate, Date checkOutDate, double totalPrice, String status, Date createdAt, String promoCode, double discountAmount) {
        this.id = id;
        this.user = user;
        this.room = room;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.totalPrice = totalPrice;
        this.status = status;
        this.createdAt = createdAt;
        this.promoCode = promoCode;
        this.discountAmount = discountAmount;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public RoomDTO getRoom() {
        return room;
    }

    public void setRoom(RoomDTO room) {
        this.room = room;
    }

    public Date getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(Date checkInDate) {
        this.checkInDate = checkInDate;
    }

    public Date getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(Date checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }

    public double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(double discountAmount) {
        this.discountAmount = discountAmount;
    }

    // Tính tổng tiền sau khi giảm
    public double getFinalPrice() {
        return totalPrice - discountAmount;
    }
}