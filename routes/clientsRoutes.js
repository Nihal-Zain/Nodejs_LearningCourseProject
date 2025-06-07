const express = require('express');
const router = express.Router();
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  uploadImage
} = require('../controllers/clients/clientsController');

router.get('/clients', getAllClients);
router.get('/clients/:id', getClientById);
router.post('/clients', uploadImage, createClient);
router.put('/clients/:id', uploadImage, updateClient);
// Handle frontend's method override pattern
router.post('/clients/:id', uploadImage, (req, res) => {
  if (req.query._method === 'PUT') {
    return updateClient(req, res);
  }
  res.status(405).json({ error: 'Method not allowed' });
});
router.delete('/clients/:id', deleteClient);

module.exports = router;
