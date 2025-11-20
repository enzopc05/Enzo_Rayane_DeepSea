const express = require('express');
const router = express.Router();
const speciesController = require('../controllers/species.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Routes publiques (avec authentification)
router.post('/', authenticateToken, speciesController.createSpecies);
router.get('/:id', authenticateToken, speciesController.getSpeciesById);
router.get('/', authenticateToken, speciesController.getAllSpecies);

module.exports = router;