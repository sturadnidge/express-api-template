'use strict';

var crypto = require('crypto'),
    db     = require('./db.js'),
    lib    = require('../lib/express-api-template.js');

var HMACSecret = process.env.HMAC_SECRET || 'changethis,obviously';

module.exports = {

  authenticate: function(token, callback) {

    var hashed = encryptor(token);

    db.findOne('users', {auth: {token: hashed}}, function(err, user) {
      if (err) return callback(err, null);
      if (user) {
        callback(null, user);
      } else {
        db.findOne('users', {auth: {pending: hashed}}, function(err, user_) {
          if (err) return callback(err, null);
          if (user_) {
            if (!user_.active) {
              // new user, activate
              user_.active = true;
            }
            // update tokens
            user_.auth.token    = hashed;
            user_.auth.pending  = null;

            db.update('users', user_, callback);
          } else {
            // no token to be found
            callback(null, null);
          }
        });
      }
    });

  },

  createUser: function(data, token, callback) {

    var timestamp = Date.now(),
        hashed    = encryptor(token);

    var user = {
      id: lib.createUUID(),
      cat: timestamp,
      email: {
        current: data.email.toLowerCase(),
        pending: null
      },
      active: false,
      enabled: true,
      auth: {
        token: null,
        pending: hashed
      },
      roles: ['user'],
      uat: timestamp
    };

    db.insert('users', user, callback);

  },

  deleteUser: function(user, callback) {

    db.remove('users', user, callback);

  },

  findUserByEmail: function(email, callback) {

    db.findOne('users', {email: { current: email}}, callback);

  },

  findUserById: function(id, callback) {

    db.findOne('users', {id: id}, callback);

  },

  updateUser: function(user, callback) {

    db.update('users', user, callback);

  },

  updateAuthToken: function(user, token, callback) {

    var hashed = encryptor(token);

    user.auth.pending = hashed;

    db.update('users', user, callback);

  }
};

// private
function encryptor(token) {
  var HMACin = crypto.createHmac('sha1', HMACSecret);

  HMACin.update(token);

  return HMACin.digest('hex');
}
