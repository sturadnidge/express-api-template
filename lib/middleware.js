'use strict';
/* jshint node: true, latedef: nofunc */

var _   = require('lodash'),
    jwt = require('jsonwebtoken');

module.exports = {

  checkToken: function(req, res, next) {
    var data = {};

    if (_.isNil(req.get(req.app.get('authHeader')))) {
      // no token, flag as unauthenticated
      req.authenticated = false;
      next();

    } else {

      var token = req.get(req.app.get('authHeader'));

      var options = {
        algorithms: ['PS256']
      };

      jwt.verify(token, process.env.JWT_VERIFY_KEY, options, function(err, decoded) {
        if (err) {
          data.message = 'cannot verify authenication token';
          res.status(400).json(data);
        } else {
          req.authenticated = true;
          req.user = decoded;

          next();
        }
      });

    }

  },

  requireAuthentication: function(req, res, next) {
    var data = {};

    data.message = 'only authenticated requests can attempt that';
    req.authenticated ? next() : res.status(401).json(data);

  }

};

// private

if (!process.env.JWT_VERIFY_KEY) {
  console.log('JWT_VERIFY_KEY environment variable not set, exiting\n');
  process.exit(1);
}
