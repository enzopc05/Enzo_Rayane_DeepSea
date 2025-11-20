const prisma = require('../config/database');

class SpeciesService {
  async createSpecies(authorId, name, description, dangerLevel) {
    // Vérifier que le nom n'existe pas déjà
    const existingSpecies = await prisma.species.findUnique({
      where: { name }
    });

    if (existingSpecies) {
      throw new Error('Une espèce avec ce nom existe déjà');
    }

    // Valider le dangerLevel
    if (dangerLevel < 1 || dangerLevel > 5) {
      throw new Error('Le niveau de danger doit être compris entre 1 et 5');
    }

    // Créer l'espèce
    const species = await prisma.species.create({
      data: {
        authorId,
        name,
        description,
        dangerLevel
      }
    });

    return species;
  }

  async getSpeciesById(speciesId) {
    const species = await prisma.species.findUnique({
      where: { id: speciesId },
      include: {
        observations: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!species) {
      throw new Error('Espèce non trouvée');
    }

    return species;
  }

  async getAllSpecies() {
    return await prisma.species.findMany({
      include: {
        observations: {
          where: { status: 'VALIDATED' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new SpeciesService();