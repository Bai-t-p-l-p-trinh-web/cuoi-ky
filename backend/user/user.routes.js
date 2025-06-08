const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const { verifyToken} = require('./user.middleware');

router.get('/me', verifyToken, controller.getInfoMe);

router.post('/logout', verifyToken,controller.LogoutMe);

module.exports = router;