"use strict";

const express = require("express");
const loggerMiddleware = require("./src/middleware/logger");
const setupRoutes = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(loggerMiddleware);

// Routes
setupRoutes(app);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
