const express = require('express');
const router = express.Router();
const { getSections } = require('../controllers/section/sectionController');

router.get('/section', getSections);

module.exports = router;


