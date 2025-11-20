const express = require('express');
const taxonomyRoutes = require('./routes/taxonomy.routes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Routes
app.use('/taxonomy', taxonomyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'taxonomy-service' });
});

app.listen(PORT, () => {
  console.log(`🧬 Taxonomy Service démarré sur le port ${PORT}`);
});