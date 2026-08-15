const Event = require('../models/eventModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObject = require('../utils/filterObject');

exports.createEvent = catchAsync(async (req, res, next) => {
  const filteredBody = filterObject(
    req.body,
    'name',
    'description',
    'price',
    'duration',
    'category',
    'location',
    'startDate',
    'capacity'
  );
  filteredBody.organizer = req.user._id;

  const event = await Event.create(filteredBody);

  res.status(201).json({
    status: 'success',
    data: {
      event
    }
  });
});

exports.getAllEvents = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Event.find(),
    req.query
  )
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const events = await features.query;

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events
    }
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
 const event = await Event.findById(req.params.id).populate(
    'organizer',
    'name email'
  );

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event
    }
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  if (
    req.user.role !== 'admin' &&
    event.organizer.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You can only update your own events', 403));
  }

  const filteredBody = filterObject(
    req.body,
    'name',
    'description',
    'price',
    'duration',
    'category',
    'location',
    'startDate',
    'capacity'
  );

  Object.assign(event, filteredBody);
  await event.save();

  res.status(200).json({
    status: 'success',
    data: {
      event
    }
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  if (
    req.user.role !== 'admin' &&
    event.organizer.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You can only delete your own events', 403));
  }

  await Event.findByIdAndDelete(req.params.id);

  res.status(204).send();
});

exports.getEventStats = catchAsync(async (req, res, next) => {
  const stats = await Event.aggregate([
    {
      $group: {
        _id: null,

        totalEvents: {
          $sum: 1
        },

        averagePrice: {
          $avg: '$price'
        },

        averageRating: {
          $avg: '$ratingsAverage'
        }
      }
    },

    {
      $project: {
        _id: 0,
        totalEvents: 1,
        averagePrice: 1,
        averageRating: 1
      }
    }
  ]);

  const eventsByCategory = await Event.aggregate([
    {
      $group: {
        _id: '$category',

        count: {
          $sum: 1
        }
      }
    },

    {
      $sort: {
        count: -1
      }
    },

    {
      $project: {
        _id: 0,
        category: '$_id',
        count: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',

    data: {
      stats: stats[0] || {
        totalEvents: 0,
        averagePrice: 0,
        averageRating: 0
      },

      eventsByCategory
    }
  });
});