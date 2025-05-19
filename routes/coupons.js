const express = require('express');
const router = express.Router();
const { getCoupons } = require('../controllers/coupons/couponsController');
 const { addCoupon } = require('../controllers/coupons/couponsController');
const { deleteCoupon } = require('../controllers/coupons/couponsController');
router.get('/coupons', getCoupons);
router.post('/coupons', addCoupon);
router.delete('/coupons/id/:id', deleteCoupon);



module.exports = router;
