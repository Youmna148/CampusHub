const express = require('express');
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();


router.get(
  '/stats',
  authController.protect,
  authController.restrictTo('admin'),
  eventController.getEventStats
);


router
  .route('/')
  .get(eventController.getAllEvents)
  .post(
    authController.protect,
    authController.restrictTo('organizer', 'admin'),
    eventController.createEvent
  );

router.post(
  '/:eventId/book',
  authController.protect,
  bookingController.createBooking
);

router
  .route('/:eventId/reviews')
  .get(reviewController.getEventReviews)
  .post(
    authController.protect,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(eventController.getEvent)
  .patch(
    authController.protect,
    authController.restrictTo('organizer', 'admin'),
    eventController.updateEvent
  )
  .delete(
    authController.protect,
    authController.restrictTo('organizer', 'admin'),
    eventController.deleteEvent
  );

module.exports = router;