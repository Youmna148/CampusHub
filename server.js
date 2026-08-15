process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

const dotenv = require('dotenv');
const mongoose = require('mongoose');
mongoose.set('sanitizeFilter', true);
dotenv.config({ path: './config.env' });

const app = require('./app');


mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('DB connection successful!');
  });

  const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');

  server.close(() => {
    console.log('Process terminated.');
  });
});