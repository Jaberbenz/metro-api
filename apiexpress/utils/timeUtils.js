"use strict";

// Ajouter en haut du fichier, après "use strict"
const HEADWAY_MIN = parseInt(process.env.HEADWAY_MIN) || 3;
const LAST_WINDOW_START = process.env.LAST_WINDOW_START || "00:45";
const SERVICE_END = process.env.SERVICE_END || "01:15";

console.log(
  `🔧 CONFIG: HEADWAY_MIN=${HEADWAY_MIN}, LAST_WINDOW_START=${LAST_WINDOW_START}, SERVICE_END=${SERVICE_END}`
);

/**
 * Convertit l'heure actuelle en minutes depuis minuit
 * @param {string} timeStr - Heure simulée
 * @returns {number} Minutes depuis minuit
 */

function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function getCurrentTimeInMinutes(simulatedTime = null) {
  if (simulatedTime) {
    // Parse l'heure simulée "HH:MM"
    const [hours, minutes] = simulatedTime.split(":").map(Number);
    if (
      !isNaN(hours) &&
      !isNaN(minutes) &&
      hours >= 0 &&
      hours < 24 &&
      minutes >= 0 &&
      minutes < 60
    ) {
      console.log(`🕐 SIMULATION: Heure forcée à ${simulatedTime}`);
      return hours * 60 + minutes;
    }
  }

  // Heure réelle
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Vérifie si le service métro est ouvert
 * @param {number} currentTimeInMinutes - Heure actuelle en minutes
 * @returns {boolean} True si le service est ouvert
 */
function isMetroServiceOpen(currentTimeInMinutes) {
  const serviceStart = 5 * 60 + 30; // 05:30
  const serviceEnd = parseTimeToMinutes(SERVICE_END); // ← Utilise ENV

  return (
    currentTimeInMinutes >= serviceStart || currentTimeInMinutes <= serviceEnd
  );
}

/**
 * Détermine si c'est la période des dernières rames
 * @param {number} currentTimeInMinutes - Heure actuelle en minutes
 * @returns {boolean} True si c'est les dernières rames
 */
function isLastMetroPeriod(currentTimeInMinutes) {
  const lastMetroStart = parseTimeToMinutes(LAST_WINDOW_START); // ← Utilise ENV
  const serviceEnd = parseTimeToMinutes(SERVICE_END); // ← Utilise ENV

  return (
    currentTimeInMinutes >= lastMetroStart && currentTimeInMinutes <= serviceEnd
  );
}

/**
 * Calcule la prochaine arrivée (pour n=1)
 * @param {number} headwayMin - Intervalle en minutes
 * @param {string} simulatedTime - Heure simulée (optionnel)
 * @returns {string} Heure au format HH:MM
 */
function calculateNextArrival(headwayMin = null, simulatedTime = null) {
  // Utiliser HEADWAY_MIN de l'ENV si headwayMin n'est pas fourni
  const actualHeadway = headwayMin || HEADWAY_MIN;

  let baseTime;

  if (simulatedTime) {
    const [hours, minutes] = simulatedTime.split(":").map(Number);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      baseTime = new Date();
      baseTime.setHours(hours, minutes, 0, 0);
      console.log(
        `🕐 NEXT ARRIVAL: Basé sur heure simulée ${simulatedTime}, headway=${actualHeadway}min`
      );
    } else {
      baseTime = new Date();
    }
  } else {
    baseTime = new Date();
  }

  const nextArrivalTime = new Date(
    baseTime.getTime() + actualHeadway * 60 * 1000
  );
  const nextArrival = nextArrivalTime.toTimeString().slice(0, 5);

  console.log("Next arrival calculé:", nextArrival);
  return nextArrival;
}

/**
 * Calcule les N prochaines arrivées
 * @param {number} n - Nombre d'arrivées à calculer
 * @param {number} headwayMin - Intervalle en minutes
 * @param {string} simulatedTime - Heure simulée (optionnel)
 * @returns {Array} Liste des prochaines arrivées
 */
function calculateNextArrivals(n = 1, headwayMin = null, simulatedTime = null) {
  const actualHeadway = headwayMin || HEADWAY_MIN;
  const arrivals = [];

  let baseTime;

  if (simulatedTime) {
    const [hours, minutes] = simulatedTime.split(":").map(Number);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      baseTime = new Date();
      baseTime.setHours(hours, minutes, 0, 0);
      console.log(
        `🕐 ARRIVALS: Basé sur heure simulée ${simulatedTime}, ${n} passages, headway=${actualHeadway}min`
      );
    } else {
      baseTime = new Date();
    }
  } else {
    baseTime = new Date();
  }

  // Calculer les N prochaines arrivées
  for (let i = 0; i < n; i++) {
    const arrivalTime = new Date(
      baseTime.getTime() + (i + 1) * actualHeadway * 60 * 1000
    );
    const timeStr = arrivalTime.toTimeString().slice(0, 5);
    const arrivalMinutes =
      arrivalTime.getHours() * 60 + arrivalTime.getMinutes();

    // Vérifier si cette arrivée est encore dans les heures de service
    const isInService = isMetroServiceOpen(arrivalMinutes);
    if (!isInService) {
      // Arrêter le calcul si on dépasse les heures de service
      break;
    }

    const isLast = isLastMetroPeriod(arrivalMinutes);

    arrivals.push({
      time: timeStr,
      isLast: isLast,
    });
  }

  console.log("Arrivals calculées:", arrivals);
  return arrivals;
}

module.exports = {
  getCurrentTimeInMinutes,
  isMetroServiceOpen,
  isLastMetroPeriod,
  calculateNextArrival,
  calculateNextArrivals,
  parseTimeToMinutes,
};
