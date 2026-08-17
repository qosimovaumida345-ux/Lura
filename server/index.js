require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'lura_jwt_secret_key_2026';

// --- PostgreSQL Setup ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize DB Table
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error('DB Init Error:', err));

// --- Trust Proxy for Render HTTPS ---
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(passport.initialize());

// --- JWT Auth Middleware ---
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Token talab qilinadi' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Yaroqsiz yoki muddati o\'tgan token' });
  }
}

// --- Google OAuth Strategy ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
      let user;

      if (result.rows.length === 0) {
        const userId = `user_${Date.now()}`;
        const email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
        const avatar = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
        
        await pool.query(
          'INSERT INTO users (id, google_id, display_name, email, avatar_url) VALUES ($1, $2, $3, $4, $5)',
          [userId, profile.id, profile.displayName, email, avatar]
        );
        
        user = {
          id: userId,
          googleId: profile.id,
          display_name: profile.displayName,
          email: email,
          avatar_url: avatar
        };
      } else {
        const row = result.rows[0];
        user = {
          id: row.id,
          googleId: row.google_id,
          display_name: row.display_name,
          email: row.email,
          avatar_url: row.avatar_url
        };
      }
      return cb(null, user);
    } catch (err) {
      console.error('OAuth Error:', err);
      return cb(err, null);
    }
  }));

  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    function(req, res) {
      const token = jwt.sign({ id: req.user.id, email: req.user.email, name: req.user.display_name }, JWT_SECRET, { expiresIn: '14d' });
      const clientUrl = process.env.CLIENT_URL === '*' ? '' : (process.env.CLIENT_URL || '');
      res.redirect(`${clientUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    });
}

// --- API Routes ---

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lura Backend Postgres is running!', timestamp: new Date().toISOString() });
});

// 2. Auth ME Endpoint
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    const row = result.rows[0];
    const user = {
      id: row.id,
      googleId: row.google_id,
      display_name: row.display_name,
      email: row.email,
      avatar_url: row.avatar_url
    };
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// 3. AI Proxy Route (OpenRouter)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({
        choices: [{
          message: {
            role: 'assistant',
            content: 'AI montaj xizmati faol. OPENROUTER_API_KEY bilan to\'liq ulanadi.'
          }
        }]
      });
    }

    const fetch = (await import('node-fetch')).default;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
          { role: 'system', content: 'You are LuraEditorAI, an intelligent video editing assistant.' },
          ...messages
        ]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI bilan bog`lanishda xatolik yuz berdi.' });
  }
});

// 4. Assets Free Proxy Routes (Pixabay & Giphy)
app.get('/api/assets/music', async (req, res) => {
  const query = req.query.q || 'vlog';
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    return res.json({ hits: [] });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const resp = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&category=music`);
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Pixabay API error' });
  }
});

app.get('/api/assets/stickers', async (req, res) => {
  const query = req.query.q || 'popular';
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    return res.json({ data: [] });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const resp = await fetch(`https://api.giphy.com/v1/stickers/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=25`);
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Giphy API error' });
  }
});

// --- Serve Frontend SPA fallback ---
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.json({ status: 'ok', message: 'Lura API is running. Frontend not built yet.' });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Lura Server running on port ${PORT}`);
});
