import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("MONGODB_URI is not set. Mongo-backed features will be disabled.");
}

declare global {
  var _mongooseCached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global._mongooseCached;

if (!cached) {
  cached = global._mongooseCached = { conn: null, promise: null };
}

export async function connectDB() {
  if (!MONGODB_URI) return null;

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "marketpulse-ai",
        bufferCommands: false,
      })
      .then((m) => m);
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
    cached!.promise = null;
    throw error;
  }

  return cached!.conn;
}
