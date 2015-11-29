'use strict';

var activityLib = require('../activity/lib.js'),
    itemLib     = require('./lib.js'),
    lib         = require('../lib/express-api-template.js'),
    validate    = require('../lib/validate.js');

module.exports = {

  del: {

    item: function(req, res) {
    // URI: /items/:item
    // protected by middleware:
    //   requireAuthentication
      var data = {},
          id   = req.params.item;

      itemLib.findItemById(id, function(err, item) {
        if (err) {
          data.message = 'error finding item';
          return res.status(500).json(data);
        }

        if (!item) {
          data.message = 'item not found';
          return res.status(404).json(data);
        }

        // only allow admins or item owner to delete
        if (lib.isAdmin(req.user) || req.user.id === item.owner) {
          itemLib.deleteItem(item, function(err) {
            if (err) {
              data.message = 'error deleting item';
              return res.status(500).json(data);
            }

            // we don't actually care if activity log update fails,
            // so don't wait for it and don't handle errs in here
            activityLib.createActivity(
              'item-deleted',
              item,
              true,
              function(err, activity) {
                if (activity) {
                  console.log('activity id ' + activity.id + ' logged');
                }
              }
            );

            data.message = 'item deleted';
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
      // URI /items
        var data = {};

        itemLib.findItems(function(err, items) {
          if (err || !items) {
            data.message = 'error looking up items';
            return res.status(500).json(data);
          }

          data = items;
          res.status(200).json(data);
        });
      }

    // end list options
    },

    item: function(req, res) {
    // URI /items/:item

      var data = {},
          id = req.params.item;

      itemLib.findItemById(id, function(err, item) {
        if (err) {
          data.message = 'error finding item';
          return res.status(500).json(data);
        }

        if (!item) {
          data.message = 'item not found';
          return res.status(404).json(data);
        }

        if (req.authenticated) {
          if (lib.isAdmin(req.user) || req.user.id === item.owner) {
            item.editable = true;
          }
        }

        data = item;
        res.status(200).json(data);
      });
    }

  // end get options
  },

  post: {

    create: function(req, res) {
    // URI /items
    // protected by middleware:
    //   requireAuthentication
      var data = {},
          item = req.body;

      if (!validate.item.description(item)) {
        // invalid item
        data.message = 'invalid item';
        return res.status(400).json(data);
      }

      itemLib.createItem(req.user.id, item.description, function(err, item) {
        if (err || !item) {
          data.message = 'error creating item';
          return res.status(500).json(data);
        }

        // we don't actually care if activity log update fails,
        // so don't wait for it and don't handle errs in here
        activityLib.createActivity(
          'item-created',
          item,
          true,
          function(err, activity) {
            if (activity) {
              console.log('activity id ' + activity.id + ' logged');
            }
          }
        );

        data = item;
        res.status(200).json(data);
      });
    },

    update: function(req, res) {
    // URI /items/:item
    // protected by middleware:
    //   requireAuthentication
      var data         = {},
          id           = req.params.item,
          updatedItem  = req.body;

      // unlike user updates, need to check item owner against requestor id,
      // so need to find the item first.
      itemLib.findItemById(id, function(err, item) {
        if (err) {
          data.message = 'error finding item';
          return res.status(500).json(data);
        }

        if (!item) {
          data.message = 'item not found';
          return res.status(404).json(data);
        }

        // only allow admins and item owner to update item
        if (lib.isAdmin(req.user) || req.user.id === item.owner) {
          // users can only update item description
          if (!validate.item.description(updatedItem)) {
            data.message = 'invalid item update (description)';
            return res.status(400).json(data);
          } else {
            item.description = updatedItem.description;
          }
          // admins can change ownership and enable / disable items
          if (lib.isAdmin(req.user)) {

            if (!validate.item.enabled(updatedItem)) {
              data.message = 'invalid item update (enabled)';
              return res.status(400).json(data);
            } else {
              item.enabled = updatedItem.enabled;
            }

            if (!validate.item.owner(updatedItem)) {
              data.message = 'invalid item update (owner)';
              return res.status(400).json(data);
            } else {
              item.owner = updatedItem.owner;
            }
          }

          itemLib.updateItem(item, function(err, item_) {
            if (err || !item_) {
              data.message = 'error updating item';
              return res.status(500).json(data);
            }

            //TODO diff item & item_, only fire this if something actually changed
            // we don't actually care if activity log update fails,
            // so don't wait for it and don't handle errs in here
            activityLib.createActivity(
              'item-updated',
              item_,
              true,
              function(err, activity) {
                if (activity) {
                  console.log('activity id ' + activity.id + ' logged');
                }
              }
            );

            // redirect to item URL
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
