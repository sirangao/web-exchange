package com.webexchange.controller;

import com.webexchange.model.Meetup;
import com.webexchange.repository.MeetupRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.*;

@Path("/meetups")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MeetupController {

    private final MeetupRepository meetupRepo = new MeetupRepository();

    // GET /api/meetups/my
    @GET
    @Path("/my")
    public Response getMine(@Context HttpServletRequest req) {
        try {
            int userId = (int) req.getAttribute("userId");
            return Response.ok(meetupRepo.findByUserId(userId)).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // GET /api/meetups/listing/{listingId}
    @GET
    @Path("/listing/{listingId}")
    public Response getByListing(@PathParam("listingId") int listingId) {
        try {
            return Response.ok(meetupRepo.findByListingId(listingId)).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // POST /api/meetups
    @POST
    public Response create(Meetup meetup, @Context HttpServletRequest req) {
        try {
            int userId = (int) req.getAttribute("userId");
            meetup.setBuyerId(userId);
            if (meetup.getLocation() == null || meetup.getLocation().isBlank())
                return Response.status(400).entity(Map.of("error", "location is required")).build();
            if (meetup.getListingId() == 0)
                return Response.status(400).entity(Map.of("error", "listingId is required")).build();
            meetupRepo.save(meetup);
            return Response.status(201).entity(meetup).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    // PUT /api/meetups/{id}/status
    @PUT
    @Path("/{id}/status")
    public Response updateStatus(@PathParam("id") int id,
                                  Map<String, String> body,
                                  @Context HttpServletRequest req) {
        try {
            int userId = (int) req.getAttribute("userId");
            String status = body.get("status");
            if (status == null) return Response.status(400).entity(Map.of("error", "status required")).build();
            meetupRepo.updateStatus(id, status, userId);
            return Response.ok(Map.of("message", "Status updated")).build();
        } catch (Exception e) {
            return serverError(e.getMessage());
        }
    }

    private Response serverError(String msg) {
        return Response.status(500).entity(Map.of("error", msg)).build();
    }
}
