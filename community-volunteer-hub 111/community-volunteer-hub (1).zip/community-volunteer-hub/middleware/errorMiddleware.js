const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

module.exports = { asyncHandler, createError };