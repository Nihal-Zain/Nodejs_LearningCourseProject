const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countries/countryController');
const multer = require('multer');
const path = require('path');

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save to /uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g. 1728378213.jpg
  }
});

const upload = multer({ storage });

// Route: Create with image upload
// countryRoutes.js
router.post('/countries', upload.single('country_image'), countryController.createCountry);


// Other routes
router.get('/countries', countryController.getAllCountries);
router.get('/countries/:id', countryController.getCountryById);
router.put('/countries/:id', countryController.updateCountry); // You can enhance this to support image
router.delete('/countries/:id', countryController.deleteCountry);

module.exports = router;
