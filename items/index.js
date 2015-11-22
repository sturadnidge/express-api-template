'use strict';

var express = require('express'),
    mw      = require('../lib/middleware.js'),
    items   = require('./items.js'),
    validate = require('../lib/validate.js');

var app = express.Router();

// params
app.param('item', function(req, res, next) {
  var data = {};
  data.message = 'invalid item id';

  validate.uuid(req.params.item) ?
    next() :
    res.status(400).json(data);
});

// routes

app.route('/')
  .get(items.get.list.all)
  .post(
    mw.requireAuthentication,
    items.post.create
  );

app.route('/:item')
  .delete(
    mw.requireAuthentication,
    items.del.item
  )
  .get(items.get.item)
  .post(
    mw.requireAuthentication,
    items.post.update
  );

module.exports = app;
