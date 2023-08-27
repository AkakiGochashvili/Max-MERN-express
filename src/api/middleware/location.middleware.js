const axios = require('axios');
const ErrorResponseBuilder = require('../helper/error-response-builder.helper');

const getCoordsForAddress = async (request, response, next) => {
  let location

  await axios.get(`http://api.positionstack.com/v1/forward?access_key=${process.env.LOCATION_API_KEY}&query=${request.body.address}`)
    .then(response => {
      if (response.data.data && response.data.data.length) {
        location = { lat: response.data.data[0].latitude, lng: response.data.data[0].longitude }
      } else {
        return next(new ErrorResponseBuilder('Could not find location for the specified address.', 422))
      }
    }).catch((error) => {
      return next(new ErrorResponseBuilder('Error occured while getting location.', 500))
    });

  request.location = location

  next();
}

module.exports = getCoordsForAddress;

