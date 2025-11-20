const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.get('/admin/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.patch('/users/:id/role', authenticateToken, requireAdmin, authController.updateUserRole);
router.patch('/users/:id/reputation', authController.updateReputation);
router.get('/users/:id', authController.getUserById);

module.exports = router;