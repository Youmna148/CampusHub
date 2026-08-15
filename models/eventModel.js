const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'An event must have a name'],
      trim: true,
      maxlength: [
        100,
        'An event name must have 100 characters or fewer'
      ]
    },

    slug: {
      type: String
    },

    description: {
      type: String,
      required: [true, 'An event must have a description'],
      trim: true
    },

    price: {
      type: Number,
      required: [true, 'An event must have a price'],
      min: [0, 'Price cannot be negative']
    },

    duration: {
      type: Number,
      required: [true, 'An event must have a duration'],
      min: [0.5, 'Event duration must be at least 0.5 hours']
    },

    category: {
      type: String,
      required: [true, 'An event must have a category'],
      enum: {
        values: [
          'technology',
          'career',
          'sports',
          'workshop',
          'competition',
          'other'
        ],
        message: '{VALUE} is not a valid event category'
      }
    },

    location: {
      type: String,
      required: [true, 'An event must have a location'],
      trim: true
    },

    startDate: {
      type: Date,
      required: [true, 'An event must have a start date']
    },

    capacity: {
      type: Number,
      required: [true, 'An event must have a capacity'],
      min: [1, 'Capacity must be at least 1']
    },

    organizer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'An event must belong to an organizer']
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },

    ratingsQuantity: {
      type: Number,
      default: 0
    },

    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    }
  },

  // Schema options — NOT fields
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
eventSchema.pre('save', function() {
  if (!this.isModified('name')) return;

  this.slug = slugify(this.name, {
    lower: true
  });
});
eventSchema.virtual('isUpcoming').get(function() {
  return this.startDate > Date.now();
});
// eventSchema.virtual('reviews', {
//   ref: 'Review',

//   foreignField: 'event',
//   localField: '_id'
// });
eventSchema.pre(/^find/, function() {
  this.select('-__v');
});
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
