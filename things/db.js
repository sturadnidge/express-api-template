'use strict';
/* jshint node: true, latedef: nofunc */

const _ = require('lodash');

let db = { things: [] };

const lodb = _.chain(db.things);

module.exports = {

  findAll: () => {

    return lodb.filter({enabled: true}).value();

  },

  findOne: (query) => {

    return cloneFindOne(query);

  },

  insert: (thing) => {

    db.things.push(thing);

    return cloneFindOne({id: thing.id});

  },

  remove: (thing) => {

    _.remove(db.things, o => o.id == thing.id);

  },

  update: (thing) => {

    lodb.find({id: thing.id}).assign(thing).value();

    return cloneFindOne({id: thing.id});

  }
};

// private

function cloneFindOne(query) {
  return lodb.find(query).cloneDeep().value();
}
