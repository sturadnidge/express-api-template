'use strict';
/* jshint node: true, latedef: nofunc */

// modules
var bodyParser = require('body-parser'),
    express    = require('express'),
    http       = require('http'),
// internal requires
    things      = require('./things'),
    mw         = require('./lib/middleware.js');

var app = express();

// globals
app.set('port', process.env.PORT || 3000);
app.set('authHeader', 'X-Auth-Token');
app.set('json spaces', 2);

// express variables
app.enable('trust proxy');
// custom powered by
app.use(function(req, res, next) {
  res.setHeader('X-Powered-By','something something something dark side');
  next();
});

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(mw.checkToken);

// mounts
app.use('/things', things);

// routes
app.route('/')
  .get(
    function (req, res) {
      var data = {};

      req.authenticated ?
        data.message = 'welcome back user ' + req.user.id :
        data.message = 'welcome anonymous user';

      res.status(200).json(data);
  });

// catch all handler
app.route('*')
  .all(function(req, res) {
    var data = {};

    data.message = 'nope. nothing. nada. zip. zilch.';
    res.status(404).json(data);
  });

// go go go!
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app; // for testing
