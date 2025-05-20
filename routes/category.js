const express = require('express');
const router = express.Router();
const { getCategory, getCategoryByName, getSubCategoryByName ,addCategory,updateCategory,deleteCategory } = require('../controllers/category/categoryController');

router.get('/categories', getCategory);
router.post('/categories', addCategory);
router.put('/categories/id/:id', updateCategory);
router.delete('/categories/id/:id', deleteCategory); // Assuming you have a deleteCategory function
router.get('/categories/:categoryName', getCategoryByName);
router.get('/categories/subCategory/:subCategoryName', getSubCategoryByName);


module.exports = router;
