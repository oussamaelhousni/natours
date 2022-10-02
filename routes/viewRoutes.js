const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.isLoggedIn);
router.get('/', viewController.getOverview);
router.get('/tours/:slug', viewController.getTour);
router.get('/login', viewController.login);
router.get('/account', viewController.account);
router.post(
    '/submit-user-data',
    authController.protect,
    viewController.updateUserData
);
module.exports = router;
