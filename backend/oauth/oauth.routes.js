const express = require('express');
const router = express.Router();
const controller = require('./oauth.controller');
const validate = require('./oauth.validate');

router.get('/google', controller.getRepondsByGoogle);

router.get('/tempUser', controller.getTempUser);

router.post('/updateUser', validate.validateOauthFillInfo,controller.updateUser);

module.exports = router;