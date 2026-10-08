const express = require('express');
const router = express.Router();
const costController = require('../controllers/costController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/stats', requireAuth, (req, res, next) => costController.getStats(req, res, next));
router.post('/estimate', (req, res, next) => costController.estimateCost(req, res, next));
router.get('/pricing', (req, res, next) => costController.getPricing(req, res, next));

module.exports = router;
