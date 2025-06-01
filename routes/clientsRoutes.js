// routes/clientsRoutes.js
const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients/clientsController');
// const upload = require('../middlewares/upload');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/clients', clientsController.getAllClients);
router.get('/clients/:id', clientsController.getClientById);
router.post('/clients', upload.single('image'), clientsController.createClient);
router.put('/clients/:id', upload.single('image'), clientsController.updateClient);
router.delete('/clients/:id', clientsController.deleteClient);

module.exports = router;
