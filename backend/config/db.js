import mongoose from "mongoose";

export const connectDB = async () => { // ✅ Named export
    try {
        await mongoose.connect("mongodb://localhost:27017/db_hsaaa", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};
