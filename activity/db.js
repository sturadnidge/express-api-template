'use strict';

var low = require('lowdb');

var db = low('data/activity-db.json');

module.exports = {

  find: function(collection, query, callback) {

    var data = db(collection).where(query).value();

    callback(null, data);
  },

  findOne: function(collection, query, callback) {

    var data = cloneFindOne(collection, query);

    callback(null, data);

  },

  findRecent: function(collection, callback) {

    var data = db(collection)
               .chain()
               .where({public: true})
               .sortBy('cat')
               .reverse()
               .take(100)
               .value();

    callback(null, data);

  },

  insert: function(collection, thing, callback) {

    db(collection).push(thing);

    var data = cloneFindOne(collection, {id: thing.id});

    callback(null, data);

  }

};

// private
function cloneFindOne(collection, query) {
  return db(collection).find(query).cloneDeep().value();
}
