require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'lura_jwt_secret_key_2026';

// --- Trust Proxy for Render HTTPS ---
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(passport.initialize());

// --- Persistent JSON Database Storage ---
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { users: [], projects: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readDb() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, returning empty defaults:', err);
    return { users: [], projects: [] };
  }
}

function writeDb(data) {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

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
  function(accessToken, refreshToken, profile, cb) {
    const db = readDb();
    let user = db.users.find(u => u.googleId === profile.id);
    
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        googleId: profile.id,
        display_name: profile.displayName,
        email: (profile.emails && profile.emails[0]) ? profile.emails[0].value : '',
        avatar_url: (profile.photos && profile.photos[0]) ? profile.photos[0].value : '',
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      writeDb(db);
    }
    return cb(null, user);
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
  res.json({ status: 'ok', message: 'Lura Backend 2.0 is running!', timestamp: new Date().toISOString() });
});

// 2. Auth ME Endpoint
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  }
  res.json({ user });
});

// 3. Projects API (Protected with Auth Middleware)
app.get('/api/projects', authMiddleware, (req, res) => {
  const db = readDb();
  const userProjects = db.projects.filter(p => !p.userId || p.userId === req.user.id);
  res.json(userProjects);
});

app.post('/api/projects', authMiddleware, (req, res) => {
  const db = readDb();
  const newProject = {
    id: req.body.id || `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: req.body.name || 'Sarlavhasiz loyiha',
    userId: req.user.id,
    settings: req.body.settings || { width: 1920, height: 1080, fps: 30, aspectRatio: '16:9' },
    timelineData: req.body.timelineData || { tracks: [], duration: 0 },
    thumbnail: req.body.thumbnail || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject);
  writeDb(db);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', authMiddleware, (req, res) => {
  const db = readDb();
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Loyiha topilmadi' });
  }

  db.projects[index] = {
    ...db.projects[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  writeDb(db);
  res.json(db.projects[index]);
});

app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  const db = readDb();
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// 4. AI Proxy Route (OpenRouter)
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

// 5. Assets Free Proxy Routes (Pixabay & Giphy)
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
