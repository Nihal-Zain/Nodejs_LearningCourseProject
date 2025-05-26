const express = require('express');
const router = express.Router();
const choiceController = require('../controllers/choiceController/choiceController');

// Define routes for choices
router.get('/choices', choiceController.getAllChoices);
router.get('/choices/:id', choiceController.getChoiceById);
router.post('/choices', choiceController.createChoice);
router.put('/choices/:id', choiceController.updateChoice);
router.delete('/choices/:id', choiceController.deleteChoice);

module.exports = router;
