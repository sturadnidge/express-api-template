'use strict';

var express  = require('express'),
    mw       = require('../lib/middleware.js'),
    users    = require('./users.js'),
    validate = require('../lib/validate.js');

var app = express.Router();

// params
app.param('user', function(req, res, next) {
  var data = {};
  data.message = 'invalid user id';

  validate.uuid(req.params.user) ?
    next() :
    res.status(400).json(data);
});

// routes

app.route('/')
  .get(
    function(req, res) {
      var data = {};

      data.message = 'nuh-uh-uh!';
      res.status(403).json(data);
  })
  .post(users.post.logup);

app.route('/:user')
  .delete(
    mw.requireAuthentication,
    users.del.profile
  )
  .get(users.get.profile)
  .post(
    mw.requireAuthentication,
    users.post.profile
  );

app.route('/:user/email')
  .get(
    mw.requireAuthentication,
    users.get.email
  );

module.exports = app;
