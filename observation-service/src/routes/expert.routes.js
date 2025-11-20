const express = require('express');
const router = express.Router();
const expertController = require('../controllers/expert.controller');
const { authenticateToken, requireExpert } = require('../middlewares/auth.middleware');

// Toutes les routes expert nécessitent l'authentification et le rôle EXPERT ou ADMIN
router.use(authenticateToken, requireExpert);

// Historique des validations/rejets pour une espèce
router.get('/species/:id/history', expertController.getSpeciesHistory);

module.exports = router;