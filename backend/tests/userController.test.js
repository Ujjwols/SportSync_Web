import request from "supertest";
import { app, server } from "../server.js"; // Import app and server
import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// Start the server and connect to the database before all tests
beforeAll(async () => {
  await mongoose.connection.dropDatabase(); // Drop the database before starting tests
});

// Close the server and database connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close(); // Close the database connection
  await new Promise((resolve) => server.close(resolve)); // Close the server
});

describe("User Controller", () => {
  let userId;
  let authToken;

  // Test for signing up a new user
  test("should sign up a new user", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        name: "test1",
        username: "test1",
        email: "test@gmail.com",
        password: "password123",
      });

    console.log(response.body); // Debugging: Log the response body
    console.log(response.status); // Debugging: Log the status code

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");

    userId = response.body._id;
    const user = await User.findById(userId);
    console.log("User saved in database:", user);
  });

  // Test for logging in the user
  test("should log in the user", async () => {
    console.log("Database Connection:", mongoose.connection.readyState); // Should log 1 (connected)
    // Add a small delay to ensure the user is saved
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 500ms delay

    const user = await User.findOne({ username: "test1" });
    console.log("User in Database:", user); // Debugging: Log the user object

    const response = await request(app)
      .post("/api/users/login")
      .send({
        username: "test1", // Ensure this matches the signup username
        password: "password123", // Ensure this matches the signup password
      });

    console.log("Login Response Body:", response.body); // Debugging: Log the response body
    console.log("Login Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id");

    // Save the auth token for subsequent requests
    authToken = response.headers["set-cookie"][0];
  });

  // Test for getting user profile
  test("should get user profile by userId", async () => {
    const response = await request(app)
      .get(`/api/users/profile/${userId}`)
      .set("Cookie", authToken); // Use the auth token from login

    console.log("Get User Profile Response Body:", response.body); // Debugging: Log the response body
    console.log("Get User Profile Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body._id).toBe(userId);
  });

  // Test for logging out the user
  test("should log out the user", async () => {
    const response = await request(app)
      .post("/api/users/logout")
      .set("Cookie", authToken); // Use the auth token from login

    console.log("Logout Response Body:", response.body); // Debugging: Log the response body
    console.log("Logout Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "User logged out successfully" });
  });

  // Test for following/unfollowing a user
  test("should follow/unfollow a user", async () => {
    // Create a second user to follow/unfollow
    const secondUser = await User.create({
      name: "test2",
      username: "test2",
      email: "test2@gmail.com",
      password: "password123",
    });

    const response = await request(app)
      .post(`/api/users/follow/${secondUser._id}`)
      .set("Cookie", authToken); // Use the auth token from login

    console.log("Follow/Unfollow Response Body:", response.body); // Debugging: Log the response body
    console.log("Follow/Unfollow Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  // Test for updating user profile
  test("should update user profile", async () => {
    const updatedData = {
      name: "Updated Name",
      bio: "Updated Bio",
    };

    const response = await request(app)
      .put(`/api/users/update/${userId}`)
      .set("Cookie", authToken) // Use the auth token from login
      .send(updatedData);

    console.log("Update User Profile Response Body:", response.body); // Debugging: Log the response body
    console.log("Update User Profile Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updatedData.name);
    expect(response.body.bio).toBe(updatedData.bio);
  });

  // Test for getting suggested users
  test("should get suggested users", async () => {
    const response = await request(app)
      .get("/api/users/suggested")
      .set("Cookie", authToken); // Use the auth token from login

    console.log("Suggested Users Response Body:", response.body); // Debugging: Log the response body
    console.log("Suggested Users Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

});