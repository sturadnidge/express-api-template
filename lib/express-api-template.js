'use strict';

var _   = require('lodash'),
    jwt = require('jsonwebtoken');


module.exports = {

  checkEquals: function(x, y) { return x === y; },

  checkExists: function(x) { return x != null; },

  createJwt: function(req) {
    // build json web token
    var jwtOptions = {
      expiresIn: 7884000 // 3 months
    };

    return jwt.sign(
      _.pick(req.user,['id', 'roles']),
      req.app.get('jwtSecret'),
      jwtOptions
    );
  },

  createUUID: function() {
    var uuid = 'xxxxxxxxxxxxyxxxyxxxxxxxxxxxxxxx'.replace(
      /[xy]/g,
      function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ?
              r :
              (r & 0x3 | 0x8);

        return v.toString(16);
      });

    return uuid;

  },

  hasRole: function(user, role) {

    return _.indexOf(user.roles, role) !== -1;

  },

  sendAuthEmail: function(email, token, callback) {
    if (process.env.NODE_ENV === 'production') {

      // mail stuff

    } else {
      var result = {};
      result.message = 'login with token: ' + token;
      console.log('non-prod - not sending login email to: ' + email);
      console.log(result.message);
      callback(null, result);
    }

  },

  sendVerificationEmail: function(email, token, callback) {
    if (process.env.NODE_ENV === 'production') {

      // mail stuff

    } else {
      var result = {};
      result.message = 'verify with: /email?verify=' + token;
      console.log('non-prod - not sending login email to: ' + email);
      console.log(result.message);
      callback(null, result);
    }

  }

};

// private
