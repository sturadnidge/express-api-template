'use strict';
/* jshint node: true, latedef: nofunc */

var _         = require('lodash'),
    validator = require('validator');

module.exports = {

  thing: {

    description: function(data) {

      if (_.has(data, 'description')) {
        var re = /^[A-z0-9\\ \\-\\_\\.\\,]{0,140}$/;
        return (re.test(data.description));
      }

      return false;
    },

    enabled: function(data) {

      if (_.has(data, 'enabled')) {
        return _.isBoolean(data.enabled);
      }

      return false;
    },

    owner: function(data) {

      if (_.has(data, 'owner')) {
        return true;
      }

      return false;
    }

  },

  uuid: function(uuid) {

    return validator.isUUID(uuid);
  }

};
