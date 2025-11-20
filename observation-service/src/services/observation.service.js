const prisma = require('../config/database');

class ObservationService {
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

    return rejectedObservation;
  }
}

module.exports = new ObservationService();