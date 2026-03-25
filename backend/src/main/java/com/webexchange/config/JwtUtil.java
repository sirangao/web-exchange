package com.webexchange.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Properties;

public class JwtUtil {

    private static final Key    SECRET_KEY;
    private static final long   EXPIRY_MS;

    static {
        try {
            Properties props = new Properties();
            InputStream is = JwtUtil.class.getClassLoader().getResourceAsStream("db.properties");
            props.load(is);
            String secret = props.getProperty("jwt.secret");
            SECRET_KEY = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
            long hours = Long.parseLong(props.getProperty("jwt.expiry.hours", "24"));
            EXPIRY_MS = hours * 3600 * 1000L;
        } catch (Exception e) {
            throw new RuntimeException("JWT init failed", e);
        }
    }

    public static String generateToken(int userId, String username) {
        return Jwts.builder()
            .setSubject(String.valueOf(userId))
            .claim("username", username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
            .signWith(SECRET_KEY)
            .compact();
    }

    public static Claims validateToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(SECRET_KEY)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    public static int getUserIdFromToken(String token) {
        return Integer.parseInt(validateToken(token).getSubject());
    }
}
