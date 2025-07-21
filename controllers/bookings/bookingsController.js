// controllers/bookings/bookingsController.js
const db = require('../../config/db');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { booking_date, location, name, email, phone,course_name } = req.body;
    const price = 4490.00; // fixed price

    const query = `
      INSERT INTO bookings (booking_date, location, name, email, phone, price,course_name)
      VALUES (?, ?, ?, ?, ?, ?,?)
    `;
    const [result] = await db.query(query, [booking_date, location, name, email, phone, price,course_name]);

    res.status(201).json({ message: 'Booking successful', bookingId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM bookings ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const [results] = await db.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);

    if (results.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Delete a booking by ID
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const [result] = await db.query('DELETE FROM bookings WHERE id = ?', [bookingId]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};