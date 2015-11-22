'use strict';

var db = require('./db.js');

module.exports = {

  createActivity: function(type, data, visible, callback) {
    var timestamp = Date.now();

    var activity = {
      id: createUUID(),
      type: type,
      data: data,
      public: visible,
      cat: timestamp
    };

    db.insert('activities', activity, callback);
  },

  findActivities: function(callback) {

    db.find('activities', {public: true}, callback);

  },

  findRecentActivities: function(callback) {

    db.findRecent('activities', callback);

  },

  findActivityById: function(id, callback) {

    db.findOne('activities', {id: id, public: true}, callback);

  }

};

// private
function createUUID() {
  var uuid = 'xxxxxxxxxxxxyxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g,
    function(c) {
      var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

  return uuid;
}
