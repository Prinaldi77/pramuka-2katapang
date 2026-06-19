const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHelper');

/**
 * Middleware to check express-validator validation results.
 * If errors are present, they are caught and returned in the standardized error format.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Get the first error message and return it
    const firstErrorMsg = errors.array()[0].msg;
    return sendError(res, firstErrorMsg, 400);
  }
  next();
};

module.exports = validate;
