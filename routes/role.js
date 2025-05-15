const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/role/roleController');

router.get('/role', getQuizResults);

module.exports = router;

