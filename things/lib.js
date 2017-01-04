'use strict';
/* jshint node: true, latedef: nofunc */

var uuid = require('uuid'),
    // internal
    db   = require('./db.js');

module.exports = {

  createThing: function(user, description, callback) {

    var timestamp = Date.now();

    var thing = {
      id: uuid(),
      description: description,
      createdAt: timestamp,
      createdBy: user.id,
      owner: user.id,
      enabled: true,
      updatedAt: timestamp,
      secret: "the cake is a lie."
    };

    db.insert('things', thing, callback);

  },

  deleteThing: function(thing, callback) {

    db.remove('things', thing, callback);

  },

  findThings: function(callback) {

    db.find('things', callback);

  },

  findThingById: function(id, callback) {

    db.findOne('things', {id: id}, callback);

  },

  updateThing: function(thing, callback) {

    db.update('things', thing, callback);

  }

};

// private
