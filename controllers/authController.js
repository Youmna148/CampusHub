const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,                // not req.body so no one can make themselves an admin by sending a request with role: 'admin'
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser._id);
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))  {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = signToken(user._id);

  user.password = undefined; 
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

if (!currentUser) {
  return next(
    new AppError(
      'The user belonging to this token no longer exists',
      401
    )
  );
}

if (currentUser.changedPasswordAfter(decoded.iat)) {
  return next(
    new AppError(
      'User recently changed password. Please log in again.',
      401
    )
  );
}

req.user = currentUser;

next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get current user including hidden password
  const user = await User.findById(req.user._id).select('+password');

  // 2) Check current password
  if (
    !(await user.correctPassword(
      req.body.passwordCurrent,
      user.password
    ))
  ) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) Set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // 4) Save user
  await user.save();

  // 5) Create new JWT
  const token = signToken(user._id);

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};