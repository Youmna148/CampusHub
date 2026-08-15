const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to a user']
  },

  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'A booking must belong to an event']
  },

  price: {
    type: Number,          // adding anothet price field so we can keep the old booked already price the same * nice trick* 
     required: [true, 'A booking must have a price'],
    min: [0, 'Booking price cannot be negative']
  },

  status: {
    type: String,
    enum: ['confirmed'],
    default: 'confirmed'
  },
 
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// One user cannot book the same event twice
bookingSchema.index(
  { user: 1, event: 1 },
  { unique: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;