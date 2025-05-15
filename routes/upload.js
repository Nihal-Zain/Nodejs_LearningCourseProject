const express = require('express');
const router = express.Router();
const { getUpload } = require('../controllers/upload/uploadController');

router.get('/upload', getUpload);

module.exports = router;



