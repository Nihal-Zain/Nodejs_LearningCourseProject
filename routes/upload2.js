const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/upload2/upload2Controller');

router.get('/upload2', getQuizResults);

module.exports = router;



