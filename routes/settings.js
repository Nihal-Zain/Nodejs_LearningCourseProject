const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/settings/settingsController');

router.get('/settings', getQuizResults);

module.exports = router;


