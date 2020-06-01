const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item');

router.get('/getFloat', itemController.getFloat);

module.exports = router;
