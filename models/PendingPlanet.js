// models/PendingPlanet.js
const db = require('../models/db_conf');

module.exports.list = () => {
  return db.prepare("SELECT * FROM pending_planets").all();
};

module.exports.findById = (id) => {
  return db.prepare("SELECT * FROM pending_planets WHERE id = ?").get(id);
};

module.exports.deleteById = (id) => {
  const stmt = db.prepare("DELETE FROM pending_planets WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
};

module.exports.add = (data) => {
  // Vérifier si la planète existe déjà dans les planètes ou en attente
  const existingPendingPlanet = db.prepare("SELECT * FROM pending_planets WHERE name = ?").get(data.name);
  const existingPlanet = db.prepare("SELECT * FROM planets WHERE name = ?").get(data.name);
  if (existingPendingPlanet || existingPlanet) {
    return false;
  }

  // Ajouter la planète en attente
  const stmt = db.prepare(`
    INSERT INTO pending_planets (name, size_km, atmosphere, type, distance_from_sun_km)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(data.name, data.size_km, data.atmosphere, data.type, data.distance_from_sun_km);
  return true;
};

module.exports.findByName = (name) => {
  return db.prepare("SELECT * FROM pending_planets WHERE name = ?").get(name);
};

module.exports.remove = (name) => {
  const stmt = db.prepare("DELETE FROM pending_planets WHERE name = ?");
  const result = stmt.run(name);
  return result.changes > 0; 
};
