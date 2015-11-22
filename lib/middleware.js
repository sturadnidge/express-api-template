'use strict';

//
// Error-handling middleware are defined just like regular middleware,
// however must be defined with an arity of 4. That is, the signature:
//
// function(err, req, res, next)
//


var jwt = require('jsonwebtoken'),
    lib = require('./express-api-template.js');

module.exports = {

  checkAuthToken: function(req, res, next) {
    var data = {};

    if (lib.checkExists(req.get(req.app.get('authHeader')))) {
      var token = req.get(req.app.get('authHeader'));

      jwt.verify(token, req.app.get('jwtSecret'), function(err, decoded) {
        if (err) {
          data.message = 'invalid identity token';
          res.status(400).json(data);
        } else {
          req.authenticated = true;
          req.user = decoded;
          next();
        }
      });
    } else {
      // no token, flag as unauthenticated
      req.authenticated = false;
      next();
    }
  },

  requireAuthentication: function(req, res, next) {
    var data = {};

    data.message = 'login if you want to do that';
    req.authenticated ?
      next() :
      res.status(401).json(data);

  }

};
