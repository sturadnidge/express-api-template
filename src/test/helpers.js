'use strict';
/* jshint node: true, latedef: nofunc */
const crypto = require('crypto'),
      fs     = require('fs'),
      jwt    = require('jsonwebtoken');

// generate test keys
const keyOpts = { modulusLength: 2048,
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

module.exports = {

  createJwt: (userId, roles) => {

    const options = {
      algorithm: 'PS256',
      expiresIn: '60s'
    };

    const data = {
      id: userId,
      roles: roles.split(',')
    };

    return jwt.sign(data, privateKey, options);
  }

};