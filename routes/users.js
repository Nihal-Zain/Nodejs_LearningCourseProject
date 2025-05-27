const express = require('express');
const router = express.Router();
const { getUsers,updateUser, createUser, deleteUser, getAllManagerOfUsers, login  } = require('../controllers/users/usersController');

router.get('/users', getUsers);
router.get('/users/managers', getAllManagerOfUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/login', login)

module.exports = router;


