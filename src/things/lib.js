import _ from 'lodash';
import { randomUUID } from 'crypto';
import db from './db.js';

const validate = {
  description: (data) => {
    if (_.has(data, 'description')) {
      // this is just for illustration!!!
      const re = /^[A-z0-9\\ \\-\\_\\.\\,\\'\\:]{0,140}$/;
      
      return re.test(data.description);
    }

    return false;
  },

  uuid: (uuid) => {
    const re = /^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/i;

    return re.test(uuid);
  }
};

const hasRole = (user, role) => {
  return user.roles.includes(role);
};

const isOwner = (user, data) => {
  return user.id === data.owner;
};

const createThing = (user, description, callback) => {
  const timestamp = Date.now();
  
  const thing = {
    id: randomUUID(),
    description,
    createdAt: timestamp,
    createdBy: user.id,
    owner: user.id,
    enabled: true,
    updatedAt: timestamp,
    secret: 'the cake is a lie.'
  };

  callback(null, db.insert(thing));
};

const deleteThing = (thing, callback) => {
  callback(null, db.remove(thing));
};

const findThings = (callback) => {
  callback(null, db.findAll('things'));
};

const findThingsByOwner = (owner, callback) => {
  callback(null, db.findByOwner(owner));
};

const findThingById = (id, callback) => {
  callback(null, db.findOne({ id }));
};

const updateThing = (thing, callback) => {
  thing.updatedAt = Date.now(); 
  
  callback(null, db.update(thing));
};

export default {
  validate,
  hasRole,
  isOwner,
  createThing,
  deleteThing,
  findThings,
  findThingsByOwner,
  findThingById,
  updateThing
};
