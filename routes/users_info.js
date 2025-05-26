const express = require('express');
const router = express.Router();
const  userInfoController  = require('../controllers/users_info/usersInfoController');

router.post('/user_info', userInfoController.createUserInfo);
router.get('/user_info', userInfoController.getAllUserInfo);
router.get('/user_info/:id', userInfoController.getUserInfoById);
router.put('/user_info/:id', userInfoController.updateUserInfo);
router.delete('/user_info/:id', userInfoController.deleteUserInfo);

module.exports = router;

