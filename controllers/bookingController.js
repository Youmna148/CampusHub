const Booking = require('../models/bookingModel');
const Event = require('../models/eventModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createBooking = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  if (event.startDate< new Date()) {
    return next(new AppError('You cannot book an event that has already started', 400));
  }
  const existingBooking = await Booking.findOne({
    user: req.user._id,
    event: event._id
  });

  if (existingBooking) {
    return next(new AppError('You have already booked this event', 400));
  }
  const numberOfBookings = await Booking.countDocuments({
    event: event._id
  });

  if (numberOfBookings >= event.capacity) {
    return next(new AppError('This event is fully booked', 400));
  }
  const booking = await Booking.create({
    user: req.user._id,
    event: event._id,
    price: event.price
  });

  res.status(201).json({
    status: 'success',
    data: {
      booking
    }
  });
});

exports.getBookings = catchAsync(async (req, res, next) => {
  const filter =  
    req.user.role === 'admin'
      ? {}
      : { user: req.user._id };

  const bookings = await Booking.find(filter)
    .populate('event', 'name startDate location price')
    .populate('user', 'name email');

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('event', 'name startDate location')
    .populate('user', 'name email');

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }
  if (
    req.user.role !== 'admin' &&
    booking.user._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You do not have permission to view this booking', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (
    req.user.role !== 'admin' &&
    booking.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You can only cancel your own bookings', 403));
  }

  await Booking.findByIdAndDelete(req.params.id);

  res.status(204).send();
});




