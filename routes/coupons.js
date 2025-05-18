const express = require('express');
const router = express.Router();
const { getCoupons } = require('../controllers/coupons/couponsController');
router.get('/coupons', getCoupons);

module.exports = router;
