const observationService = require('../services/observation.service');

class ExpertController {
  /**
   * GET /expert/species/:id/history - Historique des validations pour une espèce
   */
  async getSpeciesHistory(req, res) {
    try {
      const { id } = req.params;
      const history = await observationService.getSpeciesHistory(id);

      res.json({
        speciesId: id,
        totalActions: history.length,
        history
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ExpertController();