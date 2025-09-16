"use strict";

/**
 * Middleware pour logger les requêtes
 */
function loggerMiddleware(req, res, next) {
  const t0 = Date.now();

  res.on("finish", () => {
    const t1 = Date.now();
    const duration = t1 - t0;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });

  next();
}

module.exports = loggerMiddleware;
