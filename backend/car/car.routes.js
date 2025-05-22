const express = require('express');
const router = express.Router();
const controller = require('./car.controller');
const carValidates = require('../validates/car.validate');

// Get All Cars 
router.get('/', controller.index);

// Get Car By Slug 
router.get('/:slugCar', controller.getCarBySlug);

// Create Car 
router.post('/', carValidates.createCar , controller.createCar);

module.exports = router;