import mongoose from "mongoose";
import { MONGO_URI } from "../config/config.js";

let isConnected = false; // track the connection status

export async function connectToMongo() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}
