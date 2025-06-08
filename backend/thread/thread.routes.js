const express = require('express');
const router = express.Router();
const controller  = require('./thread.controller');
const { verifyToken } = require('../user/user.middleware');

router.get('/threads', verifyToken, controller.getThreadById);

router.post('/start', verifyToken, controller.startMessage);

module.exports = router;