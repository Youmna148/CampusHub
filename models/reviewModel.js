const mongoose = require('mongoose');
const Event = require('./eventModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      trim: true
    },

    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user']
    },

    event: {
      type: mongoose.Schema.ObjectId,
      ref: 'Event',
      required: [true, 'A review must belong to an event']
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.statics.calcAverageRatings = async function(eventId) {
  const stats = await this.aggregate([
    {
      $match: {
        event: eventId
      }
    },
    {
      $group: {
        _id: '$event',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Event.findByIdAndUpdate(eventId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};
reviewSchema.index(
  { user: 1, event: 1, review: 1 },
  { unique: true }
);                         // no duplicate reviews from the same user in the same event (the exact same review)

reviewSchema.post('save', async function() {
  await this.constructor.calcAverageRatings(this.event);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;