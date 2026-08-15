const Review = require('../models/reviewModel');
const Event = require('../models/eventModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.createReview = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }
  if (event.startDate> new Date()) {
    return next(new AppError('You cannot review an event before it happens', 400));
  }

  // 3. User must have booked this event
  const booking = await Booking.findOne({
    user: req.user._id,
    
    event: event._id
  });

  if (!booking) {
    return next(new AppError('You can only review events you have booked', 403));
  }

  // 4. Create review
  const review = await Review.create({
    review: req.body.review,
    rating: req.body.rating,

    // NEVER trust these from req.body
    user: req.user._id,
    event: event._id
  });

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

exports.getEventReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({
    event: req.params.eventId
  })
    .populate('user', 'name')
    .populate('event', 'name');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name')
    .populate('event', 'name');

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  if (
    req.user.role !== 'admin' &&
    review.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You can only update your own reviews', 403));
  }

  const filteredBody = filterObject(req.body, 'review', 'rating');

  Object.assign(review, filteredBody);
  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  if (
    req.user.role !== 'admin' &&
    review.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You can only delete your own reviews', 403));
  }

  const eventId = review.event;

  await Review.findByIdAndDelete(req.params.id);

  await Review.calcAverageRatings(eventId);

  res.status(204).send();
});