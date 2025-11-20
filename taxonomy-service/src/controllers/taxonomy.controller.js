const taxonomyService = require('../services/taxonomy.service');

class TaxonomyController {
  async getStats(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
      }

      const stats = await taxonomyService.getStats(token);
      res.json(stats);
    } catch (error) {
      console.error('Erreur génération stats:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TaxonomyController();