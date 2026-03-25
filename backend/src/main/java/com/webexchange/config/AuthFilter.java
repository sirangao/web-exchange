package com.webexchange.config;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class AuthFilter implements Filter {

    // Paths that do NOT require a JWT
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
        "/api/auth/login",
        "/api/auth/register",
        "/api/listings"          // GET listings is public
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest)  request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String path   = req.getRequestURI().substring(req.getContextPath().length());
        String method = req.getMethod();

        // Allow public GET on /api/listings
        boolean isPublicGet = method.equals("GET") && path.startsWith("/api/listings");

        if (PUBLIC_PATHS.contains(path) || isPublicGet || method.equals("OPTIONS")) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\":\"Missing or invalid Authorization header\"}");
            return;
        }

        try {
            String token  = authHeader.substring(7);
            int    userId = JwtUtil.getUserIdFromToken(token);
            req.setAttribute("userId", userId);
            chain.doFilter(request, response);
        } catch (JwtException e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\":\"Invalid or expired token\"}");
        }
    }
}
