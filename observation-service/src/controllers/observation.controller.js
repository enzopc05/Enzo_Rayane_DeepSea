const observationService = require('../services/observation.service');

class ObservationController {
  async createObservation(req, res) {
    try {
      const { speciesId, description } = req.body;
      const authorId = req.user.userId;

      if (!speciesId) {
        return res.status(400).json({ error: 'L\'ID de l\'espèce est requis' });
      }

      if (!description) {
        return res.status(400).json({ error: 'La description est obligatoire' });
      }

      const observation = await observationService.createObservation(
        authorId,
        speciesId,
        description
      );

      res.status(201).json({
        message: 'Observation créée avec succès',
        observation
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getObservationsBySpecies(req, res) {
    try {
      const { id } = req.params;
      const observations = await observationService.getObservationsBySpecies(id);

      res.json({
        count: observations.length,
        observations
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async validateObservation(req, res) {
    try {
      const { id } = req.params;
      const validatorId = req.user.userId;

      const observation = await observationService.validateObservation(id, validatorId);

      res.json({
        message: 'Observation validée avec succès',
        observation
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async rejectObservation(req, res) {
    try {
      const { id } = req.params;
      const validatorId = req.user.userId;

      const observation = await observationService.rejectObservation(id, validatorId);

      res.json({
        message: 'Observation rejetée avec succès',
        observation
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ObservationController();