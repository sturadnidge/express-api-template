'use strict';
/* jshint node: true, latedef: nofunc */

var _        = require('lodash'),
    localLib = require('./lib.js'),
    lib      = require('../lib/index.js');

module.exports = {

  del: {

    thing: function(req, res) {
    // URI: /things/:thing
    // protected by middleware:
    //   requireAuthentication
      var data = {},
          id   = req.params.thing;

      localLib.findThingById(id, function(err, thing) {
        if (err) {
          data.message = 'error finding thing';
          return res.status(500).json(data);
        }

        if (!thing) {
          data.message = 'thing not found';
          return res.status(404).json(data);
        }

        // only allow admins or thing owner to delete
        if (lib.hasRole(req.user, 'admin') || req.user.id === thing.owner) {
          localLib.deleteThing(thing, function(err) {
            if (err) {
              data.message = 'error deleting thing';
              return res.status(500).json(data);
            }

            data.message = 'thing deleted';
            res.status(200).json(data);
          });
        } else {
          data.message = 'you are not authorised to do that';
          res.status(403).json(data);
        }
      });
    }

  // end delete options
  },

  get: {

    list: {

      all: function(req, res) {
      // URI /things
        var data = {};

        localLib.findThings(function(err, things) {
          if (err) {
            data.message = 'error looking up things';
            return res.status(500).json(data);
          }

          if (things) {
            data = _.map(things, _.partialRight(_.pick, ['id', 'description']));
          } else {
            data = [];
          }

          res.status(200).json(data);
        });
      }

    // end list options
    },

    thing: function(req, res) {
    // URI /things/:thing

      var data = {},
          id = req.params.thing;

      localLib.findThingById(id, function(err, thing) {
        if (err) {
          data.message = 'error finding thing';
          return res.status(500).json(data);
        }

        if (!thing) {
          data.message = 'thing not found';
          return res.status(404).json(data);
        }

        if (req.authenticated) {
          // authenticated users see a subset of data
          data = _.pick(thing, [
            'createdAt', 'description', 'id', 'owner', 'updatedAt'
          ]);

          // owner sees almost everything
          if (lib.isOwner(req.user, thing)) {
            data = _.omit(thing, ['secret']);
          }
          
          // admins see everything
          if (lib.hasRole(req.user, 'admin')) {
            data = thing;
          }

        } else {
          // anonymous users don't see much
          data = _.pick(thing, [
            'createdAt', 'description', 'id'
          ]);

        }

        res.status(200).json(data);
      });
    }

  // end get options
  },

  post: {

    create: function(req, res) {
    // URI /things
    // protected by middleware:
    //   requireAuthentication
      var data = {},
          thing = req.body;

      if (!lib.validate.thing.description(thing)) {
        // invalid thing
        data.message = 'invalid thing';
        return res.status(400).json(data);
      }

      localLib.createThing(req.user, thing.description, function(err, thing) {
        if (err || !thing) {
          data.message = 'error creating thing';
          return res.status(500).json(data);
        }

        // redirect to thing URL
        res.redirect(req.baseUrl + '/' + thing.id);
      });
    },

    update: function(req, res) {
    // URI /things/:thing
    // protected by middleware:
    //   requireAuthentication
      var data         = {},
          id           = req.params.thing,
          updatedThing = req.body;

      // need to check thing owner against requestor id, so need to find the thing first.
      localLib.findThingById(id, function(err, thing) {
        if (err) {
          data.message = 'error finding thing';
          return res.status(500).json(data);
        }

        if (!thing) {
          data.message = 'thing not found';
          return res.status(404).json(data);
        }

        // only allow admins and thing owner to update thing
        if (lib.hasRole(req.user, 'admin') || lib.isOwner(req.user, thing)) {
          // users can only update thing description
          if (!lib.validate.thing.description(updatedThing)) {
            data.message = 'invalid update (description)';
            return res.status(400).json(data);
          } else {
            thing.description = updatedThing.description;
          }
          // admins can change ownership and enable / disable things
          if (lib.hasRole(req.user, 'admin')) {

            if (!lib.validate.thing.enabled(updatedThing)) {
              data.message = 'invalid thing update (enabled)';
              return res.status(400).json(data);
            } else {
              thing.enabled = updatedThing.enabled;
            }

            if (!lib.validate.thing.owner(updatedThing)) {
              data.message = 'invalid thing update (owner)';
              return res.status(400).json(data);
            } else {
              thing.owner = updatedThing.owner;
            }
          }

          localLib.updateThing(thing, function(err, thing_) {
            if (err || !thing_) {
              data.message = 'error updating thing';
              return res.status(500).json(data);
            }

            // redirect to thing URL
            res.redirect(req.baseUrl + req.path);
          });
        } else {
          data.message = 'you are not authorised to do that';
          res.status(403).json(data);
        }
      });
    }

  // end post options
  }

// end exports
};

// private
