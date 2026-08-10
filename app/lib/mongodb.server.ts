import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env file");
}

if (!dbName) {
  throw new Error("DB_NAME is not defined in .env file");
}

// Global for connection caching (reused across invocations in serverless)
let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export const db = {
  collection: async (name: string) => {
    const client = await getClient();
    return client.db(dbName).collection(name);
  },
};