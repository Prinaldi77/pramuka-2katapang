/**
 * Helper utility to calculate GPS distances using the Haversine formula.
 */

/**
 * Calculates the geodetic distance between two coordinates in meters.
 * @param {number} lat1 - Latitude of coordinate 1
 * @param {number} lon1 - Longitude of coordinate 1
 * @param {number} lat2 - Latitude of coordinate 2
 * @param {number} lon2 - Longitude of coordinate 2
 * @returns {number} Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of the Earth in meters
  const phi1 = (lat1 * Math.PI) / 180; // phi, lambda in radians
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
};

module.exports = {
  calculateDistance
};
