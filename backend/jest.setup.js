import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB } from '../backend/config/db.js'; // Adjust the path

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create(); // Start in-memory MongoDB server
  const uri = mongoServer.getUri(); // Get the connection URI
  await connectDB(uri); // Connect to the in-memory database
});

afterAll(async () => {
  await mongoose.disconnect(); // Disconnect from the database
  await mongoServer.stop(); // Stop the in-memory MongoDB server
});
