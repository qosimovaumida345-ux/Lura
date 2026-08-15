require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// --- Mock DB for MVP ---
const projects = [];

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
      // Mock response if no API key
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
        model: "meta-llama/llama-3-8b-instruct:free", // Free tier model
        messages: [
          { role: 'system', content: 'You are LuraEditorAI, an intelligent video editing assistant. You help users create amazing videos.' },
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Lura Server running on http://localhost:${PORT}`);
});
