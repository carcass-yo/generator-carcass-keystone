const keystone = require('keystone');
const request = require('request-promise-native');
const _ = require('underscore');

/**
 * Lookup geo data by address or coordinates from Google Maps Geocode API
 * @param {String} path model's location field path
 * @param {Object} _options query options for API request
 * @return {Promise<Object>}
 */
async function googleLookup(path, _options = {}) {
  const { AppError, BAD_REQUEST } = keystone.get('errors');
  const { list } = this;
  const field = list.fields[path];

  const address = this.get(field.path);
  const serializedAddress = this.get(field.paths.serialised);

  if (!Array.isArray(address.geo)) address.geo = [];
  if (serializedAddress.length === 0 && address.geo.length === 0) {
    throw new BAD_REQUEST('No address to geocode');
  }

  let options = Object.assign({}, {
    key: keystone.get('google server api key'),
    language: 'ru',
  }, _options);
  options = _.pick(options, 'key', 'language', 'region', 'bounds');

  if (serializedAddress.length > 0) {
    options.address = serializedAddress;
  } else {
    const [long, lat] = address.geo;
    options.latlng = `${lat},${long}`;
  }

  return request({
    url: 'https://maps.googleapis.com/maps/api/geocode/json',
    json: true,
    qs: options,
  })
    // Check for geocode error
    .then((geocode) => {
      if (geocode.status !== 'OK') {
        throw new AppError(`${geocode.status}: ${geocode.error_message}`);
      }
      return geocode.results[0];
    })
    // Adapt results to keystone.Field.Types.Location scheme
    .then((data) => {
      const result = {};
      data.address_components.forEach((val) => {
        if (val.types.includes('street_number')) {
          result.street1 = [val.long_name];
        }
        if (val.types.includes('route')) {
          result.street1 = result.street1 || [];
          result.street1.push(val.short_name);
        }
        // in some cases, you get suburb, city as locality - so only use the first
        if (val.types.includes('locality') && !result.suburb) {
          result.suburb = val.long_name;
        }
        if (val.types.includes('administrative_area_level_1')) {
          result.state = val.short_name;
        }
        if (val.types.includes('country')) {
          result.country = val.long_name;
        }
        if (val.types.includes('postal_code')) {
          result.postcode = val.short_name;
        }
      });

      if (Array.isArray(result.street1)) {
        result.street1 = result.street1.join(' ');
      }

      result.geo = [
        data.geometry.location.lng,
        data.geometry.location.lat,
      ];

      return result;
    });
}

module.exports = googleLookup;
