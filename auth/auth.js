'use strict';

var lib     = require('../lib/express-api-template.js'),
    userLib = require('../users/lib.js');

module.exports = {

  login: {

    token: function(req, res) {
    // URI: /login/:token
      var data  = {},
          token = req.params.token;

      userLib.authenticate(token, function(err, user) {
        if (err) {
          data.message = 'error looking up token';
          return res.status(500).json(data);
        }

        if (!user) {
          data.message = 'token not found';
          return res.status(404).json(data);
        }

        // tack user onto req, need both for createJwt
        req.user = user;

        var jot = lib.createJwt(req);

        res.set(req.app.get('authHeader'), jot);
        // send a cookie
        //res.cookie(
        //  req.app.get('authHeader'),
        //  jot,
        //  { maxAge: new Date(Date.now() + 7884000), // 3 months
        //    httpOnly: true}
        //);

        data.message = 'logged in as user: ' + user.id;
        res.status(200).json(data);
      });
    }

  }

};
