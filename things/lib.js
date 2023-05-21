'use strict';
/* jshint node: true, latedef: nofunc */

var crypto = require('crypto'),
    db     = require('./db.js');

module.exports = {

  createThing: function(user, description, callback) {

    var timestamp = Date.now();
    
    var thing = {
      id: crypto.randomUUID(),
      description: description,
      createdAt: timestamp,
      createdBy: user.id,
      owner: user.id,
      enabled: true,
      updatedAt: timestamp,
      secret: "the cake is a lie."
    };

    callback(null, db.insert(thing));

  },

  deleteThing: function(thing, callback) {

    callback(null, db.remove(thing));

  },

  findThings: function(callback) {

    callback(null, db.find('things'));

  },

  findThingById: function(id, callback) {

    callback(null, db.findOne({id: id}));

  },

  updateThing: function(thing, callback) {

    thing.updatedAt = Date.now(); 
    
    callback(null, db.update(thing));

  }

};

// private
