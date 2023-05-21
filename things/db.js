'use strict';
/* jshint node: true, latedef: nofunc */

var _ = require('lodash');

var db = { things: [] };

var lodb = _.chain(db.things);

module.exports = {

  find: function() {

    return lodb.filter({enabled: true}).value();

  },

  findOne: function(query) {

    return cloneFindOne(query);

  },

  insert: function(thing) {

    db.things.push(thing);

    return cloneFindOne({id: thing.id});

  },

  remove: function(thing) {

    lodb.remove(thing).value();

  },

  update: function(thing) {

    lodb.find({id: thing.id}).assign(thing).value();

    return cloneFindOne({id: thing.id});

  }
};

// private

function cloneFindOne(query) {
  return lodb.find(query).cloneDeep().value();
}
