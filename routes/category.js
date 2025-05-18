const express = require('express');
const router = express.Router();
const { getCategory, getCategoryByName, getSubCategoryByName } = require('../controllers/category/categoryController');

router.get('/categories', getCategory);
router.get('/categories/:categoryName', getCategoryByName);
router.get('/categories/subCategory/:subCategoryName', getSubCategoryByName);


module.exports = router;
