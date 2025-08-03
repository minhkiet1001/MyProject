package dto;

import java.util.ArrayList;
import java.util.List;

public class RoomDTO {
    private int id;
    private String name;
    private String description;
    private double price;
    private String amenities;
    private String imageUrl; 
    private List<String> detailImages;
    private double averageRating; 
    private int reviewCount;     

    public RoomDTO() {
        this.detailImages = new ArrayList<>(); 
    }

    public RoomDTO(int id, String name, String description, double price, String amenities, String imageUrl, List<String> detailImages, double averageRating, int reviewCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.amenities = amenities;
        this.imageUrl = imageUrl;
        this.detailImages = (detailImages != null) ? detailImages : new ArrayList<>(); 
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getDetailImages() {
        return detailImages;
    }

    public void setDetailImages(List<String> detailImages) {
        this.detailImages = (detailImages != null) ? detailImages : new ArrayList<>();
    }

    public void addDetailImage(String imageUrl) {
        this.detailImages.add(imageUrl);
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }
}