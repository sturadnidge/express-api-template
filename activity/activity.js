'use strict';

var lib = require('./lib.js');

module.exports = {

  get: {

    list: {

      all: function(req, res) {
      // URI /activity
        var data = {};

        lib.findActivities(function(err, activities) {
          if (err || !activities) {
            data.message = 'error looking up activities';
            return res.status(500).json(data);
          }

          data = activities;
          res.status(200).json(data);
        });
      },

      recent: function(req, res) {
      // URI /activity
        var data = {};

        lib.findRecentActivities(function(err, activities) {
          if (err || !activities) {
            data.message = 'error looking up recent activities';
            return res.status(500).json(data);
          }

          data = activities;
          res.status(200).json(data);
        });
      }

    // end list options
    },

    record: function(req, res) {
    // URI /activity/:record
      var data = {},
          id = req.params.record;

      lib.findActivityById(id, function(err, record) {
        if (err) {
          data.message = 'error looking up record';
          return res.status(500).json(data);
        }

        if (!record) {
          data.message = 'record not found';
          return res.status(404).json(data);
        }

        data = record;
        res.status(200).json(data);
      });
    }

  // end get options
  }

// end exports
};

// private
