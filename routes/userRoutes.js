const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.use(authController.protect);
router.get(
  '/me',
  userController.getMe
);
router.patch(
  '/updateMe',
  userController.updateMe
);
router.patch(
  '/updateMyPassword',
  authController.updatePassword
);
router.get(
  '/',
  authController.restrictTo('admin'),
  userController.getAllUsers
);
router.delete(
  '/:id',
  authController.restrictTo('admin'),
  userController.deleteUser
);
module.exports = router;