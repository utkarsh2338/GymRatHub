import mongoose from "mongoose";

export async function connectDB() {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error("MONGODB_URI is not defined in the environment variables.");
    }
    
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error:`, error);
    console.error(
      "[DB] Could not connect to MongoDB. In production this is almost always because " +
        "MongoDB Atlas Network Access does not allow your host's IP. Add 0.0.0.0/0 " +
        "(or your Render/host egress IPs) under Atlas > Network Access, and verify MONGODB_URI."
    );
    // Do NOT hard-exit: keeping the process alive lets /health respond and surfaces
    // a clear 500 from the API instead of a crash-looping container that hides the cause.
  }
}
