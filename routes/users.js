const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/users/usersController');

router.get('/users', getUsers);

module.exports = router;


