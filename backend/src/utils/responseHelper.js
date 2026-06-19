/**
 * Helper utility to send standardized API responses.
 */

/**
 * Send a success response.
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object|Array} data - Data to send (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send an error response.
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  sendSuccess,
  sendError
};
