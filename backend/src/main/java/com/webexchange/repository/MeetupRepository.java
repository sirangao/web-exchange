package com.webexchange.repository;

import com.webexchange.config.DatabaseConfig;
import com.webexchange.model.Meetup;
import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

public class MeetupRepository {

    private final DataSource ds = DatabaseConfig.getDataSource();

    private static final String BASE_SELECT =
        "SELECT m.*, b.username AS buyer_username, s.username AS seller_username " +
        "FROM meetups m " +
        "JOIN users b ON m.buyer_id = b.id " +
        "JOIN users s ON m.seller_id = s.id ";

    public List<Meetup> findByListingId(int listingId) throws SQLException {
        String sql = BASE_SELECT + "WHERE m.listing_id = ? ORDER BY m.created_at DESC";
        List<Meetup> list = new ArrayList<>();
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, listingId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    public List<Meetup> findByUserId(int userId) throws SQLException {
        String sql = BASE_SELECT + "WHERE m.buyer_id = ? OR m.seller_id = ? ORDER BY m.created_at DESC";
        List<Meetup> list = new ArrayList<>();
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    public Meetup save(Meetup meetup) throws SQLException {
        String sql = "INSERT INTO meetups (listing_id, buyer_id, seller_id, location, proposed_time, status, notes) VALUES (?,?,?,?,?,?,?)";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, meetup.getListingId());
            ps.setInt(2, meetup.getBuyerId());
            ps.setInt(3, meetup.getSellerId());
            ps.setString(4, meetup.getLocation());
            if (meetup.getProposedTime() != null)
                ps.setTimestamp(5, Timestamp.valueOf(meetup.getProposedTime()));
            else ps.setNull(5, Types.TIMESTAMP);
            ps.setString(6, "proposed");
            ps.setString(7, meetup.getNotes());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) meetup.setId(keys.getInt(1));
            }
        }
        return meetup;
    }

    public void updateStatus(int meetupId, String status, int userId) throws SQLException {
        String sql = "UPDATE meetups SET status=? WHERE id=? AND (buyer_id=? OR seller_id=?)";
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, meetupId);
            ps.setInt(3, userId);
            ps.setInt(4, userId);
            ps.executeUpdate();
        }
    }

    private Meetup mapRow(ResultSet rs) throws SQLException {
        Meetup m = new Meetup();
        m.setId(rs.getInt("id"));
        m.setListingId(rs.getInt("listing_id"));
        m.setBuyerId(rs.getInt("buyer_id"));
        m.setSellerId(rs.getInt("seller_id"));
        m.setBuyerUsername(rs.getString("buyer_username"));
        m.setSellerUsername(rs.getString("seller_username"));
        m.setLocation(rs.getString("location"));
        Timestamp pt = rs.getTimestamp("proposed_time");
        if (pt != null) m.setProposedTime(pt.toLocalDateTime());
        m.setStatus(rs.getString("status"));
        m.setNotes(rs.getString("notes"));
        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) m.setCreatedAt(ct.toLocalDateTime());
        return m;
    }
}
