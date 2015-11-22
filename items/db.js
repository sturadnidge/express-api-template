'use strict';

var low = require('lowdb');

var db = low('data/item-db.json');

module.exports = {

  find: function(collection, query, callback) {

    var data = db(collection).where(query).value();

    callback(null, data);
  },

  findOne: function(collection, query, callback) {

    var data = cloneFindOne(collection, query);

    callback(null, data);

  },

  insert: function(collection, thing, callback) {

    db(collection).push(thing);

    var data = cloneFindOne(collection, {id: thing.id});

    callback(null, data);

  },

  remove: function(collection, thing, callback) {

    db(collection).remove(thing);

    callback(null);

  },

  update: function(collection, thing, callback) {

    thing.uat = Date.now();

    db(collection).find({id: thing.id}).assign(thing);

    var data = cloneFindOne(collection, {id: thing.id});

    callback(null, data);

  }
};

// unexported
function cloneFindOne(collection, query) {
  return db(collection).find(query).cloneDeep().value();
}
