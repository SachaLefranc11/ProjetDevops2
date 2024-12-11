const PendingPlanet = require('../models/PendingPlanet');
const db = require('../models/db_conf');
const express = require('express');
const router = require('../routes/pending_planet');
const Planet = require('../models/Planet');

const app = express();
app.use(express.json());
app.use('/', router);

// Tests for Models
describe('PendingPlanet Model', () => {
    let dbPrepareStub;
  
    beforeEach(() => {
        dbPrepareStub = spyOn(db, 'prepare').and.callFake((query) => {
          if (query.includes('SELECT * FROM pending_planets WHERE name = ?')) {
            return { 
              get: () => null,
              run: () => ({ changes: 1 })
            };
          }
          if (query.includes('SELECT * FROM planets WHERE name = ?')) {
            return { 
              get: () => null
            };
          }
          if (query.includes('INSERT INTO pending_planets')) {
            return {
              run: () => ({ changes: 1 })
            };
          }
          return {
            all: () => [{ id: 1, name: 'Earth' }],
            get: () => ({ id: 1, name: 'Earth' }),
            run: () => ({ changes: 1 })
          };
        });
    });


  it('should list all pending planets', () => {
    const planets = PendingPlanet.list();
    expect(planets).toEqual([{ id: 1, name: 'Earth' }]);
  });

  it('should find a pending planet by id', () => {
    const planet = PendingPlanet.findById(1);
    expect(planet).toEqual({ id: 1, name: 'Earth' });
  });

  it('should delete a pending planet by id', () => {
    const result = PendingPlanet.deleteById(1);
    expect(result).toBe(true);
  });

  it('should add a new pending planet', () => {
    const result = PendingPlanet.add({ name: 'Mars', size_km: 6779, atmosphere: 'CO2', type: 'Terrestrial', distance_from_sun_km: 227943824 });
    expect(result).toBe(true);
  });

  it('should not add a duplicate pending planet', () => {
    dbPrepareStub.and.callFake((query) => {
      if (query.includes('SELECT * FROM pending_planets WHERE name = ?')) {
        return {
          get: () => ({ id: 1, name: 'Earth' }),  // Simulate existing planet
          run: () => ({ changes: 0 })
        };
      }
      if (query.includes('SELECT * FROM planets WHERE name = ?')) {
        return {
          get: () => null
        };
      }
      return {
        run: () => ({ changes: 0 })
      };
    });
  
    const result = PendingPlanet.add({ 
      name: 'Earth', 
      size_km: 12742, 
      atmosphere: 'N2/O2', 
      type: 'Terrestrial', 
      distance_from_sun_km: 149598262 
    });
    expect(result).toBe(false);
  });

  it('should find a pending planet by name', () => {
    dbPrepareStub.and.callFake((query) => {
      if (query.includes('SELECT * FROM pending_planets WHERE name = ?')) {
        return { get: () => ({ id: 1, name: 'Earth' }) }; // Existing pending planet
      }
      return {
        get: () => null
      };
    });
    const planet = PendingPlanet.findByName('Earth');
    expect(planet).toEqual({ id: 1, name: 'Earth' });
  });

  it('should remove a pending planet by name', () => {
    const result = PendingPlanet.remove('Earth');
    expect(result).toBe(true);
  });

  it('should not add a pending planet when planet already exists', () => {
    dbPrepareStub.and.callFake((query) => {
      if (query.includes('SELECT * FROM planets WHERE name = ?')) {
        return {
          get: () => ({ id: 1, name: 'Earth' }), // Existing planet in planets table
        };
      }
      return {
        get: () => null,
        run: () => ({ changes: 0 })
      };
    });

    const result = PendingPlanet.add({ 
      name: 'Earth', 
      size_km: 12742, 
      atmosphere: 'N2/O2', 
      type: 'Terrestrial', 
      distance_from_sun_km: 149598262 
    });
    expect(result).toBe(false);
  });

   it('should handle failed database operations', () => {
        // Override the default stub behavior specifically for this test
        dbPrepareStub.and.callFake((query) => {
            // For INSERT operations, simulate failure
            if (query.includes('INSERT INTO pending_planets')) {
                return {
                    run: () => ({ changes: 0 })
                };
            }
            // For SELECT operations checking existence
            if (query.includes('SELECT * FROM pending_planets WHERE name = ?') || 
                query.includes('SELECT * FROM planets WHERE name = ?')) {
                return {
                    get: () => null
                };
            }
            return {
                get: () => null,
                run: () => ({ changes: 0 })
            };
        });
        
        const result = PendingPlanet.add({ 
            name: 'Mars', 
            size_km: 6779, 
            atmosphere: 'CO2', 
            type: 'Terrestrial', 
            distance_from_sun_km: 227943824 
        });
        expect(result).toBe(false);  // Ensure the result is false
    });
});

