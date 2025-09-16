"use strict";

const express = require("express");
const healthRoutes = require("./health");
const metroRoutes = require("./metro");

function setupRoutes(app) {
  // Routes principales
  app.use("/health", healthRoutes);
  app.use("/next-metro", metroRoutes);

  // Route 404 pour toutes les autres routes
  app.use((req, res) => {
    console.log("url not found", req.url);
    res.status(404).json({
      error: "not found",
    });
  });
}

module.exports = setupRoutes;
