package com.webexchange.controller;

import com.webexchange.config.DatabaseConfig;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.sql.*;
import java.util.*;

@Path("/categories")
@Produces(MediaType.APPLICATION_JSON)
public class CategoryController {

    @GET
    public Response getAll() {
        List<Map<String, Object>> list = new ArrayList<>();
        try (Connection c = DatabaseConfig.getDataSource().getConnection();
             Statement s = c.createStatement();
             ResultSet rs = s.executeQuery("SELECT id, name FROM categories ORDER BY name")) {
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id",   rs.getInt("id"));
                row.put("name", rs.getString("name"));
                list.add(row);
            }
            return Response.ok(list).build();
        } catch (Exception e) {
            return Response.status(500).entity(Map.of("error", e.getMessage())).build();
        }
    }
}
