const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController/sectionController');

// Define routes for sections
router.get('/sections', sectionController.getAllSections);
router.get('/sections/:id', sectionController.getSectionById);
router.post('/sections', sectionController.createSection);
router.put('/sections/:id',sectionController.updateSection);
router.delete('/sections/:id', sectionController.deleteSection);


module.exports = router;
