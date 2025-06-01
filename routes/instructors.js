const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../middlewares/cloudinary'); // adjust path
const upload = multer({ storage });

const instructorController = require('../controllers/instructors/instructorsController');

router.get('/instructors', instructorController.getAllInstructors);
router.post('/instructors', upload.single('img'), instructorController.addInstructor);
router.get('/instructors/:id', instructorController.getInstructorById);
router.delete('/instructors/:id', instructorController.deleteInstructor);
router.put('/instructors/:id', upload.single('img'), instructorController.updateInstructor);

module.exports = router;
