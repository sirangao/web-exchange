package com.webexchange.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Listing {
    private int id;
    private int userId;
    private String sellerUsername;
    private String sellerEmail;
    private String sellerPhone;
    private String title;
    private String description;
    private int categoryId;
    private String categoryName;
    private String listingType;       // sell | exchange | both
    private BigDecimal price;
    private String conditionGrade;
    private String status;
    private String imageUrl;
    private List<String> paymentMethods;
    private LocalDateTime createdAt;

    public Listing() {}

    // Getters & Setters
    public int getId()                           { return id; }
    public void setId(int id)                    { this.id = id; }

    public int getUserId()                       { return userId; }
    public void setUserId(int u)                 { this.userId = u; }

    public String getSellerUsername()            { return sellerUsername; }
    public void setSellerUsername(String s)      { this.sellerUsername = s; }

    public String getSellerEmail()               { return sellerEmail; }
    public void setSellerEmail(String s)         { this.sellerEmail = s; }

    public String getSellerPhone()               { return sellerPhone; }
    public void setSellerPhone(String s)         { this.sellerPhone = s; }

    public String getTitle()                     { return title; }
    public void setTitle(String t)               { this.title = t; }

    public String getDescription()               { return description; }
    public void setDescription(String d)         { this.description = d; }

    public int getCategoryId()                   { return categoryId; }
    public void setCategoryId(int c)             { this.categoryId = c; }

    public String getCategoryName()              { return categoryName; }
    public void setCategoryName(String c)        { this.categoryName = c; }

    public String getListingType()               { return listingType; }
    public void setListingType(String l)         { this.listingType = l; }

    public BigDecimal getPrice()                 { return price; }
    public void setPrice(BigDecimal p)           { this.price = p; }

    public String getConditionGrade()            { return conditionGrade; }
    public void setConditionGrade(String c)      { this.conditionGrade = c; }

    public String getStatus()                    { return status; }
    public void setStatus(String s)              { this.status = s; }

    public String getImageUrl()                  { return imageUrl; }
    public void setImageUrl(String i)            { this.imageUrl = i; }

    public List<String> getPaymentMethods()      { return paymentMethods; }
    public void setPaymentMethods(List<String> p){ this.paymentMethods = p; }

    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime c)    { this.createdAt = c; }
}
