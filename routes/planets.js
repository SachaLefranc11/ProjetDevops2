const express = require('express');
const router = express.Router();
const multer = require('multer');
const Planet = require('../models/Planet');
const PendingPlanet = require('../models/PendingPlanet');

// Configuration Multer pour le téléversement des images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.get('/', (req, res) => {
  const planets = Planet.list(); // Planètes approuvées
  const pendingPlanets = PendingPlanet.list(); // Planètes en attente

  res.render('planets/index', { 
    planets, 
    pendingPlanets, 
    errors: req.query.errors, 
    message: req.query.message 
  });
});

router.post('/add', upload.single('planetImage'), (req, res) => {
  const { name, size_km, atmosphere, type, distance_from_sun_km } = req.body;
  const image = req.file ? `images/${req.file.filename}` : null;

  const result = Planet.add({ name, size_km: parseFloat(size_km), atmosphere, type, distance_from_sun_km: parseFloat(distance_from_sun_km), image });
  if (!result) {
    res.redirect('/planets?errors=Planet already exists or invalid data');
  } else {
    res.redirect('/planets');
  }
});

router.post('/submit', upload.single('planetImage'), (req, res) => {
  const { name, size_km, atmosphere, type, distance_from_sun_km } = req.body;
  const image = req.file ? `images/${req.file.filename}` : null;

  const result = PendingPlanet.add({ 
    name, 
    size_km: parseFloat(size_km), 
    atmosphere, 
    type, 
    distance_from_sun_km: parseFloat(distance_from_sun_km), 
    image 
  });
  
  if (!result) {
    res.redirect('/planets?errors=Planet already exists in pending or published list');
  } else {
    res.redirect('/planets?message=Planet submitted for review');
  }
});

router.post('/approve/:id', (req, res) => {
  if (req.session.admin) {
      const planetId = req.params.id;

      const pendingPlanet = PendingPlanet.findById(planetId);
      if (!pendingPlanet) {
          return res.redirect('/planets?errors=Pending planet not found');
      }

      const result = Planet.add(pendingPlanet);
      if (result) {
          PendingPlanet.deleteById(planetId);
          res.redirect('/planets?message=Planet approved');
      } else {
          res.redirect('/planets?errors=Planet could not be approved');
      }
  } else {
      res.redirect('/members');
  }
});

router.post('/reject/:id', (req, res) => {
  if (req.session.admin) {
      const planetId = req.params.id;

      const result = PendingPlanet.deleteById(planetId);
      if (result) {
          res.redirect('/planets?message=Planet rejected');
      } else {
          res.redirect('/planets?errors=Planet could not be rejected');
      }
  } else {
      res.redirect('/members');
  }
});

module.exports = router;
