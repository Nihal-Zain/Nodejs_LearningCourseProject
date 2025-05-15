const express = require('express');
const router = express.Router();
const { getSettings } = require('../controllers/settings/settingsController');

router.get('/settings', getSettings);

module.exports = router;


