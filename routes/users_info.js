const express = require('express');
const router = express.Router();
const { getUserInfo } = require('../controllers/users_info/usersInfoController');

router.get('/users_info', getUserInfo);

module.exports = router;

