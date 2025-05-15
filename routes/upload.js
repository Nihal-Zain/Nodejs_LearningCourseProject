const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/upload/uploadController');

router.get('/upload', getQuizResults);

module.exports = router;



