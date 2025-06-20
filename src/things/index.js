'use strict';
/* jshint node: true, latedef: nofunc */

const express = require('express'),
      lib     = require('./lib.js'),
      mw      = require('../lib/middleware.js'),
      things  = require('./things.js');

const app = express.Router();

// params
app.param('thing', (req, res, next) => {
  let data = {};

  data.message = 'invalid thing id';

  lib.validate.uuid(req.params.thing) ? next() : res.status(400).json(data);
});

// routes

app.route('/')
  .get(things.get.list)
  .post(
    mw.requireAuthentication,
    things.post.create
  );

app.route('/:thing')
  .delete(
    mw.requireAuthentication,
    things.del.thing
  )
  .get(things.get.thing)
  .post(
    mw.requireAuthentication,
    things.post.update
  );

module.exports = app;
