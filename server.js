import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
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
      console.log("[SERVER]: Database connected and whitelist initialized.");
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
 * Authenticates the user via Discord and redirects back to the application.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
app.get('/auth/discord', (req, res) => {
   const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
   console.error("[SERVER]: Redirecting user to Discord authentication page.");
   res.redirect(discordAuthUrl);
});

/**
 * Callback route for Discord OAuth2. Authenticates the user and creates a JWT.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
app.get('/auth/discord/callback', async (req, res) => {
   const { code } = req.query;
   if (!code) {
      console.error("[SERVER]: Error - No code received.");
      return res.status(400).send('Error: No code received.');
   }

   try {
      // console.log("[SERVER]: Attempting to obtain token from Discord...");
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

      // console.log("[SERVER]: Token obtained, retrieving user information...");
      const userInfoResponse = await axios.get('https://discord.com/api/users/@me', {
         headers: { Authorization: `Bearer ${access_token}` },
      });

      const { username, avatar, id } = userInfoResponse.data;

      const database = await connectDB();
      const userInWhitelist = await database.collection('whitelist').findOne({ username });

      if (!userInWhitelist) {
         console.warn("[SERVER]: Error - User not on the whitelist.");
         return res.status(403).send('Error: User not on the whitelist.');
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
         // console.log(`[SERVER]: User ${username} added to the database.`);
      }

      const token = jwt.sign({ username, avatar, id }, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('wod_token', token, {
         maxAge: 24 * 60 * 60 * 1000,
         sameSite: 'lax',
      });
      console.log("[SERVER]: User successfully authenticated and redirected to the application.");
      res.redirect('http://localhost:3000/');
   } catch (error) {
      console.error('[SERVER]: Error during Discord authentication:', error);
      res.status(500).send('Error during authentication');
   }
});

/**
 * Middleware to authenticate the token.
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function authenticateToken(req, res, next) {
   const authHeader = req.headers.authorization;
   const token = authHeader && authHeader.split(' ')[1];
   if (!token) {
      console.error("[SERVER]: Error - No token in Authorization header.");
      return res.status(401).send('Unauthorized.');
   }

   jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
         console.error("[SERVER]: Error - Invalid token.");
         return res.status(403).send('Invalid token.');
      }
      req.user = user;
      next();
   });
}

/**
 * POST endpoint to create a new entry.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
app.post('/api/entries', authenticateToken, async (req, res) => {
   console.log("Authorization Header:", req.headers.authorization);
   const { entry, type, categories, variation } = req.body;

   if (!entry || !type || !categories || !variation) {
      console.log("[SERVER]: Error - All fields must be filled.");
      return res.status(400).send('Error: All fields must be filled.');
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
      console.log(`[SERVER]: New entry created: ${entry} (ID: ${result.insertedId})`);
      res.status(201).send({ message: 'Entry successfully created', entryId: result.insertedId });
   } catch (error) {
      console.error('[SERVER]: Error creating the entry:', error);
      res.status(500).send('Error creating the entry.');
   }
});

app.post('/api/whitelist', authenticateToken, async (req, res) => {
   const { username } = req.body;
   if (!username) {
      return res.status(400).send('Username is required.');
   }

   try {
      const database = await connectDB();
      const existingUser = await database.collection('whitelist').findOne({ username });
      if (existingUser) {
         return res.status(400).send('User is already on the whitelist.');
      }

      const result = await database.collection('whitelist').insertOne({ username, added_at: new Date() });

      res.status(201).send({ id: result.insertedId, username, added_at: new Date() });
   } catch (error) {
      console.error('[SERVER]: Error adding user to whitelist:', error);
      res.status(500).send('Error adding user to whitelist.');
   }
});

app.get('/api/whitelist', authenticateToken, async (req, res) => {
   try {
      const database = await connectDB();
      const users = await database.collection('whitelist').find({}).toArray();
      res.status(200).json(users);
   } catch (error) {
      console.error('[SERVER]: Error retrieving whitelist users:', error);
      res.status(500).send('Error retrieving whitelist users.');
   }
});

app.delete('/api/whitelist/:username', authenticateToken, async (req, res) => {
   const username = req.params.username;

   try {
      const database = await connectDB();
      const result = await database.collection('whitelist').deleteOne({ username });

      if (result.deletedCount === 0) {
         return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({ message: "User successfully removed." });
   } catch (error) {
      console.error('[SERVER]: Error removing user from whitelist:', error);
      res.status(500).json({ message: "Internal server error." });
   }
});

/**
 * GET endpoint to retrieve all entries.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
app.get('/api/entries', authenticateToken, async (req, res) => {
   try {
      const database = await connectDB();
      const entries = await database.collection('entries').find({}).toArray();

      console.log(`[SERVER]: ${entries.length} entries retrieved.`);
      res.status(200).json(entries);
   } catch (error) {
      console.error('[SERVER]: Error retrieving entries:', error);
      res.status(500).send('Error retrieving entries.');
   }
});

app.delete('/api/entries/:id', authenticateToken, async (req, res) => {
   const entryId = req.params.id;
   try {
      const database = await connectDB();
      const result = await database.collection('entries').deleteOne({ _id: new ObjectId(entryId) });

      if (result.deletedCount === 0) {
         return res.status(404).send('Entry not found.');
      }

      res.status(200).send('Entry successfully deleted.');
   } catch (error) {
      console.error('[SERVER]: Error deleting entry:', error);
      res.status(500).send('Error deleting entry.');
   }
});

app.listen(PORT, () => {
   console.log(`[SERVER]: Listening on port ${PORT}`);
});
