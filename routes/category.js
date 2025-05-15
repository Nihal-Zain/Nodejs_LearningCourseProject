const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/category/categoryController');

router.get('/categories', getQuizResults);

module.exports = router;
