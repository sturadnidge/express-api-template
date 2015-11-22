'use strict';

var db  = require('./db.js'),
    lib = require('../lib/express-api-template.js');

module.exports = {

  createItem: function(userId, description, callback) {

    var timestamp = Date.now();

    var item = {
      id: lib.createUUID(),
      description: description,
      cat: timestamp,
      cby: userId,
      owner: userId,
      enabled: true,
      uat: timestamp
    };

    db.insert('items', item, callback);

  },

  deleteItem: function(item, callback) {

    db.remove('items', item, callback);

  },

  findItems: function(callback) {

    db.find('items', {enabled: true}, callback);

  },

  findItemById: function(id, callback) {

    db.findOne('items', {id: id}, callback);

  },

  updateItem: function(item, callback) {

    db.update('items', item, callback);

  }

};

// private
