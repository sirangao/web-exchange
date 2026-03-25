package com.webexchange.model;

import java.time.LocalDateTime;

public class Meetup {
    private int id;
    private int listingId;
    private int buyerId;
    private int sellerId;
    private String buyerUsername;
    private String sellerUsername;
    private String location;
    private LocalDateTime proposedTime;
    private String status;
    private String notes;
    private LocalDateTime createdAt;

    public Meetup() {}

    public int getId()                            { return id; }
    public void setId(int id)                     { this.id = id; }
    public int getListingId()                     { return listingId; }
    public void setListingId(int l)               { this.listingId = l; }
    public int getBuyerId()                       { return buyerId; }
    public void setBuyerId(int b)                 { this.buyerId = b; }
    public int getSellerId()                      { return sellerId; }
    public void setSellerId(int s)                { this.sellerId = s; }
    public String getBuyerUsername()              { return buyerUsername; }
    public void setBuyerUsername(String b)        { this.buyerUsername = b; }
    public String getSellerUsername()             { return sellerUsername; }
    public void setSellerUsername(String s)       { this.sellerUsername = s; }
    public String getLocation()                   { return location; }
    public void setLocation(String l)             { this.location = l; }
    public LocalDateTime getProposedTime()        { return proposedTime; }
    public void setProposedTime(LocalDateTime t)  { this.proposedTime = t; }
    public String getStatus()                     { return status; }
    public void setStatus(String s)               { this.status = s; }
    public String getNotes()                      { return notes; }
    public void setNotes(String n)                { this.notes = n; }
    public LocalDateTime getCreatedAt()           { return createdAt; }
    public void setCreatedAt(LocalDateTime c)     { this.createdAt = c; }
}
