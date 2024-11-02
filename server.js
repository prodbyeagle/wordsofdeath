import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import axios from 'axios';
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
      console.log("Datenbank verbunden und Whitelist initialisiert.");
   }
   return db;
}

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.SERVER_URL}/auth/discord/callback`;

// Session und Cookies
app.use(cookieParser());
app.use(session({
   secret: JWT_SECRET,
   resave: false,
   saveUninitialized: true,
}));

app.use(express.json());

// OAuth2 Endpunkt für Discord Login
app.get('/auth/discord', (req, res) => {
   const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
   res.redirect(discordAuthUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
   const { code } = req.query;
   if (!code) return res.status(400).send('Fehler: Kein Code erhalten.');

   try {
      // Token von Discord abrufen
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

      // Benutzerinformationen abrufen
      const userInfoResponse = await axios.get('https://discord.com/api/users/@me', {
         headers: { Authorization: `Bearer ${access_token}` },
      });

      const { username, avatar, id } = userInfoResponse.data;

      // Prüfen, ob Benutzer auf Whitelist steht
      const database = await connectDB();
      const userInWhitelist = await database.collection('whitelist').findOne({ username });

      if (!userInWhitelist) {
         return res.status(403).send('Fehler: Benutzer nicht auf der Whitelist.');
      }

      // Benutzer in "users" speichern, wenn nicht vorhanden
      const usersCollection = database.collection('users');
      const existingUser = await usersCollection.findOne({ id });

      if (!existingUser) {
         await usersCollection.insertOne({
            id,
            username,
            avatar,
            joined_at: new Date(),
         });
         console.log(`Benutzer ${username} zur Datenbank hinzugefügt.`);
      }

      // JWT erzeugen
      const token = jwt.sign({ username, avatar }, JWT_SECRET, { expiresIn: '1d' });

      // JWT als Cookie setzen
      res.cookie('wordsofdeath', token, {
         httpOnly: true,
         maxAge: 24 * 60 * 60 * 1000,
         sameSite: 'none',
         secure: false
      });
      res.redirect('http://localhost:3000/');
   } catch (error) {
      console.error('Fehler bei der Discord Authentifizierung:', error);
      res.status(500).send('Fehler bei der Authentifizierung');
   }
});

// Middleware zur Authentifizierung
function authenticateToken(req, res, next) {
   const token = req.cookies.wordsofdeath;  // Verwende hier das richtige Cookie
   if (!token) return res.status(401).send('Nicht autorisiert.');

   jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).send('Token ungültig.');
      req.user = user;
      next();
   });
}

// Beispiel-Endpunkte, die nur mit Authentifizierung zugänglich sind
app.get('/account', authenticateToken, async (req, res) => {
   res.send(`Willkommen, ${req.user.username}`);
});

app.get('/api/entries', authenticateToken, async (req, res) => {
   const database = await connectDB();
   const entries = await database.collection('entries').find().toArray();
   res.json(entries);
});

// Server starten
app.listen(PORT, () => {
   console.log(`Server läuft auf http://localhost:${PORT}`);
});
