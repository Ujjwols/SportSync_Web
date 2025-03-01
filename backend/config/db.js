import mongoose from "mongoose";

let isConnected = false; // ✅ Track connection status

export const connectDB = async () => {
    if (isConnected) {
        console.log("⚠️ Using existing database connection");
        return;
    }

    const dbURI = process.env.NODE_ENV === 'test' 
        ? 'mongodb://localhost:27017/testdbsportsync' // Test DB URL
        : 'mongodb://localhost:27017/dbsportsync';   // Default DB URL for development or production

    try {
        const db = await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = db.connections[0].readyState; // ✅ Mark as connected
        console.log("✅ Database connected successfully:", dbURI);
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    }
};
