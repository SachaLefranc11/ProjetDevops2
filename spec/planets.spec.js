const SolarSystem = require('../models/Planet'); // Exemple de modèle

describe('Solar System Model', () => {
  it('should add a new planet if it does not exist', () => {
    const result = SolarSystem.addPlanet({ name: 'Mars', size: 6779, atmosphere: 'CO2', type: 'terrestrial' });
    expect(result).toBeTruthy();
  });
});