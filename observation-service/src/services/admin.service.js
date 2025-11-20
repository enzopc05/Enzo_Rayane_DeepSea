const prisma = require('../config/database');

class AdminService {
  /**
   * Suppression logique (soft delete) d'une observation
   * Accessible uniquement aux ADMIN
   */
  async softDeleteObservation(observationId, adminId, adminRole, reason) {
    // Vérifier que l'observation existe
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { species: true }
    });

    if (!observation) {
      throw new Error('Observation non trouvée');
    }

    // Vérifier que l'observation n'est pas déjà supprimée
    if (observation.status === 'DELETED') {
      throw new Error('Cette observation est déjà supprimée');
    }

    // Effectuer la suppression logique
    const deletedObservation = await prisma.observation.update({
      where: { id: observationId },
      data: {
        status: 'DELETED',
        deletedBy: adminId,
        deletedAt: new Date(),
        deletedReason: reason || 'Aucune raison fournie'
      },
      include: { species: true }
    });

    // Enregistrer dans l'historique
    await prisma.observationHistory.create({
      data: {
        observationId,
        action: 'DELETED',
        performedBy: adminId,
        performedByRole: adminRole,
        previousStatus: observation.status,
        newStatus: 'DELETED',
        comment: reason || 'Suppression par un administrateur'
      }
    });

    return deletedObservation;
  }

  /**
   * Restaurer une observation supprimée
   * Accessible uniquement aux ADMIN
   */
  async restoreObservation(observationId, adminId, adminRole) {
    // Vérifier que l'observation existe
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { species: true }
    });

    if (!observation) {
      throw new Error('Observation non trouvée');
    }

    // Vérifier que l'observation est bien supprimée
    if (observation.status !== 'DELETED') {
      throw new Error('Cette observation n\'est pas supprimée');
    }

    // Restaurer l'observation (retour à PENDING)
    const restoredObservation = await prisma.observation.update({
      where: { id: observationId },
      data: {
        status: 'PENDING',
        deletedBy: null,
        deletedAt: null,
        deletedReason: null
      },
      include: { species: true }
    });

    // Enregistrer dans l'historique
    await prisma.observationHistory.create({
      data: {
        observationId,
        action: 'RESTORED',
        performedBy: adminId,
        performedByRole: adminRole,
        previousStatus: 'DELETED',
        newStatus: 'PENDING',
        comment: 'Observation restaurée par un administrateur'
      }
    });

    return restoredObservation;
  }

  /**
   * Obtenir l'historique complet des actions sur une observation
   */
  async getObservationHistory(observationId) {
    const observation = await prisma.observation.findUnique({
      where: { id: observationId }
    });

    if (!observation) {
      throw new Error('Observation non trouvée');
    }

    const history = await prisma.observationHistory.findMany({
      where: { observationId },
      orderBy: { timestamp: 'desc' }
    });

    return {
      observation,
      history
    };
  }

  /**
   * Obtenir l'historique de toutes les observations d'un utilisateur
   * GET /admin/user/:id/history
   */
  async getUserHistory(userId) {
    // Récupérer toutes les observations de l'utilisateur
    const observations = await prisma.observation.findMany({
      where: { authorId: userId },
      include: {
        species: true,
        history: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compter les statistiques
    const stats = {
      total: observations.length,
      pending: observations.filter(o => o.status === 'PENDING').length,
      validated: observations.filter(o => o.status === 'VALIDATED').length,
      rejected: observations.filter(o => o.status === 'REJECTED').length,
      deleted: observations.filter(o => o.status === 'DELETED').length
    };

    return {
      userId,
      stats,
      observations
    };
  }

  /**
   * Obtenir l'historique de toutes les observations pour une espèce
   * GET /expert/species/:id/history
   */
  async getSpeciesHistory(speciesId) {
    // Vérifier que l'espèce existe
    const species = await prisma.species.findUnique({
      where: { id: speciesId }
    });

    if (!species) {
      throw new Error('Espèce non trouvée');
    }

    // Récupérer toutes les observations de cette espèce
    const observations = await prisma.observation.findMany({
      where: { speciesId },
      include: {
        history: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compter les statistiques
    const stats = {
      total: observations.length,
      pending: observations.filter(o => o.status === 'PENDING').length,
      validated: observations.filter(o => o.status === 'VALIDATED').length,
      rejected: observations.filter(o => o.status === 'REJECTED').length,
      deleted: observations.filter(o => o.status === 'DELETED').length
    };

    return {
      species,
      stats,
      observations
    };
  }

  /**
   * Obtenir toutes les observations supprimées (pour les admins)
   */
  async getDeletedObservations() {
    return await prisma.observation.findMany({
      where: { status: 'DELETED' },
      include: {
        species: true,
        history: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { deletedAt: 'desc' }
    });
  }
}

module.exports = new AdminService();