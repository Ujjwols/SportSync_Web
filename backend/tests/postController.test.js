import request from "supertest";
import { app, server } from "../server.js"; // Import app and server
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
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
describe("Post Controller", () => {
  let userId;
  let authToken;
  let postId;

  // Create a user and log in before running post-related tests
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

  // Test for creating a post
  test("should create a new post", async () => {
    const response = await request(app)
      .post("/api/posts/create")
      .set("Cookie", authToken)
      .send({
        postedBy: userId,
        text: "This is a test post",
      });

    console.log("Create Post Response Body:", response.body); // Debugging: Log the response body
    console.log("Create Post Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.text).toBe("This is a test post");

    postId = response.body._id; // Save the post ID for later tests
  });

  // Test for getting a post by ID
  test("should get a post by ID", async () => {
    const response = await request(app)
      .get(`/api/posts/${postId}`)
      .set("Cookie", authToken);

    console.log("Get Post Response Body:", response.body); // Debugging: Log the response body
    console.log("Get Post Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(postId);
    expect(response.body.text).toBe("This is a test post");
  });

  // Test for deleting a post
  test("should delete a post", async () => {
    const response = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Cookie", authToken);

    console.log("Delete Post Response Body:", response.body); // Debugging: Log the response body
    console.log("Delete Post Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Post deleted successfully" });

    // Verify that the post is deleted
    const deletedPost = await Post.findById(postId);
    expect(deletedPost).toBeNull();
  });

  // Test for liking a post
  test("should like a post", async () => {
    // Create a new post to like
    const postResponse = await request(app)
      .post("/api/posts/create")
      .set("Cookie", authToken)
      .send({
        postedBy: userId,
        text: "This is a post to like",
      });

    const postToLikeId = postResponse.body._id;

    // Like the post
    const likeResponse = await request(app)
      .put(`/api/posts/like/${postToLikeId}`)
      .set("Cookie", authToken);

    console.log("Like Post Response Body:", likeResponse.body); // Debugging: Log the response body
    console.log("Like Post Response Status:", likeResponse.status); // Debugging: Log the status code

    expect(likeResponse.status).toBe(200);
    expect(likeResponse.body).toEqual({ message: "Post liked successfully" });

    // Verify that the post is liked
    const post = await Post.findById(postToLikeId);
    expect(post.likes).toContainEqual(new mongoose.Types.ObjectId(userId)); // Convert userId to ObjectId
  });

  // Test for replying to a post
  test("should reply to a post", async () => {
    // Create a new post to reply to
    const postResponse = await request(app)
      .post("/api/posts/create")
      .set("Cookie", authToken)
      .send({
        postedBy: userId,
        text: "This is a post to reply to",
      });

    const postToReplyId = postResponse.body._id;

    // Reply to the post
    const replyResponse = await request(app)
      .put(`/api/posts/reply/${postToReplyId}`)
      .set("Cookie", authToken)
      .send({
        text: "This is a reply",
      });

    console.log("Reply to Post Response Body:", replyResponse.body); // Debugging: Log the response body
    console.log("Reply to Post Response Status:", replyResponse.status); // Debugging: Log the status code

    expect(replyResponse.status).toBe(200);
    expect(replyResponse.body.text).toBe("This is a reply");

    // Verify that the reply is added to the post
    const post = await Post.findById(postToReplyId);
    expect(post.replies).toContainEqual(expect.objectContaining({ text: "This is a reply" }));
  });

  // Test for getting feed posts
  test("should get feed posts", async () => {
    const response = await request(app)
      .get("/api/posts/feed")
      .set("Cookie", authToken);

    console.log("Get Feed Posts Response Body:", response.body); // Debugging: Log the response body
    console.log("Get Feed Posts Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test for getting user-specific posts
  test("should get posts by username", async () => {
    const response = await request(app)
      .get(`/api/posts/user/testuser`)
      .set("Cookie", authToken);

    console.log("Get User Posts Response Body:", response.body); // Debugging: Log the response body
    console.log("Get User Posts Response Status:", response.status); // Debugging: Log the status code

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});