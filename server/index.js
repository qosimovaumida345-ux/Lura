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

// Middleware
app.set('trust proxy', 1); // Render uchun muhim!
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// --- Mock DB for MVP ---
const projects = [];
const users = [];

// --- Google OAuth Setup ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true // Render'dagi HTTPS uchun majburiy
  },
  function(accessToken, refreshToken, profile, cb) {
    let user = users.find(u => u.googleId === profile.id);
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        googleId: profile.id,
        display_name: profile.displayName,
        email: (profile.emails && profile.emails[0]) ? profile.emails[0].value : '',
        avatar_url: (profile.photos && profile.photos[0]) ? profile.photos[0].value : ''
      };
      users.push(user);
    }
    return cb(null, user);
  }));

  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    function(req, res) {
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      const clientUrl = process.env.CLIENT_URL === '*' ? '' : (process.env.CLIENT_URL || '');
      res.redirect(`${clientUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    });
}

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lura Backend is running!' });
});

// Projects API
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const newProject = {
    id: `project_${Date.now()}`,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});

// AI Proxy Route (OpenRouter)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({
        choices: [{
          message: {
            role: 'assistant',
            content: 'Bu demo javob. Haqiqiy AI uchun OPENROUTER_API_KEY ni .env faylga qo`shing.'
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

// Serve frontend in production (SPA fallback)
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
  console.log(`Lura Server running on port ${PORT}`);
});
