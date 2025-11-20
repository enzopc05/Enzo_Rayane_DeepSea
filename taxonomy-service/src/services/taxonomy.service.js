const axios = require('axios');
const prisma = require('../config/database');

class TaxonomyService {
  constructor() {
    this.observationServiceUrl = process.env.OBSERVATION_SERVICE_URL || 'http://localhost:3002';
  }

  /**
   * Récupère toutes les espèces depuis observation-service
   */
  async fetchSpeciesFromObservationService(token) {
    try {
      const response = await axios.get(`${this.observationServiceUrl}/species`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.species || [];
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des espèces: ${error.message}`);
    }
  }

  /**
   * Récupère les observations d'une espèce depuis observation-service
   */
  async fetchObservationsForSpecies(speciesId, token) {
    try {
      const response = await axios.get(
        `${this.observationServiceUrl}/species/${speciesId}/observations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.observations || [];
    } catch (error) {
      console.error(`Erreur récupération observations pour ${speciesId}:`, error.message);
      return [];
    }
  }

  /**
   * Extrait les mots-clés récurrents des descriptions d'observations
   */
  extractKeywords(observations) {
    if (!observations || observations.length === 0) return [];

    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
      'de', 'du', 'à', 'au', 'en', 'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par',
      'est', 'sont', 'était', 'étaient', 'a', 'ont', 'avoir', 'être',
      'ce', 'cette', 'ces', 'qui', 'que', 'quoi', 'dont', 'où'
    ]);

    const wordFrequency = {};
    
    observations.forEach(obs => {
      if (obs.description) {
        const words = obs.description
          .toLowerCase()
          .replace(/[^\w\sàâäéèêëïîôùûüÿç]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3 && !stopWords.has(word));

        words.forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
      }
    });

    // Retourne les 10 mots les plus fréquents
    return Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Génère une famille taxonomique basée sur le nom et les caractéristiques
   */
  generateFamily(speciesName, keywords) {
    const name = speciesName.toLowerCase();
    
    // Classification simple basée sur des patterns
    if (name.includes('kraken') || name.includes('tentacul') || keywords.includes('tentacule')) {
      return 'Cephalopoda Gigantea';
    }
    if (name.includes('serpent') || keywords.includes('serpent') || keywords.includes('anguille')) {
      return 'Serpentiformes Abyssales';
    }
    if (name.includes('poisson') || keywords.includes('nageoire') || keywords.includes('écaille')) {
      return 'Pisces Profundis';
    }
    if (name.includes('méduse') || keywords.includes('méduse') || keywords.includes('transparent')) {
      return 'Cnidaria Luminosa';
    }
    if (name.includes('crustacé') || keywords.includes('carapace') || keywords.includes('pinces')) {
      return 'Crustacea Gigantis';
    }
    
    return 'Familia Incertae Sedis'; // Famille indéterminée
  }

  /**
   * Génère des sous-espèces potentielles
   */
  generateSubSpecies(speciesName, observationCount) {
    const subspecies = [];
    
    if (observationCount > 10) {
      subspecies.push(`${speciesName} var. profundis`);
    }
    if (observationCount > 20) {
      subspecies.push(`${speciesName} var. giganteus`);
    }
    
    return subspecies;
  }

  /**
   * Détermine la branche évolutive
   */
  determineEvolutionBranch(family) {
    const branchMap = {
      'Cephalopoda Gigantea': 'Mollusca → Cephalopoda → Forme Géante',
      'Serpentiformes Abyssales': 'Chordata → Actinopterygii → Adaptation Abyssale',
      'Pisces Profundis': 'Chordata → Osteichthyes → Spécialisation Profondeur',
      'Cnidaria Luminosa': 'Cnidaria → Scyphozoa → Bioluminescence',
      'Crustacea Gigantis': 'Arthropoda → Crustacea → Gigantisme Abyssal'
    };
    
    return branchMap[family] || 'Branche évolutive indéterminée';
  }

  /**
   * Classifie une espèce et stocke le résultat
   */
  async classifySpecies(species, observations) {
    const keywords = this.extractKeywords(observations);
    const family = this.generateFamily(species.name, keywords);
    const subSpecies = this.generateSubSpecies(species.name, observations.length);
    const evolutionBranch = this.determineEvolutionBranch(family);

    // Enregistre ou met à jour la classification
    return await prisma.taxonomyClassification.upsert({
      where: { speciesId: species.id },
      update: {
        speciesName: species.name,
        family,
        subSpecies,
        evolutionBranch,
        keywords,
        updatedAt: new Date()
      },
      create: {
        speciesId: species.id,
        speciesName: species.name,
        family,
        subSpecies,
        evolutionBranch,
        keywords
      }
    });
  }

