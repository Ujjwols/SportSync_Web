import request from "supertest";
import { app, server } from "../server.js"; // Import app and server
import mongoose from "mongoose";
import User from "../models/userModel.js";
import MatchmakingPost from "../models/matchModel.js";

// Start the server and connect to the database before all tests
beforeAll(async () => {
  await mongoose.connection.dropDatabase(); // Drop the database before starting tests
});

// Close the server and database connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close(); // Close the database connection
  await new Promise((resolve) => server.close(resolve)); // Close the server
});

describe("MatchmakingPost Controller", () => {
  let userId;
  let authToken;
  let matchPostId;

  // Create a user and log in before running matchmaking post-related tests
  beforeAll(async () => {
    // Sign up a new user
    const signupResponse = await request(app)
      .post("/api/users/signup")
      .send({
        name: "testuser",
        username: "testuser",
        email: "testuser@gmail.com",
        password: "password123",
      });

    userId = signupResponse.body._id;

    // Log in the user and get the auth token
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({
        username: "testuser",
        password: "password123",
      });

    authToken = loginResponse.headers["set-cookie"][0];
  });

  // Test for creating a matchmaking post
  test("POST /api/matchpost/create - should create a new matchmaking post", async () => {
    const response = await request(app)
      .post("/api/matchpost/create")
      .set("Cookie", authToken)
      .send({
        postedBy: userId,
        text: "This is a test match post",
        teamName: "Test Team",
        location: "Test Location",
        date: "2023-10-01",
        time: "10:00 AM",
        gameType: "Test Game",
        payment: "Free",
      });

    console.log("Create Matchmaking Post Response Body:", response.body); // Debugging: Log the response body
    console.log("Create Matchmaking Post Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.text).toBe("This is a test match post");

    matchPostId = response.body._id; // Save the match post ID for later tests
  });

  // Test for getting a matchmaking post by ID
  test("GET /api/matchpost/:id - should get a matchmaking post by ID", async () => {
    const response = await request(app)
      .get(`/api/matchpost/${matchPostId}`)
      .set("Cookie", authToken);

    console.log("Get Matchmaking Post Response Body:", response.body); // Debugging: Log the response body
    console.log("Get Matchmaking Post Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(matchPostId);
    expect(response.body.text).toBe("This is a test match post");
  });

  // Test for deleting a matchmaking post
  test("DELETE /api/matchpost/:id - should delete a matchmaking post", async () => {
    const response = await request(app)
      .delete(`/api/matchpost/${matchPostId}`)
      .set("Cookie", authToken);

    console.log("Delete Matchmaking Post Response Body:", response.body); // Debugging: Log the response body
    console.log("Delete Matchmaking Post Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Post deleted successfully" });

    // Verify that the matchmaking post is deleted
    const deletedPost = await MatchmakingPost.findById(matchPostId);
    expect(deletedPost).toBeNull();
  });

  // Test for getting matchmaking posts by username
  test("GET /api/matchpost/user/:username - should get matchmaking posts by username", async () => {
    const response = await request(app)
      .get(`/api/matchpost/user/testuser`)
      .set("Cookie", authToken);

    console.log("Get User Matchmaking Posts Response Body:", response.body); // Debugging: Log the response body
    console.log("Get User Matchmaking Posts Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test for getting match feed posts
  test("GET /api/matchpost/matchfeed - should get match feed posts", async () => {
    const response = await request(app)
      .get("/api/matchpost/matchfeed")
      .set("Cookie", authToken);

    console.log("Get Match Feed Posts Response Body:", response.body); // Debugging: Log the response body
    console.log("Get Match Feed Posts Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});