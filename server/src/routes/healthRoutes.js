const express = require('express');
const router = express.Router();
const { isInitialized, isMock } = require('../config/firebase');

router.get('/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      gemini: {
        status: hasGeminiKey ? 'configured' : 'missing_api_key',
        message: hasGeminiKey ? 'Gemini API Anahtarı tanımlı.' : 'GEMINI_API_KEY server/.env dosyasında bekleniyor.'
      },
      firebase: {
        status: isInitialized() ? 'connected' : (isMock() ? 'development_in_memory_mode' : 'disconnected'),
        message: isInitialized() 
          ? 'Firebase Admin SDK aktif.' 
          : 'Geliştirme / In-Memory Mock modu aktif (serviceAccountKey.json opsiyonel).'
      }
    }
  });
});

module.exports = router;
