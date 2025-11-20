const express = require('express');
const router = express.Router();
const taxonomyController = require('../controllers/taxonomy.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// GET /taxonomy/stats - Statistiques globales
router.get('/stats', authenticateToken, taxonomyController.getStats);

module.exports = router;