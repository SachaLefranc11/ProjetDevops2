const db = require('../models/db_conf');

module.exports.list = () => {
  return db.prepare("SELECT * FROM planets").all();
};

module.exports.add = (data) => {
  // Vérifier si la planète existe déjà
  const existingPlanet = db.prepare("SELECT * FROM planets WHERE name = ?").get(data.name);
  if (existingPlanet) {
    return false;
  }

  // Ajouter la planète
  const stmt = db.prepare(`
    INSERT INTO planets (name, size_km, atmosphere, type, distance_from_sun_km, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(data.name, data.size_km, data.atmosphere, data.type, data.distance_from_sun_km, data.image || null);
  return true;
};

module.exports.findByName = (name) => {
  return db.prepare("SELECT * FROM planets WHERE name = ?").get(name);
};
