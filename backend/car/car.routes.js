const express = require('express');
const router = express.Router();
const controller = require('./car.controller');
const carValidates = require('../validates/car.validate');
const { verifyToken } = require('../user/user.middleware');

// Get All Cars 
router.get('/', controller.index);

router.get('/display', verifyToken, controller.getCarsDisplay);

// Get Car By Slug 
router.get('/:slugCar', controller.getCarBySlug);

// Create Car 
router.post('/', carValidates.createCar , controller.createCar);



module.exports = router;