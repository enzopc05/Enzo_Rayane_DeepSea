const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, jwtConfig.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

const requireExpert = (req, res, next) => {
  if (req.user.role !== 'EXPERT' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux experts' });
  }
  next();
};

module.exports = { authenticateToken, requireExpert };