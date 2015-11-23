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

  allowCors: function(req, res, next) {
    var allowedHeaders = 'Accept, Content-Type, Content-Length, Origin, ' +
          req.app.get('authHeader'),
        origin = req.get('origin');

    // origin matcher
    var re = /^http(s)?:\/\/(\w{0,4}\.)?localhost(:\d{0,5})?$/;

    // only set CORS headers if origin passes regex
    if (re.test(origin)) {
      res.set('Access-Control-Allow-Headers', allowedHeaders);
      res.set('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,OPTIONS');
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Expose-Headers', 'ETag, X-Powered-By');
      res.set('Vary', 'Origin');
    } else {
      // trivial to circumvent, but meh
      return res.status(403).send();
    }

    // if preflight, send a 204 immediately
    if (req.method.toLowerCase() === 'options') {
      res.status(204).send();
    } else {
      next();
    }

  },

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
