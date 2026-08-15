const filterObject = (obj, ...allowedFields) => {
  const filteredObject = {};

  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredObject[key] = obj[key];
    }
  });

  return filteredObject;
};

module.exports = filterObject;
