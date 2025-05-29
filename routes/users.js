const express = require('express');
const router = express.Router();
const { getUsers,updateUser, createUser, deleteUser, getAllManagerOfUsers, login, getAllUsersUnderManager,saveUserTips,getTips  } = require('../controllers/users/usersController');

router.get('/users', getUsers);
router.get('/users/managers', getAllManagerOfUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/login', login);
router.get('/users/managers/:id/:organization_id', getAllUsersUnderManager );
router.post('/users/:id/saveTips', saveUserTips);
router.get('/users/tips/:id', getTips);


module.exports = router;


