package com.webexchange.repository;

import com.webexchange.config.DatabaseConfig;
import com.webexchange.model.Listing;
import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

public class ListingRepository {

    private final DataSource ds = DatabaseConfig.getDataSource();

    private static final String BASE_SELECT =
        "SELECT l.*, c.name AS category_name, " +
        "u.username AS seller_username, u.email AS seller_email, u.phone AS seller_phone " +
        "FROM listings l " +
        "LEFT JOIN categories c ON l.category_id = c.id " +
        "JOIN users u ON l.user_id = u.id ";

    public List<Listing> findAll(String type, String category, String status) throws SQLException {
        StringBuilder sql = new StringBuilder(BASE_SELECT + "WHERE 1=1 ");
        List<Object> params = new ArrayList<>();
        if (type != null && !type.isBlank()) {
            sql.append("AND l.listing_type = ? ");
            params.add(type);
        }
        if (category != null && !category.isBlank()) {
            sql.append("AND c.name = ? ");
            params.add(category);
        }
        if (status != null && !status.isBlank()) {
            sql.append("AND l.status = ? ");
            params.add(status);
        } else {
            sql.append("AND l.status = 'available' ");
        }
        sql.append("ORDER BY l.created_at DESC");

        List<Listing> list = new ArrayList<>();
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        enrichWithPaymentMethods(list);
        return list;
    }

    public Optional<Listing> findById(int id) throws SQLException {
        String sql = BASE_SELECT + "WHERE l.id = ?";
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Listing l = mapRow(rs);
                    enrichWithPaymentMethods(Collections.singletonList(l));
                    return Optional.of(l);
                }
            }
        }
        return Optional.empty();
    }

    public List<Listing> findByUserId(int userId) throws SQLException {
        String sql = BASE_SELECT + "WHERE l.user_id = ? ORDER BY l.created_at DESC";
        List<Listing> list = new ArrayList<>();
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        enrichWithPaymentMethods(list);
        return list;
    }

    public Listing save(Listing listing) throws SQLException {
        String sql = "INSERT INTO listings (user_id, title, description, category_id, listing_type, price, condition_grade, status, image_url) " +
                     "VALUES (?,?,?,?,?,?,?,?,?)";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, listing.getUserId());
            ps.setString(2, listing.getTitle());
            ps.setString(3, listing.getDescription());
            setNullableInt(ps, 4, listing.getCategoryId() > 0 ? listing.getCategoryId() : null);
            ps.setString(5, listing.getListingType());
            if (listing.getPrice() != null) ps.setBigDecimal(6, listing.getPrice());
            else ps.setNull(6, Types.DECIMAL);
            ps.setString(7, listing.getConditionGrade());
            ps.setString(8, "available");
            ps.setString(9, listing.getImageUrl());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) listing.setId(keys.getInt(1));
            }
        }
        savePaymentMethods(listing);
        return listing;
    }

    public void update(Listing listing) throws SQLException {
        String sql = "UPDATE listings SET title=?, description=?, category_id=?, listing_type=?, price=?, condition_grade=?, status=?, image_url=? WHERE id=? AND user_id=?";
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, listing.getTitle());
            ps.setString(2, listing.getDescription());
            setNullableInt(ps, 3, listing.getCategoryId() > 0 ? listing.getCategoryId() : null);
            ps.setString(4, listing.getListingType());
            if (listing.getPrice() != null) ps.setBigDecimal(5, listing.getPrice());
            else ps.setNull(5, Types.DECIMAL);
            ps.setString(6, listing.getConditionGrade());
            ps.setString(7, listing.getStatus());
            ps.setString(8, listing.getImageUrl());
            ps.setInt(9, listing.getId());
            ps.setInt(10, listing.getUserId());
            ps.executeUpdate();
        }
        deletePaymentMethods(listing.getId());
        savePaymentMethods(listing);
    }

    public void delete(int listingId, int userId) throws SQLException {
        String sql = "DELETE FROM listings WHERE id=? AND user_id=?";
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, listingId);
            ps.setInt(2, userId);
            ps.executeUpdate();
        }
    }

    // ---- helpers ----

    private void savePaymentMethods(Listing l) throws SQLException {
        if (l.getPaymentMethods() == null || l.getPaymentMethods().isEmpty()) return;
        String sql = "INSERT IGNORE INTO listing_payment_methods (listing_id, method) VALUES (?,?)";
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            for (String m : l.getPaymentMethods()) {
                ps.setInt(1, l.getId());
                ps.setString(2, m);
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    private void deletePaymentMethods(int listingId) throws SQLException {
        String sql = "DELETE FROM listing_payment_methods WHERE listing_id=?";
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, listingId);
            ps.executeUpdate();
        }
    }

    private void enrichWithPaymentMethods(List<Listing> listings) throws SQLException {
        if (listings.isEmpty()) return;
        StringBuilder inClause = new StringBuilder();
        for (int i = 0; i < listings.size(); i++) {
            if (i > 0) inClause.append(",");
            inClause.append("?");
        }
        String sql = "SELECT listing_id, method FROM listing_payment_methods WHERE listing_id IN (" + inClause + ")";
        Map<Integer, List<String>> map = new HashMap<>();
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            for (int i = 0; i < listings.size(); i++) ps.setInt(i + 1, listings.get(i).getId());
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    map.computeIfAbsent(rs.getInt("listing_id"), k -> new ArrayList<>()).add(rs.getString("method"));
                }
            }
        }
        for (Listing l : listings) l.setPaymentMethods(map.getOrDefault(l.getId(), Collections.emptyList()));
    }

    private Listing mapRow(ResultSet rs) throws SQLException {
        Listing l = new Listing();
        l.setId(rs.getInt("id"));
        l.setUserId(rs.getInt("user_id"));
        l.setSellerUsername(rs.getString("seller_username"));
        l.setSellerEmail(rs.getString("seller_email"));
        l.setSellerPhone(rs.getString("seller_phone"));
        l.setTitle(rs.getString("title"));
        l.setDescription(rs.getString("description"));
        l.setCategoryId(rs.getInt("category_id"));
        l.setCategoryName(rs.getString("category_name"));
        l.setListingType(rs.getString("listing_type"));
        l.setPrice(rs.getBigDecimal("price"));
        l.setConditionGrade(rs.getString("condition_grade"));
        l.setStatus(rs.getString("status"));
        l.setImageUrl(rs.getString("image_url"));
        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) l.setCreatedAt(ts.toLocalDateTime());
        return l;
    }

    private void setNullableInt(PreparedStatement ps, int idx, Integer val) throws SQLException {
        if (val == null) ps.setNull(idx, Types.INTEGER);
        else ps.setInt(idx, val);
    }
}
