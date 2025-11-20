const prisma = require('../config/database');
const axios = require('axios');

class ObservationService {
  // Fonction utilitaire pour mettre à jour la réputation d'un utilisateur
  async updateUserReputation(userId, points) {
    try {
      // Appel au service d'auth pour mettre à jour la réputation
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      const url = `${authServiceUrl.replace(/\/$/, '')}/auth/users/${userId}/reputation`;
      console.log(`🔄 Mise à jour réputation: userId=${userId}, points=${points}, URL=${url}`);
      
      const response = await axios.patch(url, {
        reputationChange: points
      });
      
      console.log(`✅ Réputation mise à jour:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur réputation (${error.response?.status}):`, error.response?.data || error.message);
      // On continue même si la mise à jour échoue
    }
  }

  // Fonction utilitaire pour recalculer la rareté d'une espèce
  async updateSpeciesRarity(speciesId) {
    const validatedCount = await prisma.observation.count({
      where: { speciesId, status: 'VALIDATED' }
    });
    
    const rarityScore = 1 + validatedCount / 5;
    
    await prisma.species.update({
      where: { id: speciesId },
      data: { rarityScore }
    });
  }

  async createObservation(authorId, speciesId, description) {
    // Vérifier que l'espèce existe
    const species = await prisma.species.findUnique({
      where: { id: speciesId }
    });

    if (!species) {
      throw new Error('Espèce non trouvée');
    }

    // Vérifier qu'il n'y a pas eu d'observation de cette espèce par cet utilisateur dans les 5 dernières minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentObservation = await prisma.observation.findFirst({
      where: {
        authorId,
        speciesId,
        createdAt: {
          gte: fiveMinutesAgo
        }
      }
    });

    if (recentObservation) {
      throw new Error('Vous avez déjà soumis une observation de cette espèce il y a moins de 5 minutes');
    }

    // Créer l'observation
    const observation = await prisma.observation.create({
      data: {
        authorId,
        speciesId,
        description,
        status: 'PENDING'
      },
      include: {
        species: true
      }
    });

    return observation;
  }

  async getObservationsBySpecies(speciesId) {
    return await prisma.observation.findMany({
      where: { speciesId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async validateObservation(observationId, validatorId) {
    // Récupérer l'observation
    const observation = await prisma.observation.findUnique({
      where: { id: observationId }
    });

    if (!observation) {
      throw new Error('Observation non trouvée');
    }

    // Vérifier que l'observation n'est pas déjà validée ou rejetée
    if (observation.status !== 'PENDING') {
      throw new Error('Cette observation a déjà été traitée');
    }

    // Vérifier que le validateur n'est pas l'auteur
    if (observation.authorId === validatorId) {
      throw new Error('Vous ne pouvez pas valider votre propre observation');
    }

    // Valider l'observation
    const validatedObservation = await prisma.observation.update({
      where: { id: observationId },
      data: {
        status: 'VALIDATED',
        validatedBy: validatorId,
        validatedAt: new Date()
      },
      include: {
        species: true
      }
    });

    // Mettre à jour la réputation
    // +3 pour l'auteur (observation validée)
    await this.updateUserReputation(observation.authorId, 3);
    // +1 pour le validateur (bonus si expert)
    await this.updateUserReputation(validatorId, 1);

    // Mettre à jour le rarityScore de l'espèce
    await this.updateSpeciesRarity(observation.speciesId);

    return validatedObservation;
  }

  async rejectObservation(observationId, validatorId) {
    // Récupérer l'observation
    const observation = await prisma.observation.findUnique({
      where: { id: observationId }
    });

    if (!observation) {
      throw new Error('Observation non trouvée');
    }

    // Vérifier que l'observation n'est pas déjà validée ou rejetée
    if (observation.status !== 'PENDING') {
      throw new Error('Cette observation a déjà été traitée');
    }

    // Vérifier que le validateur n'est pas l'auteur
    if (observation.authorId === validatorId) {
      throw new Error('Vous ne pouvez pas rejeter votre propre observation');
    }

    // Rejeter l'observation
    const rejectedObservation = await prisma.observation.update({
      where: { id: observationId },
      data: {
        status: 'REJECTED',
        validatedBy: validatorId,
        validatedAt: new Date()
      },
      include: {
        species: true
      }
    });

    // Mettre à jour la réputation
    // -1 pour l'auteur (observation rejetée)
    await this.updateUserReputation(observation.authorId, -1);

    // Mettre à jour le rarityScore de l'espèce
    await this.updateSpeciesRarity(observation.speciesId);

    return rejectedObservation;
  }
}

module.exports = new ObservationService();