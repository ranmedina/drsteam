const express = require('express');
const passport = require('../config/passport');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/steam', passport.authenticate('openid'), (_, res) => res.redirect('/'));
router.get('/steam/return', passport.authenticate('openid'), authController.handleAuth);
router.get('/logout', authController.logout);

module.exports = router;
