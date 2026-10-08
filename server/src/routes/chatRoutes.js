const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middlewares/authMiddleware');

// All chat routes protected with Firebase Auth (or development fallback)
router.use(requireAuth);

router.post('/stream', (req, res) => chatController.streamChat(req, res));
router.post('/message', (req, res, next) => chatController.sendMessage(req, res, next));
router.get('/sessions', (req, res, next) => chatController.getSessions(req, res, next));
router.get('/sessions/:sessionId/messages', (req, res, next) => chatController.getSessionMessages(req, res, next));
router.delete('/sessions/:sessionId', (req, res, next) => chatController.deleteSession(req, res, next));

module.exports = router;
