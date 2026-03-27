import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = global as unknown as {
  mongoose?: MongooseCache;
};

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = {
    conn: null,
    promise: null,
  };
}

const cached = globalForMongoose.mongoose;

async function connectToDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    // Throw only at runtime, never at module evaluation!
    throw new Error("Please define MONGODB_URI in .env");
  }

  // 🔒 Freeze as string (TypeScript now knows)
  const MONGODB_URI_STRING: string = MONGODB_URI;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // ✅ TypeScript is satisfied
    cached.promise = mongoose.connect(MONGODB_URI_STRING);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDB;