// Tests for Routes
describe('Planet Pending Routes', () => {
    let pendingPlanetAddSpy;
  
    beforeEach(() => {
      // Reset spies before each test
      pendingPlanetAddSpy = spyOn(PendingPlanet, 'add').and.callFake((data) => {
        if (data.name === 'Earth') {
          return false;
        }
        return true;
      });
      spyOn(Planet, 'list').and.returnValue([{ id: 1, name: 'Earth' }]);
    });

  it('should render planets index', () => {
    const req = { query: {} };
    const res = {
      render: jasmine.createSpy('render')
    };
    router.handle({ method: 'GET', url: '/planets', ...req }, res);
    expect(res.render).toHaveBeenCalledWith('planets/index', { planets: [{ id: 1, name: 'Earth' }], errors: undefined, message: undefined });
  });

  it('should submit a new planet', () => {
    const req = {
      body: { name: 'Mars', size_km: '6779', atmosphere: 'CO2', type: 'Terrestrial', distance_from_sun_km: '227943824' }
    };
    const res = {
      redirect: jasmine.createSpy('redirect')
    };
    router.handle({ method: 'POST', url: '/submit', ...req }, res);
    expect(res.redirect).toHaveBeenCalledWith('/planets?message=Planet submitted successfully');
  });

  it('should not submit a duplicate planet', () => {
    const req = {
      body: { name: 'Earth', size_km: '12742', atmosphere: 'N2/O2', type: 'Terrestrial', distance_from_sun_km: '149598262' }
    };
    const res = {
      redirect: jasmine.createSpy('redirect')
    };
    router.handle({ method: 'POST', url: '/submit', ...req }, res);
    expect(res.redirect).toHaveBeenCalledWith('/planets?errors=Planet already exists in pending or published list');
  });

  it('should return 400 if required fields are missing', () => {
    const req = {
      body: { name: 'Mars' }
    };
    const res = {
      status: jasmine.createSpy('status').and.returnValue({ send: jasmine.createSpy('send') })
    };
    router.handle({ method: 'POST', url: '/submit', ...req }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().send).toHaveBeenCalledWith('All fields are required');
  });

  it('should return 404 for unknown routes', () => {
    const req = {};
    const res = {
      status: jasmine.createSpy('status').and.returnValue({ send: jasmine.createSpy('send') })
    };
    router.handle({ method: 'GET', url: '/unknown', ...req }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status().send).toHaveBeenCalledWith('Not Found');
  });

  it('should handle errors', () => {
    spyOn(console, 'error');
    const req = {};
    const res = {
      status: jasmine.createSpy('status').and.returnValue({ send: jasmine.createSpy('send') })
    };
    const next = jasmine.createSpy('next');
    router.use((req, res, next) => {
      next(new Error('Test Error'));
    });
    router.handle({ method: 'GET', url: '/planets', ...req }, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().send).toHaveBeenCalledWith('Something broke!');
  });

  it('should handle malformed request body', () => {
    const req = {
      body: { name: 'Mars', size_km: 'invalid' }
    };
    const res = {
      status: jasmine.createSpy('status').and.returnValue({ send: jasmine.createSpy('send') })
    };
    router.handle({ method: 'POST', url: '/submit', ...req }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle database errors', () => {
    pendingPlanetAddSpy.and.throwError('Database error');
    
    const req = {
      body: { name: 'Mars', size_km: '6779', atmosphere: 'CO2', type: 'Terrestrial', distance_from_sun_km: '227943824' }
    };
    const res = {
      status: jasmine.createSpy('status').and.returnValue({ send: jasmine.createSpy('send') })
    };
    const next = jasmine.createSpy('next');
    
    try {
      router.handle({ method: 'POST', url: '/submit', ...req }, res, next);
    } catch (error) {
      expect(error.message).toBe('Database error');
      expect(next).toHaveBeenCalledWith(error);
    }
  });

  it('should handle invalid URLs', () => {
    const req = {};
    const res = {
      status: jasmine.createSpy('status').and.returnValue({ send: jasmine.createSpy('send') })
    };
    router.handle({ method: 'GET', url: '/invalid/url', ...req }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});