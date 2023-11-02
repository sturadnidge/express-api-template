'use strict';
/* jshint node: true, latedef: nofunc */

const _      = require('lodash'),
      crypto = require('crypto'),
      db     = require('./db.js');

module.exports = {

  validate: {

    description: (data) => {

      if (_.has(data, 'description')) {
        // this is just for illustration!!!
        const re = /^[A-z0-9\\ \\-\\_\\.\\,\\'\\:]{0,140}$/;
        
        return (re.test(data.description));
      }

      return false;
     },

    uuid: (uuid) => {

      const re = /^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/i;

      return re.test(uuid);
    }
  
  },
  
  hasRole: (user, role) => {

    return _.indexOf(user.roles, role) !== -1;

  },

  isOwner: (user, data) => {

    return user.id == data.owner;

  },

  createThing: (user, description, callback) => {

    const timestamp = Date.now();
    
    const thing = {
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

  deleteThing: (thing, callback) => {

    callback(null, db.remove(thing));

  },

  findThings: (callback) => {

    callback(null, db.findAll('things'));

  },

  findThingsByOwner: (owner, callback) => {

    callback(null, db.findByOwner(owner));

  },

  findThingById: (id, callback) => {

    callback(null, db.findOne({id: id}));

  },

  updateThing: (thing, callback) => {

    thing.updatedAt = Date.now(); 
    
    callback(null, db.update(thing));

  }

};
