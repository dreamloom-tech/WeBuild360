import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/WeBuild360';
const dbName = 'WeBuild360'; // Using exact case to match existing database

// MongoDB connection options with retry logic
const options = {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

interface CachedConnection {
  client: any | null;
  db: any | null;
  promise: Promise<{ client: any; db: any }> | null;
}

let cached: CachedConnection = {
  client: null,
  db: null,
  promise: null,
};

export async function connectToDatabase() {
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri, options)
      .then((client: any) => {
        const db = client.db(dbName);
        cached.client = client;
        cached.db = db;
        return { client, db };
      })
      .catch((error: Error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    const result = await cached.promise;
    if (!result) throw new Error('MongoDB connection failed');
    return result;
  } catch (error: unknown) {
    cached.promise = null;
    throw error instanceof Error ? error : new Error('Unknown connection error');
  }
}

export default connectToDatabase;
