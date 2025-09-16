"use strict";

const express = require("express");
const router = express.Router();
const { getNextMetroInfo } = require("../services/metroService");

router.get("/", (req, res) => {
  const station = req.query.station;
  const simulatedTime = req.query.time; //Paramettre optionnel pour simuler une heure
  const n = parseInt(req.query.n) || 1;

  console.log("simulatedTime", simulatedTime);
  console.log("n passages demandés:", n);

  if (!station) {
    return res.status(400).json({
      error: "missing station",
    });
  }

  if (n < 1 || n > 5) {
    return res.status(400).json({
      error: "n must be between 1 and 5",
    });
  }

  const result = getNextMetroInfo(station, simulatedTime, n);
  // Vérifier si c'est une erreur de station inconnue
  if (result.error === "unknown station") {
    console.log(`❌ Station inconnue: "${station}"`);
    return res.status(404).json(result);
  }

  console.log("le prochain passage est a", result);
  return res.status(200).json(result);
});

module.exports = router;
