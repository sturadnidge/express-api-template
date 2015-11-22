'use strict';

var _ = require('lodash');

module.exports = {

  item: {

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
        // TODO lookup user in database to see if they exist!
        return true;
      }

      return false;
    }

  },

  user: {

    email: function(data) {

      if (_.has(data, 'email')) {
        var re = /^[^ ]{0,40}@[A-z0-9\\-\\_\\.]{0,40}$/;
        return (re.test(data.email));
      }

      return false;
    },

    enabled: function(data) {

      if (_.has(data, 'enabled')) {
        return _.isBoolean(data.enabled);
      }

      return false;
    },

    roles: function(data) {

      if (_.has(data, 'roles')) {
        // TODO define valid roles and lookup against them
        return true;
      }

      return false;
    }

  },

  uuid: function(uuid) {
    var re = /^([0-9a-fA-F]){32}$/;

    return (re.test(uuid));
  }

};
