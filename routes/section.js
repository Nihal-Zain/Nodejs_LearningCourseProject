const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/section/sectionController');

router.get('/section', getQuizResults);

module.exports = router;


