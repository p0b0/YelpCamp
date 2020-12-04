const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const catchError = require('../utils/catchError');
const users = require('../controllers/auth')


router.route("/register")
    .get(users.renderRegistrationForm)
    .post(catchError(users.registerUser))

router.route("/login")
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.loginUser)

router.get('/logout', users.logoutUser);

module.exports = router;