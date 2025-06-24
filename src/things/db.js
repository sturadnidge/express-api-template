import _ from 'lodash';

const db = { things: [] };

const lodb = _.chain(db.things);

const findAll = () => {
  return lodb.filter({ enabled: true }).value();
};

const findByOwner = (owner) => {
  return lodb.filter({ owner }).value();
};

const findOne = (query) => {
  return cloneFindOne(query);
};

const insert = (thing) => {
  db.things.push(thing);
  return cloneFindOne({ id: thing.id });
};

const remove = (thing) => {
  _.remove(db.things, (o) => o.id === thing.id);
};

const update = (thing) => {
  lodb.find({ id: thing.id }).assign(thing).value();
  return cloneFindOne({ id: thing.id });
};

// private
function cloneFindOne(query) {
  return lodb.find(query).cloneDeep().value();
}

export default {
  findAll,
  findByOwner,
  findOne,
  insert,
  remove,
  update
};
