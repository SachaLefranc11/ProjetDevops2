// models/PendingPlanet.js
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
      // First check if planet exists in either pending or published tables
      const existingPending = db.prepare('SELECT * FROM pending_planets WHERE name = ?').get(planetData.name);
      const existingPublished = db.prepare('SELECT * FROM planets WHERE name = ?').get(planetData.name);

      if (existingPending || existingPublished) {
        return false;
      }

      // Attempt to insert the new pending planet
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

      // Return false if insert failed (changes === 0)
      return result.changes > 0;
    } catch (error) {
      console.error('Error adding pending planet:', error);
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