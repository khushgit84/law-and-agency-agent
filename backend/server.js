import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { processChat } from './services/llm.service.js';
import { initKnowledgeBase } from './services/rag.service.js';
import { searchDirectory, getNationalHelplines } from './services/directory.service.js';
import { requireAuth } from './middleware/auth.middleware.js';
import { requireAdmin } from './middleware/admin.middleware.js';
import { registerOrUpdateUser, getAllUsers, getUserStats } from './services/user.service.js';

const app = express();
const port = process.env.PORT || 3001;

// Security Middlewares
app.use(helmet()); // Sets secure HTTP headers

const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'] 
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, mobile apps) or from allowed origins
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(bodyParser.json());

// Rate Limiting to prevent abuse of the LLM endpoint
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 chat requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, 
  legacyHeaders: false,
});

// ─── Auth Routes ──────────────────────────────────────────────
// Called by frontend after successful Firebase login to track the user
app.post('/api/auth/register', requireAuth, (req, res) => {
  try {
    const user = registerOrUpdateUser({
      uid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name || req.body.displayName || null,
      phoneNumber: req.user.phoneNumber || req.body.phoneNumber || null,
      photoURL: req.user.picture || req.body.photoURL || null,
      provider: req.user.provider
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error in /api/auth/register:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────
app.get('/api/admin/stats', requireAuth, requireAdmin, (req, res) => {
  try {
    const stats = getUserStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in /api/admin/stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  try {
    const users = getAllUsers();
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Error in /api/admin/users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ─── Chat Endpoint (protected) ────────────────────────────────
app.post('/api/chat', chatLimiter, requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array." });
    }

    console.log("Received chat request with", messages.length, "messages.");
    
    const response = await processChat(messages);
    
    res.json(response);
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

// API Endpoint for directory search
app.get('/api/directory', (req, res) => {
  try {
    const { query = '', state = '', category = '' } = req.query;
    const results = searchDirectory({ query, state, category });
    res.json(results);
  } catch (error) {
    console.error("Error in /api/directory:", error);
    res.status(500).json({ error: "Failed to search directory." });
  }
});

// API Endpoint for immediate emergency helplines
app.get('/api/directory/helplines', (req, res) => {
  try {
    const helplines = getNationalHelplines();
    res.json(helplines);
  } catch (error) {
    console.error("Error in /api/directory/helplines:", error);
    res.status(500).json({ error: "Failed to fetch helplines." });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn("WARNING: GROQ_API_KEY is not set in the environment!");
  }
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn("WARNING: FIREBASE_PROJECT_ID is not set. Auth will not work!");
  }
  if (!process.env.ADMIN_EMAIL) {
    console.warn("WARNING: ADMIN_EMAIL is not set. Admin dashboard will be inaccessible.");
  }
  // Pre-load local embeddings model and knowledge base
  initKnowledgeBase().catch(err => console.error("Warning: Pre-indexing knowledge base failed:", err.message));
});
