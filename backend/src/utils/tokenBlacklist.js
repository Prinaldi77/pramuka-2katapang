// In-memory token blacklist for single-process Node.js environment
// In production with multiple instances, a database or Redis should be used.
const blacklist = new Set();

/**
 * Add a token to the blacklist.
 * @param {string} token 
 */
const addToken = (token) => {
  if (token) {
    blacklist.add(token);
  }
};

/**
 * Check if a token is in the blacklist.
 * @param {string} token 
 * @returns {boolean}
 */
const hasToken = (token) => {
  if (!token) return false;
  return blacklist.has(token);
};

module.exports = {
  addToken,
  hasToken
};
