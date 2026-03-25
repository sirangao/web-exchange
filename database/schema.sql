-- Web Exchange Platform - Database Schema
-- Run: /usr/local/mysql/bin/mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS web_exchange CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE web_exchange;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- bcrypt hashed
    email       VARCHAR(100) NOT NULL UNIQUE,
    phone       VARCHAR(20),
    college     VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO categories (name) VALUES
  ('Textbooks'), ('Electronics'), ('Furniture'), ('Clothing'),
  ('Sports'), ('Kitchen'), ('Bikes'), ('Other');

-- Listings table (covers both sell & exchange)
CREATE TABLE IF NOT EXISTS listings (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT          NOT NULL,
    title            VARCHAR(150) NOT NULL,
    description      TEXT,
    category_id      INT,
    listing_type     ENUM('sell','exchange','both') NOT NULL DEFAULT 'sell',
    price            DECIMAL(10,2),                         -- NULL for exchange-only
    condition_grade  ENUM('new','like_new','good','fair','poor') NOT NULL DEFAULT 'good',
    status           ENUM('available','pending','sold','exchanged') NOT NULL DEFAULT 'available',
    image_url        VARCHAR(500),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Payment methods per listing (only relevant for sell listings)
CREATE TABLE IF NOT EXISTS listing_payment_methods (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    method     ENUM('paypal','venmo','zelle','cash') NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    UNIQUE KEY uq_listing_method (listing_id, method)
);

-- Meetup / exchange location proposals
CREATE TABLE IF NOT EXISTS meetups (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    listing_id    INT  NOT NULL,
    buyer_id      INT  NOT NULL,
    seller_id     INT  NOT NULL,
    location      VARCHAR(255) NOT NULL,
    proposed_time DATETIME,
    status        ENUM('proposed','confirmed','cancelled','completed') NOT NULL DEFAULT 'proposed',
    notes         TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id)  REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (seller_id)   REFERENCES users(id)    ON DELETE CASCADE
);

-- Messages between users about a listing
CREATE TABLE IF NOT EXISTS messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    listing_id  INT  NOT NULL,
    sender_id   INT  NOT NULL,
    receiver_id INT  NOT NULL,
    content     TEXT NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id)   REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (receiver_id)  REFERENCES users(id)    ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_listings_user       ON listings(user_id);
CREATE INDEX idx_listings_status     ON listings(status);
CREATE INDEX idx_listings_type       ON listings(listing_type);
CREATE INDEX idx_listings_category   ON listings(category_id);
CREATE INDEX idx_messages_listing    ON messages(listing_id);
CREATE INDEX idx_messages_receiver   ON messages(receiver_id);
CREATE INDEX idx_meetups_listing     ON meetups(listing_id);
