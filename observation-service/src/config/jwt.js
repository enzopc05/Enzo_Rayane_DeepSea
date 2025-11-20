require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'default_secret_change_me',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
};