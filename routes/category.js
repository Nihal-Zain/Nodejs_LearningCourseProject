const express = require('express');
const router = express.Router();
const { getCategory } = require('../controllers/category/categoryController');

router.get('/categories', getCategory);

module.exports = router;
