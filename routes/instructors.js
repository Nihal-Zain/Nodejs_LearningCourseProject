// routes/instructorRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllInstructors,
  getInstructorById,
  addInstructor,
  updateInstructor,
  deleteInstructor,
  uploadImage
} = require('../controllers/instructors/instructorsController');

// Routes
router.get('/instructors', getAllInstructors);
router.get('/instructors/:id', getInstructorById);
router.post('/instructors', uploadImage, addInstructor);
router.put('/instructors/:id', uploadImage, updateInstructor);
router.delete('/instructors/:id', deleteInstructor);

module.exports = router;
