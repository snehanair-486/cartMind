import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiRoutes from './routes/aiRoutes.js';
import { isGroqConfigured, getGroqModel } from './services/groqService.js';

// Load backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// API Routes
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'CartMind AI Backend',
    version: '2.0.0',
    phase: 2,
    groqConfigured: isGroqConfigured(),
    model: getGroqModel(),
    endpoints: [
      'POST /api/ai/parse-request',
      'POST /api/ai/recommendations',
      'POST /api/ai/alternatives',
      'GET  /api/ai/health',
      'POST /api/ai/test'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` CartMind Backend running on port ${PORT}`);
  console.log(` API Base: http://localhost:${PORT}/api/ai`);
  console.log(` Groq API Configured: ${isGroqConfigured() ? 'YES' : 'NO (fallback mode)'}`);
  console.log(` Groq Model: ${getGroqModel()}`);
  console.log(`=========================================`);
});
