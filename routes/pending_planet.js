const express = require('express');
const router = express.Router();
const PendingPlanet = require('./models/PendingPlanet'); // Adjust the path as needed
const Planet = require('./models/Planet'); // Adjust the path as needed

// Route to render planets index
router.get('/planets', (req, res) => {
  res.render('planets/index', { planets: Planet.list(), errors: req.query.errors, message: req.query.message });
});

// Route to submit a planet
router.post('/submit', (req, res) => {
  const { name, size_km, atmosphere, type, distance_from_sun_km } = req.body;

  if (!name || !size_km || !atmosphere || !type || !distance_from_sun_km) {
    return res.status(400).send('All fields are required');
  }

  const result = PendingPlanet.add({
    name,
    size_km: parseFloat(size_km),
    atmosphere,
    type,
    distance_from_sun_km: parseFloat(distance_from_sun_km),
  });

  if (!result) {
    res.redirect('/planets?errors=Planet already exists in pending or published list');
  } else {
    res.redirect('/planets?message=Planet submitted successfully');
  }
});


// Catch-all route for 404 errors
router.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = router;