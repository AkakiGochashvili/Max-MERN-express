const { Router } = require('express');
const { getUsers, login, signup } = require('../controller/user.controller');
const { LoginValidator, SignupValidator } = require('../validator/auth');

const router = Router();

router.route('/').get(getUsers);

router.route('/login').post(LoginValidator, login);

router.route('/signup').post(SignupValidator, signup);

module.exports = router;
