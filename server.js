import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import axios from 'axios';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const client = new MongoClient(process.env.MONGODB_URI);

let db;
async function connectDB() {
   if (!db) {
      await client.connect();
      db = client.db("wordsofdeath");
      console.log("[SERVER]: Datenbank verbunden und Whitelist initialisiert.");
   }
   return db;
}

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.SERVER_URL}/auth/discord/callback`;
const corsOptions = {
   origin: 'http://localhost:3000',
   credentials: true,    
};

app.use(cookieParser());
app.use(session({
   secret: JWT_SECRET,
   resave: false,
   saveUninitialized: true,
}));

app.use(express.json());
app.use(cors(corsOptions));

/**
 * Authentifiziert den Benutzer über Discord und leitet ihn zurück zur Anwendung.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
app.get('/auth/discord', (req, res) => {
   const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
   console.log("[SERVER]: Benutzer wird zur Discord Authentifizierungsseite umgeleitet.");
   res.redirect(discordAuthUrl);
});

/**
 * Callback-Route für Discord OAuth2. Authentifiziert den Benutzer und erstellt ein JWT.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
app.get('/auth/discord/callback', async (req, res) => {
   const { code } = req.query;
   if (!code) {
      console.log("[SERVER]: Fehler - Kein Code erhalten.");
      return res.status(400).send('Fehler: Kein Code erhalten.');
   }

   try {
      console.log("[SERVER]: Versuche, Token von Discord zu erhalten...");
      const tokenResponse = await axios.post(
         'https://discord.com/api/oauth2/token',
         new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            scope: 'identify',
         }),
         { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token } = tokenResponse.data;

      console.log("[SERVER]: Token erhalten, Benutzerinformationen werden abgerufen...");
      const userInfoResponse = await axios.get('https://discord.com/api/users/@me', {
         headers: { Authorization: `Bearer ${access_token}` },
      });

      const { username, avatar, id } = userInfoResponse.data;

      const database = await connectDB();
      const userInWhitelist = await database.collection('whitelist').findOne({ username });

      if (!userInWhitelist) {
         console.log("[SERVER]: Fehler - Benutzer nicht auf der Whitelist.");
         return res.status(403).send('Fehler: Benutzer nicht auf der Whitelist.');
      }

      const usersCollection = database.collection('users');
      const existingUser = await usersCollection.findOne({ id });

      if (!existingUser) {
         await usersCollection.insertOne({
            id,
            username,
            avatar,
            joined_at: new Date(),
         });
         console.log(`[SERVER]: Benutzer ${username} zur Datenbank hinzugefügt.`);
      }

      const token = jwt.sign({ username, avatar, id }, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('wod_token', token, {
         maxAge: 24 * 60 * 60 * 1000,
         sameSite: 'lax',
      });
      console.log("[SERVER]: Benutzer erfolgreich authentifiziert und zur Anwendung umgeleitet.");
      res.redirect('http://localhost:3000/');
   } catch (error) {
      console.error('[SERVER]: Fehler bei der Discord Authentifizierung:', error);
      res.status(500).send('Fehler bei der Authentifizierung');
   }
});

/**
 * Middleware zur Authentifizierung des Tokens.
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function authenticateToken(req, res, next) {
   const authHeader = req.headers.authorization;
   const token = authHeader && authHeader.split(' ')[1];
   if (!token) {
      console.log("[SERVER]: Fehler - Kein Token im Authorization-Header.");
      return res.status(401).send('Nicht autorisiert.');
   }

   jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
         console.log("[SERVER]: Fehler - Token ungültig.");
         return res.status(403).send('Token ungültig.');
      }
      req.user = user;
      next();
   });
}


/**
 * POST-Endpunkt zum Erstellen eines neuen Eintrags.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
app.post('/api/entries', authenticateToken, async (req, res) => {
   console.log("Authorization Header:", req.headers.authorization);
   const { entry, type, categories, variation } = req.body;

   if (!entry || !type || !categories || !variation) {
      console.log("[SERVER]: Fehler - Alle Felder müssen ausgefüllt sein.");
      return res.status(400).send('Fehler: Alle Felder müssen ausgefüllt sein.');
   }

   const newEntry = {
      entry,
      type,
      categories,
      author: req.user.username,
      authorId: req.user.id,
      timestamp: new Date().toISOString(),
      variation,
   };

   try {
      const database = await connectDB();
      const result = await database.collection('entries').insertOne(newEntry);
      console.log(`[SERVER]: Neuer Eintrag erstellt: ${entry} (ID: ${result.insertedId})`);
      res.status(201).send({ message: 'Eintrag erfolgreich erstellt', entryId: result.insertedId });
   } catch (error) {
      console.error('[SERVER]: Fehler beim Erstellen des Eintrags:', error);
      res.status(500).send('Fehler beim Erstellen des Eintrags.');
   }
});

app.post('/api/whitelist', authenticateToken, async (req, res) => {
   const { username } = req.body;
   if (!username) {
      return res.status(400).send('Benutzername ist erforderlich.');
   }

   try {
      const database = await connectDB();
      const existingUser = await database.collection('whitelist').findOne({ username });
      if (existingUser) {
         return res.status(400).send('Benutzer ist bereits auf der Whitelist.');
      }

      const result = await database.collection('whitelist').insertOne({ username });
      res.status(201).send({ id: result.insertedId, username });
   } catch (error) {
      console.error('[SERVER]: Fehler beim Hinzufügen des Benutzers zur Whitelist:', error);
      res.status(500).send('Fehler beim Hinzufügen des Benutzers zur Whitelist.');
   }
});

app.get('/api/whitelist', authenticateToken, async (req, res) => {
   try {
      const database = await connectDB();
      const users = await database.collection('whitelist').find({}).toArray();
      res.status(200).json(users);
   } catch (error) {
      console.error('[SERVER]: Fehler beim Abrufen der Whitelist-Benutzer:', error);
      res.status(500).send('Fehler beim Abrufen der Whitelist-Benutzer.');
   }
});

app.delete('/api/whitelist/:username', authenticateToken, async (req, res) => {
   const username = req.params.username; // username ist jetzt der Parameter

   try {
      const database = await connectDB();
      const result = await database.collection('whitelist').deleteOne({ username });

      if (result.deletedCount === 0) {
         return res.status(404).json({ message: "Benutzer nicht gefunden." });
      }

      res.status(200).json({ message: "Benutzer erfolgreich entfernt." });
   } catch (error) {
      console.error('[SERVER]: Fehler beim Entfernen des Benutzers von der Whitelist:', error);
      res.status(500).json({ message: "Interner Serverfehler." });
   }
});

/**
 * GET-Endpunkt zum Abrufen aller Einträge.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
app.get('/api/entries', authenticateToken, async (req, res) => {
   try {
      const database = await connectDB();
      const entries = await database.collection('entries').find({}).toArray();

      console.log(`[SERVER]: ${entries.length} Einträge wurden abgerufen.`);
      res.status(200).json(entries);
   } catch (error) {
      console.error('[SERVER]: Fehler beim Abrufen der Einträge:', error);
      res.status(500).send('Fehler beim Abrufen der Einträge.');
   }
});

app.delete('/api/entries/:id', authenticateToken, async (req, res) => {
   const entryId = req.params.id;
   try {
      const database = await connectDB();
      const result = await database.collection('entries').deleteOne({ _id: new MongoClient.ObjectId(entryId) });

      if (result.deletedCount === 0) {
         return res.status(404).send('Eintrag nicht gefunden.');
      }

      res.status(200).send('Eintrag erfolgreich gelöscht.');
   } catch (error) {
      console.error('[SERVER]: Fehler beim Löschen des Eintrags:', error);
      res.status(500).send('Fehler beim Löschen des Eintrags.');
   }
});

// Die App startet und hört auf dem angegebenen Port
app.listen(PORT, () => {
   console.log(`[SERVER]: Server läuft auf http://localhost:${PORT}`);
});

export default app;

// Verbinden mit der Datenbank bei Serverstart
connectDB().catch(console.error);
