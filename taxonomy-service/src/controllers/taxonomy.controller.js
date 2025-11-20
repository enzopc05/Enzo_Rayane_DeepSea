const taxonomyService = require('../services/taxonomy.service');

class TaxonomyController {
  /**
   * GET /taxonomy/stats
   * Récupère ou génère les statistiques taxonomiques
   */
  async getStats(req, res) {
    try {
      const token = req.headers.authorization;
      
      // Vérifie si des stats récentes existent (moins de 1 heure)
      let result;
      try {
        const existingStats = await taxonomyService.getTaxonomyStats();
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        if (new Date(existingStats.globalStats.lastCalculated) > oneHourAgo) {
          result = existingStats;
        } else {
          // Régénère si trop ancien
          result = await taxonomyService.generateTaxonomyStats(token);
        }
      } catch (error) {
        // Première génération
        result = await taxonomyService.generateTaxonomyStats(token);
      }

      res.json({
        message: 'Statistiques taxonomiques récupérées',
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /taxonomy/stats/generate
   * Force la régénération des statistiques
   */
  async generateStats(req, res) {
    try {
      const token = req.headers.authorization;
      const result = await taxonomyService.generateTaxonomyStats(token);

      res.json({
        message: 'Statistiques taxonomiques générées avec succès',
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /taxonomy/species/:id/classification
   * Récupère la classification d'une espèce
   */
  async getSpeciesClassification(req, res) {
    try {
      const { id } = req.params;
      const classification = await taxonomyService.getSpeciesClassification(id);

      res.json({
        message: 'Classification récupérée',
        classification
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new TaxonomyController();