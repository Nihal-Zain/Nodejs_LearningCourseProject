const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/users_info/usersInfoController');

router.get('/users_info', getQuizResults);

module.exports = router;

