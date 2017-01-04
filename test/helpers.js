'use strict';
/* jshint node: true, latedef: nofunc */
var jwt = require('jsonwebtoken');

module.exports = {

  createJwt: function(userId, roles) {

    var options = {
      algorithm: 'HS256',
      expiresIn: '1h'
    };

    var secret = process.env.JWT_SECRET || 'sshhh - it\'s a secret!';

    var data = {
      id: userId,
      roles: roles.split(',')
    };

    return jwt.sign(data, secret, options);
  }

};
