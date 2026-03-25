package com.webexchange.controller;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.webexchange.config.JwtUtil;
import com.webexchange.model.User;
import com.webexchange.repository.UserRepository;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.Map;
import java.util.Optional;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    private final UserRepository userRepo = new UserRepository();

    // POST /api/auth/register
    @POST
    @Path("/register")
    public Response register(Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");
            String email    = body.get("email");
            String phone    = body.get("phone");
            String college  = body.get("college");

            if (username == null || password == null || email == null)
                return badRequest("username, password, and email are required");

            if (userRepo.existsByUsername(username))
                return badRequest("Username already taken");

            if (userRepo.existsByEmail(email))
                return badRequest("Email already registered");

            User user = new User();
            user.setUsername(username.trim());
            user.setPassword(BCrypt.withDefaults().hashToString(12, password.toCharArray()));
            user.setEmail(email.trim().toLowerCase());
            user.setPhone(phone);
            user.setCollege(college);

            userRepo.save(user);
            user.setPassword(null); // strip before returning

            String token = JwtUtil.generateToken(user.getId(), user.getUsername());
            return Response.ok(Map.of("token", token, "user", user)).build();

        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // POST /api/auth/login
    @POST
    @Path("/login")
    public Response login(Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");

            if (username == null || password == null)
                return badRequest("username and password are required");

            Optional<User> opt = userRepo.findByUsername(username);
            if (opt.isEmpty())
                return Response.status(401).entity(Map.of("error", "Invalid credentials")).build();

            User user = opt.get();
            BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), user.getPassword());
            if (!result.verified)
                return Response.status(401).entity(Map.of("error", "Invalid credentials")).build();

            String token = JwtUtil.generateToken(user.getId(), user.getUsername());
            user.setPassword(null);
            return Response.ok(Map.of("token", token, "user", user)).build();

        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // GET /api/auth/me
    @GET
    @Path("/me")
    public Response me(@Context jakarta.servlet.http.HttpServletRequest req) {
        try {
            int userId = (int) req.getAttribute("userId");
            Optional<User> opt = userRepo.findById(userId);
            if (opt.isEmpty()) return Response.status(404).entity(Map.of("error", "User not found")).build();
            User user = opt.get();
            user.setPassword(null);
            return Response.ok(user).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // PUT /api/auth/profile
    @PUT
    @Path("/profile")
    public Response updateProfile(Map<String, String> body,
                                   @Context jakarta.servlet.http.HttpServletRequest req) {
        try {
            int userId = (int) req.getAttribute("userId");
            Optional<User> opt = userRepo.findById(userId);
            if (opt.isEmpty()) return Response.status(404).entity(Map.of("error", "User not found")).build();

            User user = opt.get();
            if (body.containsKey("email"))   user.setEmail(body.get("email"));
            if (body.containsKey("phone"))   user.setPhone(body.get("phone"));
            if (body.containsKey("college")) user.setCollege(body.get("college"));
            userRepo.update(user);
            user.setPassword(null);
            return Response.ok(user).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    private Response badRequest(String msg) {
        return Response.status(400).entity(Map.of("error", msg)).build();
    }

    private Response serverError(String msg) {
        return Response.status(500).entity(Map.of("error", msg)).build();
    }
}
