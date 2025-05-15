const express = require('express');
const router = express.Router();
const { getUpload2 } = require('../controllers/upload2/upload2Controller');

router.get('/upload2', getUpload2);

module.exports = router;



