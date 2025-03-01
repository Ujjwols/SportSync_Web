import request from "supertest";
import { app, server } from "../server.js"; // Import app and server
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import bcrypt from "bcryptjs";

// Start the server and connect to the database before all tests
beforeAll(async () => {
  await mongoose.connection.dropDatabase(); // Drop the database before starting tests
});

// Close the server and database connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close(); // Close the database connection
  await new Promise((resolve) => server.close(resolve)); // Close the server
});

describe("Notification Controller", () => {
  let userId;
  let authToken;
  let notificationId;

  // Create a user and log in to get the auth token
  beforeAll(async () => {
    // Sign up a user
    const signupResponse = await request(app)
      .post("/api/users/signup")
      .send({
        name: "test1",
        username: "test1",
        email: "test@gmail.com",
        password: "password123",
      });

    userId = signupResponse.body._id;

    // Log in the user
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({
        username: "test1",
        password: "password123",
      });

    authToken = loginResponse.headers["set-cookie"][0];
  });

  // Test for fetching notifications
  test("should fetch notifications for the authenticated user", async () => {
    // Create a notification for the user
    const notification = await Notification.create({
      from: userId,
      to: userId,
      type: "likes",
      read: false,
    });

    notificationId = notification._id;

    const response = await request(app)
      .get("/api/notifications/getnoti")
      .set("Cookie", authToken); // Use the auth token from login

    console.log("Fetch Notifications Response Body:", response.body); // Debugging: Log the response body
    console.log("Fetch Notifications Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]._id).toBe(notificationId.toString());
    expect(response.body[0].read).toBe(true); // Ensure notifications are marked as read
  });

  // Test for deleting notifications
  test("should delete all notifications for the authenticated user", async () => {
    const response = await request(app)
      .delete("/api/notifications/delnoti")
      .set("Cookie", authToken); // Use the auth token from login

    console.log("Delete Notifications Response Body:", response.body); // Debugging: Log the response body
    console.log("Delete Notifications Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Notifications deleted successfully" });

    // Verify that notifications are deleted
    const notifications = await Notification.find({ to: userId });
    expect(notifications.length).toBe(0);
  });

});