const express = require('express');
const router = express.Router();
const multer = require('multer');
const Planet = require('../models/Planet');

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
  res.render('planets/index', { planets: Planet.list(), errors: req.query.errors });
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

module.exports = router;
