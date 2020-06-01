const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.get('/getSummary', userController.getSummary);
router.get('/getInventory', userController.getInventory);
router.get('/getSteamId', userController.getSteamId);
router.get('/getAll', userController.getAll);
router.get('/getGamesWorth', userController.getGamesWorth);
router.post('/ban', userController.banUser);
router.post('/setAdmin', userController.setAdmin);

module.exports = router;
