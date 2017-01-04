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

      // assumes the secret is a string, not a private key
      var options = {
        algorithms: ['HS256']
      };

      var secret = process.env.JWT_SECRET || 'sshhh - it\'s a secret!';

      jwt.verify(token, secret, options, function(err, decoded) {
        if (err) {
          data.message = 'invalid authenication token';
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
