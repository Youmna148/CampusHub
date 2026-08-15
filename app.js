const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const eventRouter = require('./routes/eventRoutes');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.disable('x-powered-by'); // =express so no reason to advertise unnecessary implementation details

// app.use(
//   cors({
//     origin: [
//       'http://localhost:5500',
//       'http://127.0.0.1:5500'
//     ]
//   })
// );
app.use(helmet({
  contentSecurityPolicy: false // disable CSP to avoid script loading blocks for our static frontend
}));

app.set('query parser', 'extended');

const limiter = rateLimit({   // global Api Limiter
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit:
    process.env.NODE_ENV === 'development'
      ? 1000
      : 100,
             // 100 req during this window per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again later.'
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: 'fail',
    message: 'Too many login attempts. Please try again later.'
  }
});

app.use('/api', limiter);// why api?? to protect all routes that start with /api (all)
app.use('/api/v1/users/login', loginLimiter);// stronger login limiter for protection


app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/users', userRouter);

app.all(/.*/, (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404
    )
  );
});


app.use(globalErrorHandler);

module.exports = app;