const express = require('express');
const router = express.Router();
const taxonomyController = require('../controllers/taxonomy.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Récupère les statistiques taxonomiques (auto-génère si nécessaire)
router.get('/stats', authenticateToken, taxonomyController.getStats);

// Force la régénération des statistiques
router.post('/stats/generate', authenticateToken, taxonomyController.generateStats);

// Récupère la classification d'une espèce spécifique
router.get('/species/:id/classification', authenticateToken, taxonomyController.getSpeciesClassification);

module.exports = router;