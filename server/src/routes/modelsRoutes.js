const express = require('express');
const router = express.Router();
const modelsController = require('../controllers/modelsController');

router.get('/', (req, res, next) => modelsController.getModels(req, res, next));

module.exports = router;
