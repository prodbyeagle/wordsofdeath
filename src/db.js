// src/db/index.ts

import { MongoClient } from "mongodb";

// Erstelle einen neuen MongoClient
const client = new MongoClient(process.env.MONGODB_URI);

// Stile für Konsolenausgaben
const orangeStyle = 'color: orange; font-weight: bold;';
const greenStyle = 'color: green; font-weight: bold;';
const redStyle = 'color: red; font-weight: bold;';

let db;

/**
 * Stellt eine Verbindung zur MongoDB-Datenbank her.
 * 
 * Diese Funktion überprüft, ob bereits eine Datenbankverbindung besteht.
 * Falls nicht, wird eine Verbindung zur Datenbank "wordsofdeath" hergestellt.
 * 
 * @returns {Promise<Db>} Die Datenbankinstanz.
 */
export async function connectToDatabase() {
   if (!db) {
      console.log("%c[DB]: %cConnecting to the database...", greenStyle, "color: white;");
      await client.connect();
      db = client.db("wordsofdeath");
      console.log("%c[DB]: %cConnected to the database.", orangeStyle, "color: white;");
   }
   return db;
}

/**
 * Holt alle Einträge aus der 'entries'-Kollektion.
 * 
 * Diese Funktion verbindet sich mit der Datenbank und holt alle
 * Einträge aus der 'entries'-Kollektion und gibt sie als Array zurück.
 * 
 * @returns {Promise<Array>} Ein Array von Einträgen.
 */
export async function getEntries() {
   const database = await connectToDatabase();
   console.log("%c[DB]: %cFetching entries from the 'entries' collection.", orangeStyle, "color: white;");
   const entries = await database.collection("entries").find().toArray();
   console.log(`%c[DB]: %cRetrieved ${entries.length} entries.`, greenStyle, "color: white;");
   return entries;
}

/**
 * Holt einen Benutzer anhand des Benutzernamens.
 * 
 * Diese Funktion verbindet sich mit der Datenbank und sucht nach einem
 * Benutzer mit dem angegebenen Benutzernamen in der 'users'-Kollektion.
 * 
 * @param {string} username - Der Benutzername des gesuchten Benutzers.
 * @returns {Promise<Object|null>} Das Benutzerobjekt oder null, wenn der Benutzer nicht gefunden wurde.
 */
export async function getUser(username) {
   const database = await connectToDatabase();
   console.log(`%c[DB]: %cFetching user with username: ${username}`, orangeStyle, "color: white;");

   const user = await database.collection("users").findOne({ username: username });
   if (user) {
      console.log(`%c[DB]: %cUser found: ${username}`, greenStyle, "color: white;");
   } else {
      console.log(`%c[DB]: %cUser not found: ${username}`, redStyle, "color: white;");
   }
   return user;
}
