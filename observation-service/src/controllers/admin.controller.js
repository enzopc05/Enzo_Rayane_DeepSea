const adminService = require('../services/admin.service');

class AdminController {
  /**
   * DELETE /admin/observations/:id - Suppression logique
   */
  async softDeleteObservation(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.userId;
      const adminRole = req.user.role;

      const observation = await adminService.softDeleteObservation(
        id,
        adminId,
        adminRole,
        reason || 'Aucune raison fournie'
      );

      res.json({
        message: 'Observation supprimée avec succès',
        observation
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /admin/observations/:id/restore - Restauration
   */
  async restoreObservation(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.userId;
      const adminRole = req.user.role;

      const observation = await adminService.restoreObservation(
        id,
        adminId,
        adminRole
      );

      res.json({
        message: 'Observation restaurée avec succès',
        observation
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /admin/user/:id/history - Historique d'un utilisateur
   */
  async getUserHistory(req, res) {
    try {
      const { id } = req.params;
      const result = await adminService.getUserHistory(id);

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /expert/species/:id/history - Historique d'une espèce
   */
  async getSpeciesHistory(req, res) {
    try {
      const { id } = req.params;
      const result = await adminService.getSpeciesHistory(id);

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /admin/observations/:id/history - Historique d'une observation
   */
  async getObservationHistory(req, res) {
    try {
      const { id } = req.params;
      const result = await adminService.getObservationHistory(id);

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /admin/observations/deleted - Liste des observations supprimées
   */
  async getDeletedObservations(req, res) {
    try {
      const observations = await adminService.getDeletedObservations();

      res.json({
        count: observations.length,
        observations
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AdminController();