const mongoose = require('mongoose');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
  const queryObj = { ...this.queryString };

  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(field => delete queryObj[field]);

  const allowedOperators = ['gte', 'gt', 'lte', 'lt'];

  Object.keys(queryObj).forEach(field => {
    const value = queryObj[field];

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const operators = {};

      Object.entries(value).forEach(([operator, operatorValue]) => {
        if (allowedOperators.includes(operator)) {
          operators[`$${operator}`] = operatorValue;
        }
      });

      queryObj[field] = mongoose.trusted(operators);
    }
  });

  this.query = this.query.find(queryObj);

  return this;
}
sort() {
  if (this.queryString.sort) {
    const sortBy = this.queryString.sort.split(',').join(' ');
    this.query = this.query.sort(sortBy);
  } else {
    this.query = this.query.sort('-createdAt');
  }

  return this;
}
limitFields() {
  if (this.queryString.fields) {
    const fields = this.queryString.fields.split(',').join(' ');
    this.query = this.query.select(fields);
  } else {
    this.query = this.query.select('-__v');   // to return only that fields that are needed
  }

  return this;
}
paginate() {
  const page = this.queryString.page * 1 || 1;
  const limit = this.queryString.limit * 1 || 5  // 10 per page
  const skip = (page - 1) * limit;
                                                 // to divide the whole data into pagess 
  this.query = this.query.skip(skip).limit(limit);

  return this;
}
search() {
  if (
    typeof this.queryString.search === 'string' &&
    this.queryString.search.trim()
  ) {
    const escapedSearch = this.queryString.search.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    const searchRegex = new RegExp(escapedSearch, 'i');

    this.query = this.query.find({
      name: searchRegex
    });
  }

  return this;
}

}

module.exports = APIFeatures;