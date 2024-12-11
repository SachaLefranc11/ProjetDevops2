const db = require('../models/db_conf');

module.exports.list = () => {
  return db.prepare("SELECT * FROM planets").all();
};

module.exports.add = (data) => {
  const prepareQuery = "SELECT * FROM planets WHERE name = ?";
  const insertQuery = "INSERT INTO planets (name, size_km, atmosphere, type, distance_from_sun_km) VALUES (?, ?, ?, ?, ?)";

  if (!data.name || 
      typeof data.name !== 'string' || 
      data.name.trim() === '' ||
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

  const existingPlanet = db.prepare(prepareQuery).get(data.name);
  if (existingPlanet) {
    return false;
  }

  const stmt = db.prepare(insertQuery);
  stmt.run(data.name, data.size_km, data.atmosphere, data.type, data.distance_from_sun_km);
  return true;
};

module.exports.findByName = (name) => {
  return db.prepare("SELECT * FROM planets WHERE name = ?").get(name);
};
