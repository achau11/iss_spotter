const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function(callback) {
  const request = require('request');

  request('https://api.ipify.org?format=json', function(error, response, body) {
    
    if (error)
      return callback(error, null);
    
    if (response.statusCode !== 200)
      return callback(Error(`Status Code ${response.statusCode}`));

    let ip = JSON.parse(body);
    ip = ip['ip'];
    callback(null, ip);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, function(error, response, body) {
    if (error)
      return callback(error, null);
    
    if (response.statusCode !== 200)
      return callback(Error(`Status Code ${response.statusCode}`));
  
    const {latitude, longitude} = JSON.parse(body);
    callback(error, {latitude, longitude});
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, function(error, response, body) {
    if (error)
      return callback(error, null);
    
    if (response.statusCode !== 200)
      return callback(Error(`Status Code ${response.statusCode}`));
  
    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };