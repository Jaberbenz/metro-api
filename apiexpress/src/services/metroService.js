"use strict";

const {
  getCurrentTimeInMinutes,
  isMetroServiceOpen,
  isLastMetroPeriod,
  calculateNextArrival,
  calculateNextArrivals,
  parseTimeToMinutes,
} = require("../../utils/timeUtils");

/**
 * Calcule les informations du prochain métro
 * @param {string} station - Nom de la station
 * @param {string} simulatedTime - Heure simulée
 * @returns {Object} Informations du métro ou service fermé
 */

const STATION_LINES = {
  Chatelet: "M1",
  République: "M3",
  Bastille: "M1",
  Nation: "M1",
  Opéra: "M3",
  "Gare du Nord": "M4",
};

// Nouvelle liste complète pour les suggestions
const VALID_STATIONS = [
  "Chatelet",
  "République",
  "Bastille",
  "Nation",
  "Opéra",
  "Gare du Nord",
  "Concorde",
  "Louvre",
  "Palais Royal",
  "Tuileries",
];

/**
 * Trouve des suggestions de stations basées sur un préfixe/substring
 * @param {string} input - Texte saisi par l'utilisateur
 * @returns {Array} Liste de suggestions
 */
function findStationSuggestions(input) {
  if (!input || input.length < 2) {
    return [];
  }

  const inputLower = input.toLowerCase();

  // Recherche par préfixe (priorité)
  const prefixMatches = VALID_STATIONS.filter((station) =>
    station.toLowerCase().startsWith(inputLower)
  );

  // Recherche par substring (si pas assez de résultats par préfixe)
  const substringMatches = VALID_STATIONS.filter(
    (station) =>
      station.toLowerCase().includes(inputLower) &&
      !station.toLowerCase().startsWith(inputLower)
  );

  // Combiner et limiter à 5 suggestions max
  const suggestions = [...prefixMatches, ...substringMatches].slice(0, 5);

  console.log(`🔍 SUGGESTIONS pour "${input}":`, suggestions);
  return suggestions;
}

function getNextMetroInfo(station, simulatedTime = null, n = 1) {
  const currentTimeInMinutes = getCurrentTimeInMinutes(simulatedTime);

  // Vérifier si la station existe
  if (!VALID_STATIONS.includes(station)) {
    const suggestions = findStationSuggestions(station);
    return {
      error: "unknown station",
      suggestions: suggestions,
    };
  }

  // Vérifier si le service est ouvert
  if (!isMetroServiceOpen(currentTimeInMinutes)) {
    return { service: "closed" };
  }

  const headwayMin = parseInt(process.env.HEADWAY_MIN) || 3;
  const line = STATION_LINES[station] || "M1";

  // Si n = 1, format MVP inchangé
  if (n === 1) {
    const isLast = isLastMetroPeriod(currentTimeInMinutes);
    const nextArrival = calculateNextArrival(headwayMin, simulatedTime);

    return {
      station: station,
      line: line,
      headwayMin: headwayMin,
      nextArrival: nextArrival,
      isLast: isLast,
      tz: "Europe/Paris",
    };
  }

  // Si n > 1, nouveau format avec arrivals[]
  const arrivals = calculateNextArrivals(n, headwayMin, simulatedTime);

  return {
    station: station,
    line: line,
    headwayMin: headwayMin,
    tz: "Europe/Paris",
    arrivals: arrivals,
  };
}

module.exports = {
  getNextMetroInfo,
};
