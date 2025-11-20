const express = require('express');
const router = express.Router();
const observationController = require('../controllers/observation.controller');
const { authenticateToken, requireExpert } = require('../middlewares/auth.middleware');

// Création d'observation (tous les utilisateurs authentifiés)
router.post('/', authenticateToken, observationController.createObservation);

// Validation et rejet (réservé aux experts)
router.post('/:id/validate', authenticateToken, requireExpert, observationController.validateObservation);
router.post('/:id/reject', authenticateToken, requireExpert, observationController.rejectObservation);

module.exports = router;