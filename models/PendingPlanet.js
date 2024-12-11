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
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    return false;
  }

  if (
    typeof data.size_km !== 'number' ||
    data.size_km <= 0 ||
    typeof data.atmosphere !== 'string' ||
    data.atmosphere.trim() === '' ||
    typeof data.type !== 'string' ||
    data.type.trim() === '' ||
    typeof data.distance_from_sun_km !== 'number' ||
    data.distance_from_sun_km <= 0
  ) {
    return false;
  }

  const existingPendingPlanet = db.prepare("SELECT * FROM pending_planets WHERE name = ?").get(data.name);
  if (existingPendingPlanet) {
    return false;
  }

  const stmt = db.prepare("INSERT INTO pending_planets (name, size_km, atmosphere, type, distance_from_sun_km) VALUES (?, ?, ?, ?, ?)");
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
