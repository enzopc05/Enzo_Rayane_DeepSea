const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Toutes les routes admin nécessitent l'authentification et le rôle ADMIN
router.use(authenticateToken, requireAdmin);

// Suppression logique d'une observation
router.delete('/observations/:id', adminController.softDeleteObservation);

// Restauration d'une observation supprimée
router.post('/observations/:id/restore', adminController.restoreObservation);

// Historique d'une observation spécifique
router.get('/observations/:id/history', adminController.getObservationHistory);

// Liste des observations supprimées
router.get('/observations/deleted', adminController.getDeletedObservations);

// Historique d'un utilisateur (toutes ses observations)
router.get('/user/:id/history', adminController.getUserHistory);

module.exports = router;