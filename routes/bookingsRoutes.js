// routes/bookingsRoutes.js
const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings/bookingsController');

// POST - create booking
router.post('/bookings', bookingsController.createBooking);

// GET - all bookings
router.get('/bookings', bookingsController.getAllBookings);

// GET - booking by ID
router.get('/bookings/:id', bookingsController.getBookingById);

//DELETE - booking by ID
router.delete('/bookings/:id',bookingsController.deleteBooking)

module.exports = router;
