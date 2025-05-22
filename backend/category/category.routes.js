const express = require('express');
const router = express.Router();
const controller = require('./category.controller');

// test get all category 
router.get('/', controller.index);

// create category 
router.post('/', controller.createCategory);

module.exports = router;