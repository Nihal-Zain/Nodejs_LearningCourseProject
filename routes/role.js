const express = require('express');
const router = express.Router();
const { getRole } = require('../controllers/role/roleController');

router.get('/role', getRole);

module.exports = router;

