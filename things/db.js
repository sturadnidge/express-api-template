'use strict';
/* jshint node: true, latedef: nofunc */

var _   = require('lodash'),
    low = require('lowdb');

var db = low();

// init
db.defaults({ things: []}).value();

module.exports = {

  find: function(collection, callback) {

    var data = db.get(collection).filter({enabled: true}).value();

    callback(null, data);
  },

  findOne: function(collection, query, callback) {

    var data = cloneFindOne(collection, query);

    callback(null, data);

  },

  insert: function(collection, thing, callback) {

    db.get(collection).push(thing).value();

    var data = cloneFindOne(collection, {id: thing.id});

    callback(null, data);

  },

  remove: function(collection, thing, callback) {

    db.get(collection).remove(thing).value();

    callback(null);

  },

  update: function(collection, thing, callback) {

    thing.uat = Date.now();

    db.get(collection).find({id: thing.id}).assign(thing).value();

    var data = cloneFindOne(collection, {id: thing.id});

    callback(null, data);

  }
};

// private

function cloneFindOne(collection, query) {
  return db.get(collection).find(query).cloneDeep().value();
}
