'use strict';

var express  = require('express'),
    auth     = require('./auth.js'),
    validate = require('../lib/validate.js');

var app = express.Router();

// params
app.param('token', function(req, res, next) {
  var data = {};
  data.message = 'invalid login token';

  validate.uuid(req.params.token) ?
    next() :
    res.status(400).json(data);
});

app.route('/login/:token')
  .get(auth.login.token); // so unrestful, but it's coming from an email

module.exports = app;
