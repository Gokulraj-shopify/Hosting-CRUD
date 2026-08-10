import {MongoClient} from "mongodb";

const uri = process.env.MONGODB_URI;

if(!uri) {
  throw new Error("MONGODB_URI is not defined in .env file");
}

const client = new MongoClient(uri);

export const db = client.db(process.env.DB_NAME);