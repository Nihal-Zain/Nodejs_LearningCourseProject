const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/users/usersController');

router.get('/users', getQuizResults);

module.exports = router;


