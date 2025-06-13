const express = require('express');
const router = express.Router();
const controller = require('./car.controller');
const carValidates = require('../validates/car.validate');
const { verifyToken, verifyTokenButDontRequired } = require('../user/user.middleware');

// Get All Cars 
router.get('/', controller.index);

router.get('/display', verifyToken, controller.getCarsDisplay);

// Get Car By Slug 
router.get('/:slugCar',verifyTokenButDontRequired, controller.getCarBySlug);

// Update Car By Slug 
router.patch('/:slugCar', verifyToken, controller.UpdateCar);

// Create Car 
router.post('/', carValidates.createCar , controller.createCar);



module.exports = router;