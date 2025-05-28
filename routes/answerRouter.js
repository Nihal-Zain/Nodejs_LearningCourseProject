const express = require('express');
const router = express.Router();
const answersController = require('../controllers/answers/answerController');

// Create a new answer
router.post('/answers', answersController.createAnswer);

// Get all answers
router.get('/answers', answersController.getAllAnswers);

// Get answer by ID
router.get('/answers/:id', answersController.getAnswerById);

// Get answers by user_id (who answered)
router.get('/answers/user/:user_id', answersController.getAnswersByUser);

// Get answers by target_user_id (who is evaluated)
router.get('/answers/target/:target_user_id', answersController.getAnswersByTargetUser);

// Update answer by ID
router.put('/answers/:id', answersController.updateAnswer);

// Delete answer by ID
router.delete('/answers/:id', answersController.deleteAnswer);

module.exports = router;
