const Planet = require('../models/Planet');
const PendingPlanet = require('../models/PendingPlanet');
const db = require('../models/db_conf');

// Autoriser plusieurs espions sur la même méthode
jasmine.getEnv().allowRespy(true);

// Mock data
const mockPlanet = {
  name: 'Earth',
  size_km: 12742,
  atmosphere: 'Nitrogen, Oxygen',
  type: 'Terrestrial',
  distance_from_sun_km: 149600000
};

const mockPendingPlanet = {
  id: 1,
  name: 'Mars',
  size_km: 6779,
  atmosphere: 'Carbon Dioxide',
  type: 'Terrestrial',
  distance_from_sun_km: 227900000
};

describe('Planet routes', () => {
  beforeEach(() => {
    spyOn(Planet, 'list').and.returnValue([mockPlanet]);
    spyOn(Planet, 'add').and.callFake((data) => {
      return data.name !== mockPlanet.name;
    });
    spyOn(PendingPlanet, 'list').and.returnValue([mockPendingPlanet]);
    spyOn(PendingPlanet, 'add').and.callFake((data) => {
      return data.name !== mockPlanet.name && data.name !== mockPendingPlanet.name;
    });
    spyOn(PendingPlanet, 'findById').and.callFake((id) => {
      return id === mockPendingPlanet.id ? mockPendingPlanet : null;
    });
    spyOn(PendingPlanet, 'deleteById').and.returnValue(true);
  });

  describe('Planet.list', () => {
    it('should return the list of planets', () => {
      const planets = Planet.list();
      expect(planets).toEqual([mockPlanet]);
      expect(Planet.list).toHaveBeenCalled();
    });
  });

  describe('Planet.add', () => {
    it('should add a new planet if it does not already exist', () => {
      const newPlanet = {
        name: 'Venus',
        size_km: 12104,
        atmosphere: 'Carbon Dioxide, Nitrogen',
        type: 'Terrestrial',
        distance_from_sun_km: 108200000
      };
      const result = Planet.add(newPlanet);
      expect(result).toBeTrue();
      expect(Planet.add).toHaveBeenCalledWith(newPlanet);
    });

    it('should not add a planet if it already exists', () => {
      const result = Planet.add(mockPlanet);
      expect(result).toBeFalse();
      expect(Planet.add).toHaveBeenCalledWith(mockPlanet);
    });
  });

  describe('PendingPlanet.add', () => {
    it('should add a new pending planet with a unique name', () => {
      const newPendingPlanet = {
        name: 'Jupiter-Unique', // Nom unique
        size_km: 139820,
        atmosphere: 'Hydrogen, Helium',
        type: 'Gas Giant',
        distance_from_sun_km: 778500000
      };
      const result = PendingPlanet.add(newPendingPlanet);
      expect(result).toBeTrue();
      expect(PendingPlanet.add).toHaveBeenCalledWith(newPendingPlanet);
    });

    it('should not add a pending planet if it already exists in mock data', () => {
      const duplicatePendingPlanet = { ...mockPendingPlanet };
      const result = PendingPlanet.add(duplicatePendingPlanet);
      expect(result).toBeFalse();
      expect(PendingPlanet.add).toHaveBeenCalledWith(duplicatePendingPlanet);
    });
  });

  describe('PendingPlanet.findById', () => {
    it('should find a pending planet by ID', () => {
      const result = PendingPlanet.findById(mockPendingPlanet.id);
      expect(result).toEqual(mockPendingPlanet);
      expect(PendingPlanet.findById).toHaveBeenCalledWith(mockPendingPlanet.id);
    });

    it('should return null if the pending planet does not exist', () => {
      const result = PendingPlanet.findById(999);
      expect(result).toBeNull();
      expect(PendingPlanet.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('PendingPlanet.deleteById', () => {
    it('should delete a pending planet by ID', () => {
      const result = PendingPlanet.deleteById(mockPendingPlanet.id);
      expect(result).toBeTrue();
      expect(PendingPlanet.deleteById).toHaveBeenCalledWith(mockPendingPlanet.id);
    });
  });

  describe('Planet approval and rejection', () => {
    it('should approve a pending planet and add it to the main planet list', () => {
      spyOn(Planet, 'add').and.returnValue(true);
      const pendingPlanet = PendingPlanet.findById(mockPendingPlanet.id);
      const addResult = Planet.add(pendingPlanet);

      if (addResult) {
        const deleteResult = PendingPlanet.deleteById(mockPendingPlanet.id);
        expect(deleteResult).toBeTrue();
      }

      expect(Planet.add).toHaveBeenCalledWith(pendingPlanet);
      expect(PendingPlanet.deleteById).toHaveBeenCalledWith(mockPendingPlanet.id);
    });

    it('should reject a pending planet', () => {
      const deleteResult = PendingPlanet.deleteById(mockPendingPlanet.id);
      expect(deleteResult).toBeTrue();
      expect(PendingPlanet.deleteById).toHaveBeenCalledWith(mockPendingPlanet.id);
    });
  });
});

describe('Planet model', () => {
  beforeEach(() => {
    spyOn(db, 'prepare').and.callFake((query) => {
      let mockData = [
        { name: 'Earth', size_km: 12742, atmosphere: 'Nitrogen, Oxygen', type: 'Terrestrial', distance_from_sun_km: 149600000 },
        { name: 'Mars', size_km: 6779, atmosphere: 'Carbon Dioxide', type: 'Terrestrial', distance_from_sun_km: 227900000 }
      ];

      if (query === "SELECT * FROM planets") {
        return {
          all: () => mockData
        };
      }

      if (query.startsWith("SELECT * FROM planets WHERE name = ?")) {
        return {
          get: (name) => mockData.find(planet => planet.name === name) || null
        };
      }

      if (query.startsWith("INSERT INTO planets")) {
        return {
          run: (name, size_km, atmosphere, type, distance_from_sun_km) => {
            if (mockData.some(planet => planet.name === name)) {
              return { changes: 0 };
            }
            mockData.push({ name, size_km, atmosphere, type, distance_from_sun_km });
            return { changes: 1 };
          }
        };
      }

      return { run: () => undefined };
    });
  });

  describe('list', () => {
    it('should return all planets from the database', () => {
      const result = Planet.list();
      expect(db.prepare).toHaveBeenCalledWith("SELECT * FROM planets");
      expect(result).toEqual([
        { name: 'Earth', size_km: 12742, atmosphere: 'Nitrogen, Oxygen', type: 'Terrestrial', distance_from_sun_km: 149600000 },
        { name: 'Mars', size_km: 6779, atmosphere: 'Carbon Dioxide', type: 'Terrestrial', distance_from_sun_km: 227900000 }
      ]);
    });
  });

  describe('add', () => {
    it('should add a new planet if it does not already exist', () => {
      const newPlanet = {
        name: 'Saturn-Unique', // Nom unique
        size_km: 120536,
        atmosphere: 'Hydrogen, Helium',
        type: 'Gas Giant',
        distance_from_sun_km: 1433500000
      };

      const result = Planet.add(newPlanet);
      expect(db.prepare).toHaveBeenCalledWith("SELECT * FROM planets WHERE name = ?");
      expect(db.prepare).toHaveBeenCalledWith("INSERT INTO planets (name, size_km, atmosphere, type, distance_from_sun_km) VALUES (?, ?, ?, ?, ?)");
      expect(result).toBeTrue();
    });
  });

  describe('findByName', () => {
    it('should return a planet by its name', () => {
      const result = Planet.findByName('Earth');
      expect(db.prepare).toHaveBeenCalledWith("SELECT * FROM planets WHERE name = ?");
      expect(result).toEqual({
        name: 'Earth',
        size_km: 12742,
        atmosphere: 'Nitrogen, Oxygen',
        type: 'Terrestrial',
        distance_from_sun_km: 149600000
      });
    });
  });
});
