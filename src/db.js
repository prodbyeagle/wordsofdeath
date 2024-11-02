import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export async function connectToDatabase() {
   if (!db) {
      await client.connect();
      db = client.db("wordsofdeath");
   }
   return db;
}

export async function getEntries() {
   const database = await connectToDatabase();
   return database.collection("entries").find().toArray();
}

export async function getUser(username) {
   const database = await connectToDatabase();
   return database.collection("users").findOne({ name: username });
}
