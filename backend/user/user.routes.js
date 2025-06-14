const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const { verifyToken} = require('./user.middleware');
const { validateUpdateInfo } = require('./user.validate');

router.get('/me', verifyToken, controller.getInfoMe);

router.patch('/me', verifyToken, validateUpdateInfo, controller.updateInfoMe);

router.post('/logout', verifyToken,controller.LogoutMe);

module.exports = router;