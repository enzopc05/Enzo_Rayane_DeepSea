const speciesService = require('../services/species.service');

class SpeciesController {
  async createSpecies(req, res) {
    try {
      const { name, description, dangerLevel } = req.body;
      const authorId = req.user.userId;

      if (!name) {
        return res.status(400).json({ error: 'Le nom de l\'espèce est requis' });
      }

      if (!description) {
        return res.status(400).json({ error: 'La description est obligatoire' });
      }

      const species = await speciesService.createSpecies(
        authorId,
        name,
        description,
        dangerLevel || 1
      );

      res.status(201).json({
        message: 'Espèce créée avec succès',
        species
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSpeciesById(req, res) {
    try {
      const { id } = req.params;
      const species = await speciesService.getSpeciesById(id);

      res.json({ species });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllSpecies(req, res) {
    try {
      const species = await speciesService.getAllSpecies();

      res.json({
        count: species.length,
        species
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SpeciesController();