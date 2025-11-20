require('dotenv').config();
const express = require('express');
const cors = require('cors');
const speciesRoutes = require('./routes/species.routes');
const observationRoutes = require('./routes/observation.routes');
const observationController = require('./controllers/observation.controller');
const { authenticateToken } = require('./middlewares/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/species', speciesRoutes);
app.use('/observations', observationRoutes);

// Route pour récupérer les observations d'une espèce
app.get('/species/:id/observations', authenticateToken, observationController.getObservationsBySpecies);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'observation-service',
    timestamp: new Date().toISOString() 
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.listen(PORT, () => {
  console.log(`🚀 Observation Service démarré sur le port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;