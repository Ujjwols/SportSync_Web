import request from "supertest";
import { app, server } from "../server.js"; // Import app and server
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

// Start the server and connect to the database before all tests
beforeAll(async () => {
  await mongoose.connection.dropDatabase(); // Drop the database before starting tests
});

// Close the server and database connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close(); // Close the database connection
  await new Promise((resolve) => server.close(resolve)); // Close the server
});

describe("Message Controller", () => {
  let userId;
  let authToken;
  let recipientId;
  let conversationId;

  // Create users and log in before running message-related tests
  beforeAll(async () => {
    // Sign up a new user (sender)
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

    // Sign up a second user (recipient)
    const recipientResponse = await request(app)
      .post("/api/users/signup")
      .send({
        name: "recipient",
        username: "recipient",
        email: "recipient@gmail.com",
        password: "password123",
      });

    recipientId = recipientResponse.body._id;
  });

  // Test for sending a message
  test("POST /api/messages - should send a message", async () => {
    const response = await request(app)
      .post("/api/messages")
      .set("Cookie", authToken) // Use the auth token from login
      .send({
        recipientId: recipientId,
        message: "Hello, this is a test message",
      });

    console.log("Send Message Response Body:", response.body); // Debugging: Log the response body
    console.log("Send Message Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.text).toBe("Hello, this is a test message");

    conversationId = response.body.conversationId; // Save the conversation ID for later tests
  });

  // Test for getting messages in a conversation
  test("GET /api/messages/:otherUserId - should get messages in a conversation", async () => {
    const response = await request(app)
      .get(`/api/messages/${recipientId}`)
      .set("Cookie", authToken); // Use the auth token from login

    console.log("Get Messages Response Body:", response.body); // Debugging: Log the response body
    console.log("Get Messages Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].text).toBe("Hello, this is a test message");
  });

  // Test for getting conversations
  test("GET /api/messages/conversations - should get conversations", async () => {
    const response = await request(app)
      .get("/api/messages/conversations")
      .set("Cookie", authToken); // Use the auth token from login

    console.log("Get Conversations Response Body:", response.body); // Debugging: Log the response body
    console.log("Get Conversations Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Check if the participants array contains an object with the recipient's _id
    expect(response.body[0].participants).toContainEqual(
      expect.objectContaining({ _id: recipientId })
    );
  });
});