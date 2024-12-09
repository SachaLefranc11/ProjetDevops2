const Planet = require('../models/Planet');

describe('Planet Model', () => {
  it('should add a planet to the database', () => {
    const result = Planet.add({
      name: 'Neptune',
      size_km: 49244,
      atmosphere: 'H2, He, CH4',
      type: 'gas',
      distance_from_sun_km: 4495100000,
    });
    expect(result).toBeTruthy();
  });

  it('should not add a planet if the name already exists', () => {
    Planet.add({
      name: 'Earth',
      size_km: 12742,
      atmosphere: 'N2, O2',
      type: 'terrestrial',
      distance_from_sun_km: 149600000,
    });
    const result = Planet.add({
      name: 'Earth',
      size_km: 13000,
      atmosphere: 'H2',
      type: 'gas',
      distance_from_sun_km: 150000000,
    });
    expect(result).toBeFalsy();
  });

  it('should retrieve a planet by name', () => {
    const planet = Planet.findByName('Neptune');
    expect(planet).toBeDefined();
    expect(planet.name).toBe('Neptune');
  });
});
