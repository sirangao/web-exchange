package com.webexchange.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

public class User {
    private int id;
    private String username;
    @JsonIgnore
    private String password;
    private String email;
    private String phone;
    private String college;
    private LocalDateTime createdAt;

    public User() {}

    // Getters & Setters
    public int getId()                       { return id; }
    public void setId(int id)                { this.id = id; }

    public String getUsername()              { return username; }
    public void setUsername(String u)        { this.username = u; }

    public String getPassword()              { return password; }
    public void setPassword(String p)        { this.password = p; }

    public String getEmail()                 { return email; }
    public void setEmail(String e)           { this.email = e; }

    public String getPhone()                 { return phone; }
    public void setPhone(String p)           { this.phone = p; }

    public String getCollege()               { return college; }
    public void setCollege(String c)         { this.college = c; }

    public LocalDateTime getCreatedAt()      { return createdAt; }
    public void setCreatedAt(LocalDateTime t){ this.createdAt = t; }
}
