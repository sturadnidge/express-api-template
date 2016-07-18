'use strict';

var _   = require('lodash'),
    low = require('lowdb');

var db = low('data/item-db.json');

db.set('items', []).value();

module.exports = {

  find: function(collection, query, callback) {

    var data = db.get(collection).where(query).value();

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
