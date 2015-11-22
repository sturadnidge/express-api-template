'use strict';

var express  = require('express'),
    activity = require('./activity.js'),
    validate = require('../lib/validate.js');

var app = express.Router();

// params
app.param('record', function(req, res, next) {
  var data = {};
  data.message = 'invalid activity id';

  validate.uuid(req.params.id) ?
    next() :
    res.status(400).json(data);
});

// routes

app.route('/')
  .get(activity.get.list.recent);

app.route('/:record')
  .get(activity.get.record);

module.exports = app;
