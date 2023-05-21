'use strict';
/* jshint node: true, latedef: nofunc */

var _ = require('lodash'),
    mw = require('./middleware.js'),
    validate = require('./validate');

module.exports = {

  hasRole: function(user, role) {

    return _.indexOf(user.roles, role) !== -1;

  },

  isOwner: function(user, data) {

    return user.id == data.owner;

  },

  mw: mw,

  validate: validate

};