  /**
   * Génère les statistiques globales de taxonomie
   */
  async generateTaxonomyStats(token) {
    try {
      // 1. Récupère toutes les espèces
      const species = await this.fetchSpeciesFromObservationService(token);
      
      if (species.length === 0) {
        throw new Error('Aucune espèce trouvée dans observation-service');
      }

      // 2. Pour chaque espèce, récupère les observations et classifie
      const speciesStats = [];
      
      for (const sp of species) {
        const observations = await this.fetchObservationsForSpecies(sp.id, token);
        const classification = await this.classifySpecies(sp, observations);
        
        speciesStats.push({
          species: sp,
          observations,
          observationCount: observations.length,
          classification
        });
      }

      // 3. Calcule les statistiques
      const totalObservations = speciesStats.reduce((sum, s) => sum + s.observationCount, 0);
      const averageObservationsPerSpecies = species.length > 0 
        ? totalObservations / species.length 
        : 0;

      // Espèce la plus observée
      const mostObserved = speciesStats.reduce((max, current) => 
        current.observationCount > (max.observationCount || 0) ? current : max
      , {});

      // Distribution par famille
      const familyDistribution = {};
      speciesStats.forEach(({ classification }) => {
        const family = classification.family || 'Indéterminé';
        familyDistribution[family] = (familyDistribution[family] || 0) + 1;
      });

      // 4. Enregistre les stats globales
      await prisma.taxonomyStats.deleteMany({}); // Supprime les anciennes stats
      const stats = await prisma.taxonomyStats.create({
        data: {
          totalSpecies: species.length,
          totalObservations,
          averageObservationsPerSpecies,
          mostObservedSpeciesId: mostObserved.species?.id,
          mostObservedSpeciesName: mostObserved.species?.name,
          mostObservedSpeciesCount: mostObserved.observationCount || 0,
          familyDistribution
        }
      });

      return {
        stats,
        speciesDetails: speciesStats.map(s => ({
          speciesId: s.species.id,
          speciesName: s.species.name,
          observationCount: s.observationCount,
          family: s.classification.family,
          subSpecies: s.classification.subSpecies,
          evolutionBranch: s.classification.evolutionBranch,
          keywords: s.classification.keywords
        }))
      };

    } catch (error) {
      throw new Error(`Erreur génération stats taxonomiques: ${error.message}`);
    }
  }

  /**
 * GET /taxonomy/stats - Génère les statistiques complètes
 */
async getStats(token) {
  // 1. Récupérer toutes les espèces
  const species = await this.fetchSpeciesFromObservationService(token);

  if (species.length === 0) {
    return {
      totalSpecies: 0,
      totalObservations: 0,
      avgObservationsPerSpecies: 0,
      speciesClassification: [],
      keywords: []
    };
  }

  // 2. Pour chaque espèce, récupérer ses observations
  const speciesWithStats = await Promise.all(
    species.map(async (sp) => {
      const observations = await this.fetchObservationsForSpecies(sp.id, token);
      const validatedObs = observations.filter(o => o.status === 'VALIDATED');
      
      return {
        id: sp.id,
        name: sp.name,
        dangerLevel: sp.dangerLevel,
        totalObservations: observations.length,
        validatedObservations: validatedObs.length,
        family: this.generateFamily(sp),
        subfamily: this.generateSubfamily(sp),
        evolutionBranch: this.generateEvolutionBranch(sp.dangerLevel),
        keywords: this.extractKeywords(validatedObs)
      };
    })
  );

  // 3. Calculer les statistiques globales
  const totalObservations = speciesWithStats.reduce((sum, sp) => sum + sp.totalObservations, 0);
  const avgObservations = totalObservations / species.length;

  // 4. Agréger tous les mots-clés
  const allKeywords = speciesWithStats.flatMap(sp => sp.keywords);
  const keywordFreq = {};
  allKeywords.forEach(kw => {
    keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
  });

  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, occurrences: count }));

  return {
    totalSpecies: species.length,
    totalObservations,
    avgObservationsPerSpecies: Math.round(avgObservations * 100) / 100,
    speciesClassification: speciesWithStats,
    keywords: topKeywords
  };
}

  /**
   * Récupère les statistiques taxonomiques existantes
   */
  async getTaxonomyStats() {
    const stats = await prisma.taxonomyStats.findFirst({
      orderBy: { lastCalculated: 'desc' }
    });

    if (!stats) {
      throw new Error('Aucune statistique disponible. Veuillez générer les stats d\'abord.');
    }

    const classifications = await prisma.taxonomyClassification.findMany({
      orderBy: { speciesName: 'asc' }
    });

    return {
      globalStats: stats,
      classifications
    };
  }

  /**
   * Récupère la classification d'une espèce spécifique
   */
  async getSpeciesClassification(speciesId) {
    const classification = await prisma.taxonomyClassification.findUnique({
      where: { speciesId }
    });

    if (!classification) {
      throw new Error('Classification non trouvée pour cette espèce');
    }

    return classification;
  }
}

module.exports = new TaxonomyService();