module.exports = {
  secret: process.env.JWT_SECRET || 'votre_secret_jwt',
  expiresIn: '7d'
};