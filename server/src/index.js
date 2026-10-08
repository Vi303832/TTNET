require('dotenv').config();
const express = require('express');
const cors = require('cors');
const requestLogger = require('./middlewares/requestLogger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Route imports
const chatRoutes = require('./routes/chatRoutes');
const costRoutes = require('./routes/costRoutes');
const modelsRoutes = require('./routes/modelsRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev/preview (or configure via CLIENT_URL)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email', 'x-user-name']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Base route
app.get('/', (req, res) => {
  res.json({
    name: 'Gemini AI Chat & Cost Tracker Backend API',
    status: 'running',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      models: 'GET /api/models',
      streamChat: 'POST /api/chat/stream',
      chatHistory: 'GET /api/chat/sessions',
      costStats: 'GET /api/cost/stats',
      costPricing: 'GET /api/cost/pricing'
    }
  });
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cost', costRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server if not imported by test suite
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║   🚀 Gemini Streaming & Cost Tracker Backend                     ║
║   🌐 Sunucu Portu: http://localhost:${PORT}                       ║
║   📡 Sağlık Kontrolü: http://localhost:${PORT}/api/health         ║
║   🤖 Desteklenen Modeller: http://localhost:${PORT}/api/models    ║
╚══════════════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
