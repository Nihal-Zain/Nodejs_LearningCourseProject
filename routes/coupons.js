const express = require('express');
const router = express.Router();
const { getCoupons } = require('../controllers/coupons/couponsController');
router.get('/courses', getCoupons);

module.exports = router;
