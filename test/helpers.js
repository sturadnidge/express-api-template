'use strict';
/* jshint node: true, latedef: nofunc */
var crypto = require('crypto'),
    fs     = require('fs'),
    jwt    = require('jsonwebtoken');


// generate test keys
var keyOpts = { modulusLength: 2048,
                publicKeyEncoding: {
                  type: "spki",
                  format: "pem",
                },
                privateKeyEncoding: {
                  type: "pkcs8",
                  format: "pem",
                }
              };

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", keyOpts);

process.env.JWT_VERIFY_KEY = publicKey;
process.env.JWT_SIGNING_KEY = privateKey;

module.exports = {

  createJwt: function(userId, roles) {

    var options = {
      algorithm: 'PS256',
      expiresIn: '1h'
    };

    var data = {
      id: userId,
      roles: roles.split(',')
    };

    return jwt.sign(data, process.env.JWT_SIGNING_KEY, options);
  }

};