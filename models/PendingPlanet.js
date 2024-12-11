const db = require('../models/db_conf');

class PendingPlanet {
  static list() {
    return db.prepare("SELECT * FROM pending_planets").all();
  }

  static findById(id) {
    return db.prepare("SELECT * FROM pending_planets WHERE id = ?").get(id);
  }

  static deleteById(id) {
    const stmt = db.prepare("DELETE FROM pending_planets WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static add(planetData) {
    try {
      // Validate planetData.name
      if (!planetData.name || typeof planetData.name !== 'string' || planetData.name.trim() === '') {
        throw new Error('Planet name is required and must be a non-empty string');
      }

      // Validate planetData.size_km
      if (typeof planetData.size_km !== 'number' || planetData.size_km <= 0) {
        throw new Error('Planet size must be a positive number');
      }

      // Validate planetData.distance_from_sun_km
      if (typeof planetData.distance_from_sun_km !== 'number' || planetData.distance_from_sun_km < 0) {
        throw new Error('Planet distance from sun must be a non-negative number');
      }

      // Check if planet already exists in pending or published tables
      const existingPending = db.prepare('SELECT * FROM pending_planets WHERE name = ?').get(planetData.name);
      const existingPublished = db.prepare('SELECT * FROM planets WHERE name = ?').get(planetData.name);

      if (existingPending || existingPublished) {
        throw new Error('Planet with this name already exists in the database');
      }

      // Insert the new pending planet
      const stmt = db.prepare(`
        INSERT INTO pending_planets (name, size_km, atmosphere, type, distance_from_sun_km) 
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        planetData.name,
        planetData.size_km,
        planetData.atmosphere,
        planetData.type,
        planetData.distance_from_sun_km
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Error adding pending planet:', error.message);
      return false;
    }
  }

  static findByName(name) {
    return db.prepare("SELECT * FROM pending_planets WHERE name = ?").get(name);
  }

  static remove(name) {
    const stmt = db.prepare("DELETE FROM pending_planets WHERE name = ?");
    const result = stmt.run(name);
    return result.changes > 0;
  }
}

module.exports = PendingPlanet;
