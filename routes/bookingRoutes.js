const express = require('express');

const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// you need to be logged in to do any of the following actions .
router.use(authController.protect);

router
  .route('/')
  .get(bookingController.getBookings);

  
router
  .route('/:id')
  .get(bookingController.getBooking)
  .delete(bookingController.cancelBooking);

module.exports = router;