const express = require('express');
const { verifyToken } = require('../user/user.middleware');
const router = express.Router();
const controller = require('./notiUser.controller');

router.get('/', verifyToken, controller.getNotices);

module.exports = router;