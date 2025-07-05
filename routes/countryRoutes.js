const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countries/countryController');

// Routes
router.get('/countries', countryController.getAllCountries);
router.get('/countries/:id', countryController.getCountryById);
router.post('/countries', countryController.uploadImage, countryController.createCountry);
router.put('/countries/:id', countryController.uploadImage, countryController.updateCountry);
router.delete('/countries/:id', countryController.deleteCountry);

module.exports = router;
