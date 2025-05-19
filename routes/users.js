const express = require('express');
const router = express.Router();
const { getUsers,updateUser, createUser, deleteUser  } = require('../controllers/users/usersController');

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;


