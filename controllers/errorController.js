const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  let message = 'Duplicate value. Please use another value.';

  if (
    err.keyPattern?.user &&
    err.keyPattern?.event &&
    err.keyPattern?.review
  ) {
    message =
      'You have already posted this exact review for this event';
  } else if (
    err.keyPattern?.user &&
    err.keyPattern?.event
  ) {
    message =
      'You have already booked this event';
  } else if (err.keyPattern?.email) {
    message =
      'An account with this email already exists';
  }

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(
    el => el.message
  );

  const message =
    `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError(
    'Invalid token. Please log in again',
    401
  );

const handleJWTExpiredError = () =>
  new AppError(
    'Your token has expired. Please log in again',
    401
  );

module.exports = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') {
    error = handleCastErrorDB(err);
  }

  if (err.code === 11000) {
    error = handleDuplicateFieldsDB(err);
  }

  if (err.name === 'ValidationError') {
    error = handleValidationErrorDB(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  res.status(statusCode).json({
    status,
    message: error.message
  });
};
