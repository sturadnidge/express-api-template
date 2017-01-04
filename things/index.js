'use strict';
/* jshint node: true, latedef: nofunc */

var express = require('express'),
    lib     = require('../lib'),
    things  = require('./things.js');

var app = express.Router();

// params
app.param('thing', function(req, res, next) {
  var data = {};
  data.message = 'invalid thing id';

  lib.validate.uuid(req.params.thing) ? next() : res.status(400).json(data);
});

// routes

app.route('/')
  .get(things.get.list.all)
  .post(
    lib.mw.requireAuthentication,
    things.post.create
  );

app.route('/:thing')
  .delete(
    lib.mw.requireAuthentication,
    things.del.thing
  )
  .get(things.get.thing)
  .post(
    lib.mw.requireAuthentication,
    things.post.update
  );

module.exports = app;
