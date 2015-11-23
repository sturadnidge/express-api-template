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
    var authHeader = req.app.get('authHeader'),
        data = {};

    // in addition to the 'simple' headers
    var allowedHeaders = 'Content-Length, Origin, ' + authHeader;

    if (req.get('origin')) {
      var origin = req.get('origin');
      // only set CORS headers if origin passes regex
      var re = /^http(s)?:\/\/(\w{0,4}\.)?localhost(:\d{0,5})?$/;

      if (re.test(origin)) {
        res.set('Access-Control-Allow-Headers', allowedHeaders);
        res.set('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,OPTIONS');
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Expose-Headers', 'X-Powered-By, ' + authHeader);
        res.set('Vary', 'Origin');
      } else {
        // trivial to circumvent, but meh
        data.message = 'disallowed origin';
        return res.status(403).json(data);
      }
    } else {
      // no origin, bounce request
      data.message = 'no origin header';
      return res.status(400).json(data);
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
