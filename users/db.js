'use strict';

var _   = require('lodash'),
    low = require('lowdb');

var db = low('data/user-db.json');

db.set('users', []).value();

module.exports = {

  find: function(collection, query, callback) {

    var data = db.get(collection).where(query).value();

    callback(null, data);
  },

  findOne: function(collection, query, callback) {

    var data = cloneFindOne(collection, query);

    callback(null, data);

  },

  findByCurrentEmail: function(collection, email, callback) {

    var data = db.get(collection)
                 .filter(function(o) {return o.email.current === email;}).value();

    // filter returns an array, which should only have 1 value
    if (data.length > 1) {
      console.log('duplicate data found for email address ' + email);
    }

    data = _.head(data);

    callback(null, data);
  },

  findByCurrentToken: function(collection, token, callback) {

    var data = db.get(collection)
                 .filter(function(o) {return o.auth.token === token;}).value();

    // filter returns an array, which should only have 1 value
    if (data.length > 1) {
      console.log('duplicate data found for (current) token ' + token);
    }

    data = _.head(data);

    callback(null, data);

  },

  findByPendingToken: function(collection, token, callback) {

    var data = db.get(collection)
                 .filter(function(o) {return o.auth.pending === token;}).value();

    // filter returns an array, which should only have 1 value
    if (data.length > 1) {
      console.log('duplicate data found for (pending) token ' + token);
    }

    data = _.head(data);

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
