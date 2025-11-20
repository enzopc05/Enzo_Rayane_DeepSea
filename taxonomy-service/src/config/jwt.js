module.exports = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  expiresIn: '7d'
};