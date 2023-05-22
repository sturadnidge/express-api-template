'use strict';
/* jshint node: true, latedef: nofunc */

// modules
const express = require('express'),
      http    = require('http'),
      mw      = require('./lib/middleware.js'),
      things  = require('./things');

const app = express();

// globals
app.set('port', process.env.PORT || 3000);
app.set('authHeader', 'X-Auth-Token');
app.set('json spaces', 2);

// express variables
app.enable('trust proxy', 'loopback');

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(mw.checkToken);

// mounts
app.use('/things', things);

// routes
app.route('/')
  .get( (req, res) => {
      let data = {};

      req.authenticated ?
        data.message = 'welcome back user ' + req.user.id :
        data.message = 'welcome anonymous user';

      res.status(200).json(data);
  });

// catch all handler
app.route('*')
  .all( (req, res) => {
    let data = {};

    data.message = 'nope. nothing. nada. zip. zilch.';
    res.status(404).json(data);
  });

// go go go!
http.createServer(app).listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app; // for testing
