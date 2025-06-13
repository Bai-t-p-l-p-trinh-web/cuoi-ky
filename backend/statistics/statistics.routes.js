const express = require('express');
const router = express.Router();
const controller = require('./statistic.controller');
const { verifyToken } = require('../user/user.middleware');

router.get('/views', verifyToken ,controller.getStatisticViews);

router.get('/contacts', verifyToken, controller.getStatisticContacts);

router.get('/revenues', verifyToken, controller.getStatisticRevenue);

module.exports = router;