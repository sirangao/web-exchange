package com.webexchange.controller;

import com.webexchange.model.Listing;
import com.webexchange.repository.ListingRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.*;
import org.glassfish.jersey.media.multipart.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;

@Path("/listings")
@Produces(MediaType.APPLICATION_JSON)
public class ListingController {

    private final ListingRepository listingRepo = new ListingRepository();

    // GET /api/listings?type=sell&category=Textbooks
    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    public Response getAll(@QueryParam("type")     String type,
                           @QueryParam("category") String category,
                           @QueryParam("status")   String status) {
        try {
            List<Listing> listings = listingRepo.findAll(type, category, status);
            return Response.ok(listings).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // GET /api/listings/{id}
    @GET
    @Path("/{id}")
    public Response getOne(@PathParam("id") int id) {
        try {
            Optional<Listing> opt = listingRepo.findById(id);
            return opt.map(l -> Response.ok(l).build())
                      .orElse(Response.status(404).entity(Map.of("error", "Not found")).build());
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // GET /api/listings/my
    @GET
    @Path("/my")
    public Response getMine(@Context HttpServletRequest req) {
        try {
            int userId = (int) req.getAttribute("userId");
            return Response.ok(listingRepo.findByUserId(userId)).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // POST /api/listings  (multipart for image upload)
    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response create(@FormDataParam("title")          String title,
                           @FormDataParam("description")    String description,
                           @FormDataParam("categoryId")     int categoryId,
                           @FormDataParam("listingType")    String listingType,
                           @FormDataParam("price")          String priceStr,
                           @FormDataParam("conditionGrade") String conditionGrade,
                           @FormDataParam("paymentMethods") String paymentMethodsJson,
                           @FormDataParam("image")          InputStream imageStream,
                           @FormDataParam("image")          FormDataContentDisposition imageDetail,
                           @Context HttpServletRequest req) {
        try {
            int userId = (int) req.getAttribute("userId");

            Listing listing = new Listing();
            listing.setUserId(userId);
            listing.setTitle(title);
            listing.setDescription(description);
            listing.setCategoryId(categoryId);
            listing.setListingType(listingType != null ? listingType : "sell");
            listing.setConditionGrade(conditionGrade != null ? conditionGrade : "good");

            if (priceStr != null && !priceStr.isBlank()) {
                listing.setPrice(new java.math.BigDecimal(priceStr));
            }

            // Parse payment methods (comma-separated string)
            if (paymentMethodsJson != null && !paymentMethodsJson.isBlank()) {
                listing.setPaymentMethods(Arrays.asList(paymentMethodsJson.split(",")));
            }

            // Handle image upload
            if (imageStream != null && imageDetail != null && imageDetail.getFileName() != null) {
                String uploadDir = getUploadDir();
                Files.createDirectories(Paths.get(uploadDir));
                String ext = getExtension(imageDetail.getFileName());
                String fileName = UUID.randomUUID() + ext;
                java.nio.file.Path dest = Paths.get(uploadDir, fileName);
                Files.copy(imageStream, dest, StandardCopyOption.REPLACE_EXISTING);
                listing.setImageUrl("/uploads/" + fileName);
            }

            listingRepo.save(listing);
            return Response.status(201).entity(listing).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // PUT /api/listings/{id}
    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(@PathParam("id") int id, Listing body,
                           @Context HttpServletRequest req) {
        try {
            int userId = (int) req.getAttribute("userId");
            Optional<Listing> opt = listingRepo.findById(id);
            if (opt.isEmpty()) return Response.status(404).entity(Map.of("error", "Not found")).build();

            Listing existing = opt.get();
            if (existing.getUserId() != userId)
                return Response.status(403).entity(Map.of("error", "Forbidden")).build();

            body.setId(id);
            body.setUserId(userId);
            listingRepo.update(body);
            return Response.ok(body).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // DELETE /api/listings/{id}
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") int id, @Context HttpServletRequest req) {
        try {
            int userId = (int) req.getAttribute("userId");
            listingRepo.delete(id, userId);
            return Response.ok(Map.of("message", "Deleted")).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // ---- helpers ----

    private String getUploadDir() {
        // Try system property, fallback to user home
        String dir = System.getProperty("upload.dir");
        if (dir == null) dir = System.getProperty("user.home") + "/web-exchange-uploads";
        return dir;
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return (dot >= 0) ? filename.substring(dot) : ".jpg";
    }

    private Response serverError(String msg) {
        return Response.status(500).entity(Map.of("error", msg)).build();
    }
}
