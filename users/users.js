'use strict';

var _           = require('lodash'),
    activityLib = require('../activity/lib.js'),
    lib         = require('../lib/express-api-template.js'),
    userLib     = require('./lib.js'),
    validate    = require('../lib/validate.js');

module.exports = {

  del: {

    profile: function(req, res) {
    // URI: /users/:user
    // protected by middleware:
    //   requireAuthentication
      var data = {},
          id = req.params.user;

      // only allow admins or profile owner to delete
      // all DELETEs are authenticated so can do this up front
      if (lib.hasRole(req.user, 'admin') || req.user.id === id) {

        userLib.findUserById(id, function(err, user) {
          if (err) {
            data.message = 'error looking up user';
            return res.status(500).json(data);
          }

          if (!user) {
            data.message = 'user not found';
            return res.status(404).json(data);
          }

          userLib.deleteUser(user, function(err) {
            if (err) {
              data.message = 'error deleting user';
              return res.status(500).json(data);
            }

            // we don't actually care if activity log update fails,
            // so don't wait for it and don't handle errs in here
            activityLib.createActivity(
              'user-deleted',
              _.pick(user, ['id']),
              false, // don't broadcast to the world
              function(err, activity) {
                if (activity) {
                  console.log('activity id ' + activity.id + ' logged');
                }
              }
            );

            data.message = 'user deleted';
            res.status(200).json(data);
          });
        });
      } else {
        data.message = 'you are not authorised to do that';
        res.status(403).json(data);
      }
    }

  // end delete options
  },

  get: {

    email: function(req, res) {
    // URI: /users/:user/email?verify=:token
    // protected by middleware:
    //   requireAuthentication

      // only accessed via an email sent as a result of a profile update,
      // so has to be a GET even though it's not idempotent
      var data = {},
          id = req.params.user;

      userLib.findUserById(id, function(err, user) {
        if (err) {
          data.message = 'error looking up user';
          return res.status(500).json(data);
        }

        if (!user) {
          data.message = 'user not found';
          return res.status(404).json(data);
        }

        if (!lib.validate.uuid(req.query.verify)) {
          data.message = 'invalid verification token';
          return res.status(400).json(data);
        }

        // updates only apply to users own profile
        if (req.user.id === user.id) {
          if (lib.checkExists(user.email.verify)) {
            if (lib.checkEquals(req.query.verify, user.email.verify)) {
              // update email
              user.email.current = user.email.pending;
              user.email.pending = null;
              // don't need verify anymore
              delete user.email.verify;

              userLib.updateUser(user, function(err, user_) {
                if (err || !user_) {
                  data.message = 'error updating user';
                  return res.status(500).json(data);
                }
                // send back to profile
                res.redirect('..');
              });
            }
          }
          // if we got here, the verify token was invalid or didn't exist
          // send to user profile, dont give up info as to what happened
          // in case requestor is malicious
          res.redirect('..');
        } else {
          data.message = 'you are not authorised to do that';
          res.status(403).json(data);
        }
      });

    },

    profile: function(req, res) {
    // URI: /users/:user
      var data = {};

      userLib.findUserById(req.params.user, function(err, user) {
        if (err) {
          data.message = 'error looking up user';
          return res.status(500).json(data);
        }

        if (!user) {
          data.message = 'user not found';
          return res.status(404).json(data);
        }

        // only return full info if own user profile
        if (req.authenticated && (req.user.id === user.id)) {
          data = _.omit(user, ['auth']);
        } else {
          data = _.pick(user, ['id', 'cat']);
        }

        res.status(200).json(data);
      });
    }

  // end get options
  },

  post: {

    logup: function(req, res) {
    // URI: /users
      var data = {},
          body = req.body,
          token = lib.createUUID();

      if (!validate.user.email(body)) {
        // invalid email address
        data.message = 'invalid email address';
        return res.status(400).json(data);
      }

      userLib.findUserByEmail(body.email, function(err, user) {
        if (err) {
          data.message = 'error looking up user';
          return res.status(500).json(data);
        }

        if (user) {
          // returning user
          userLib.updateAuthToken(user, token, function(err, user_) {
            if (err || !user_) {
              data.message = 'error updating user';
              return res.status(500).json(data);
            }

            lib.sendAuthEmail(user_.email.current, token, function(err, result) {
              if (err) {
                data.message = 'error sending auth mail';
                return res.status(500).json(data);
              }

              data.message = 'check your mail for a login link';
              res.status(200).json(data);
            });
          });
        } else {
          // create new user
          userLib.createUser(body, token, function(err, user_) {
            if (err || !user_) {
              data.message = 'error creating new user';
              return res.status(500).json(data);
            }

            // we don't actually care if activity log update fails,
            // so don't wait for it and don't handle errs in here
            activityLib.createActivity(
              'user-created',
              _.pick(user_, ['id']),
              true,
              function(err, activity) {
                if (activity) {
                  console.log('activity id ' + activity.id + ' logged');
                }
              }
            );

            lib.sendAuthEmail(user_.email.current, token, function(err, result) {
              if (err) {
                data.message = 'error sending auth mail';
                return res.status(500).json(data);
              }

              data.message = 'check your mail for a login link';
              res.status(202).json(data);
            });
          });
        }
      });

    },

    profile: function(req, res) {
    // URI: /users/:user
    // protected by middleware:
    //   requireAuthentication
      var data        = {},
          id          = req.params.user,
          updatedUser = req.body;

      // only allow admins and profile owner update profile
      // all POSTs are authenticated so can do this up front
      if (lib.hasRole(req.user, 'admin') || req.user.id === id) {

        userLib.findUserById(id, function(err, user) {
          if (err) {
            data.message = 'error looking up user';
            return res.status(500).json(data);
          }

          if (!user) {
            data.message = 'user not found';
            return res.status(404).json(data);
          }

          // users can only update email address
          if (!validate.user.email(updatedUser)) {
            // invalid email address
            data.message = 'invalid user update (email)';
            return res.status(400).json(data);
          } else {
            if (lib.checkEquals(user.email.current, updatedUser.email)) {
              // if email addresses are the same, some other update is happening
              // ... blat email.pending and email.verify for good measure
              user.email.pending = null;
              if (user.email.verify) {
                delete user.email.verify;
              }
            } else {
              user.email.pending = updatedUser.email;
              user.email.verify = lib.createUUID();
            }
          }
          // only admins can change user roles and enable / disable users
          if (lib.hasRole(req.user, 'admin')) {

            if (!validate.user.enabled(updatedUser)) {
              data.message = 'invalid user update (enabled)';
              return res.status(400).json(data);
            } else {
              user.enabled = updatedUser.enabled;
            }

            if (!validate.user.roles(updatedUser)) {
              data.message = 'invalid user update (roles)';
              return res.status(400).json(data);
            } else {
              user.roles = updatedUser.roles;
            }
          }

          userLib.updateUser(user, function(err, user_) {
            if (err || !user_) {
              data.message = 'error updating user';
              return res.status(500).json(data);
            }

            //TODO diff user & user_, only fire this if something changed
            // we don't actually care if activity log update fails,
            // so don't wait for it and don't handle errs in here
            activityLib.createActivity(
              'user-updated',
              _.pick(user_, ['id']),
              true,
              function(err, activity) {
                if (activity) {
                  console.log('activity id ' + activity.id + ' logged');
                }
              }
            );

            // if it's an email update, we need to do stuff
            if (lib.checkExists(user_.email.verify)) {
              lib.sendVerificationEmail(
                user_.email.current,
                user_.email.verify,
                function(err, result) {
                  if (err || !result) {
                    data.message = 'error sending verification mail';
                    return res.status(500).json(data);
                  }

                  data.message = 'check your mail for a verification link';
                  res.status(202).json(data);
                }
              );
            } else {
              // go to profile URL
              res.redirect(req.baseUrl + req.path);
            }

          });
        });
      } else {
        data.message = 'you are not authorised to do that';
        res.status(403).json(data);
      }
    }

  // end post options
  }

// end exports
};

// private
