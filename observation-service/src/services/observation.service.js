const prisma = require('../config/database');
const axios = require('axios');

class ObservationService {
  constructor() {
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  }

  /**
   * Crée une entrée dans l'historique
   */
  async createHistoryEntry(observationId, action, performedBy, performedByRole, previousStatus, newStatus, comment = null) {
    return await prisma.observationHistory.create({
      data: {
        observationId,
        action,
        performedBy,
        performedByRole,
        previousStatus,
        newStatus,
        comment
      }
    });
  }

  /**
   * Crée une nouvelle observation
   */
  async createObservation(authorId, speciesId, description) {
    // Vérifie que l'espèce existe
    const species = await prisma.species.findUnique({
      where: { id: speciesId }
    });

    if (!species) {
      throw new Error('Espèce non trouvée');
    }

    // Vérifie qu'il n'y a pas d'observation récente (< 5 min) pour cette espèce par cet utilisateur
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentObservation = await prisma.observation.findFirst({
      where: {
        authorId,
        speciesId,
        createdAt: { gte: fiveMinutesAgo }
      }
    });

    if (recentObservation) {
      throw new Error('Vous avez déjà soumis une observation pour cette espèce il y a moins de 5 minutes');
    }

    // Crée l'observation
    const observation = await prisma.observation.create({
      data: {
        authorId,
        speciesId,
        description,
        status: 'PENDING'
      },
      include: { species: true }
    });

    // Enregistre dans l'historique
    await this.createHistoryEntry(
      observation.id,
      'CREATED',
      authorId,
      'USER',
      null,
      'PENDING',
      'Observation créée'
    );

    return observation;
  }

  /**
   * Récupère les observations d'une espèce (exclut les supprimées par défaut)
   */
  async getObservationsBySpecies(speciesId, includeDeleted = false) {
    const where = { speciesId };
    
    if (!includeDeleted) {
      where.status = { not: 'DELETED' };
    }

    return await prisma.observation.findMany({
      where,
      include: { species: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Valide une observation
   */
  async validateObservation(observationId, validatorId, validatorRole) {
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { species: true }
    });

    if (!observation) {
      throw new Error('Observation non trouvée');
    }

    if (observation.status === 'DELETED') {
      throw new Error('Impossible de valider une observation supprimée');
    }

    if (observation.authorId === validatorId) {
      throw new Error('Vous ne pouvez pas valider votre propre observation');
    }

    if (observation.status !== 'PENDING') {
      throw new Error('Cette observation a déjà été traitée');
    }

    const previousStatus = observation.status;

    // Valide l'observation
    const updatedObservation = await prisma.observation.update({
      where: { id: observationId },
      data: {
        status: 'VALIDATED',
        validatedBy: validatorId,
        validatedAt: new Date()
      },
      include: { species: true }
    });

    // Historise
    await this.createHistoryEntry(
      observationId,
      'VALIDATED',
      validatorId,
      validatorRole,
      previousStatus,
      'VALIDATED',
      'Observation validée par un expert'
    );

    // Augmente la réputation de l'auteur
    try {
      await axios.patch(
        `${this.authServiceUrl}/auth/users/${observation.authorId}/reputation`,
        { reputationChange: 5 },
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Erreur mise à jour réputation:', error.message);
    }

    return updatedObservation;
  }

  /**
   * Rejette une observation
   */
  async rejectObservation(observationId, validatorId, validatorRole, reason = null) {
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { species: true }
    });

    if (!observation) {
      throw new Error('Observation non trouvée');
    }

    if (observation.status === 'DELETED') {
      throw new Error('Impossible de rejeter une observation supprimée');
    }

    if (observation.authorId === validatorId) {
      throw new Error('Vous ne pouvez pas rejeter votre propre observation');
    }

    if (observation.status !== 'PENDING') {
      throw new Error('Cette observation a déjà été traitée');
    }

    const previousStatus = observation.status;

    // Rejette l'observation
    const updatedObservation = await prisma.observation.update({
      where: { id: observationId },
      data: {
        status: 'REJECTED',
        validatedBy: validatorId,
        validatedAt: new Date()
      },
      include: { species: true }
    });

    // Historise
    await this.createHistoryEntry(
      observationId,
      'REJECTED',
      validatorId,
      validatorRole,
      previousStatus,
      'REJECTED',
      reason || 'Observation rejetée par un expert'
    );

    return updatedObservation;
  }

  /**
   * Supprime logiquement une observation (ADMIN uniquement)
   */
  async softDeleteObservation(observationId, adminId, adminRole, reason) {
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { species: true }
    });

    if (!observation) {
      throw new Error('Observation non trouvée');
    }

    if (observation.status === 'DELETED') {
      throw new Error('Cette observation est déjà supprimée');
    }

    const previousStatus = observation.status;

    // Soft delete
    const updatedObservation = await prisma.observation.update({
      where: { id: observationId },
      data: {
        status: 'DELETED',
        deletedBy: adminId,
        deletedAt: new Date(),
        deletedReason: reason
      },
      include: { species: true }
    });

    // Historise
    await this.createHistoryEntry(
      observationId,
      'DELETED',
      adminId,
      adminRole,
      previousStatus,
      'DELETED',
      reason
    );

    return updatedObservation;
  }

  /**
   * Restaure une observation supprimée (ADMIN uniquement)
   */
  async restoreObservation(observationId, adminId, adminRole) {
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { species: true }
    });

    if (!observation) {
      throw new Error('Observation non trouvée');
    }

    if (observation.status !== 'DELETED') {
      throw new Error('Cette observation n\'est pas supprimée');
    }

    const previousStatus = observation.status;

    // Restaure au statut PENDING
    const updatedObservation = await prisma.observation.update({
      where: { id: observationId },
      data: {
        status: 'PENDING',
        deletedBy: null,
        deletedAt: null,
        deletedReason: null
      },
      include: { species: true }
    });

    // Historise
    await this.createHistoryEntry(
      observationId,
      'RESTORED',
      adminId,
      adminRole,
      previousStatus,
      'PENDING',
      'Observation restaurée par un administrateur'
    );

    return updatedObservation;
  }

  /**
   * Récupère l'historique des actions pour un utilisateur (ADMIN)
   */
  async getUserHistory(userId) {
    // Historique des observations créées par l'utilisateur
    const userObservations = await prisma.observation.findMany({
      where: { authorId: userId },
      select: { id: true }
    });

    const observationIds = userObservations.map(o => o.id);

    const history = await prisma.observationHistory.findMany({
      where: {
        OR: [
          { observationId: { in: observationIds } }, // Actions sur ses observations
          { performedBy: userId }                     // Actions effectuées par lui
        ]
      },
      include: {
        observation: {
          include: { species: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return history;
  }

  /**
   * Récupère l'historique des validations/rejets pour une espèce (EXPERT)
   */
  async getSpeciesHistory(speciesId) {
    const observations = await prisma.observation.findMany({
      where: { speciesId },
      select: { id: true }
    });

    const observationIds = observations.map(o => o.id);

    const history = await prisma.observationHistory.findMany({
      where: { observationId: { in: observationIds } },
      include: {
        observation: {
          include: { species: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return history;
  }
}

module.exports = new ObservationService();