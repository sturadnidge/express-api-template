'use strict';
// express-api-template

// modules
var bodyParser = require('body-parser'),
    express    = require('express'),
    http       = require('http'),
// internal requires
    activity   = require('./activity'),
    auth       = require('./auth'),
    items      = require('./items'),
    mw         = require('./lib/middleware.js'),
    users      = require('./users');

var app = express();

// globals
app.set('port', process.env.NODE_PORT || 3000);
app.set('jwtSecret', process.env.JWT_SECRET || 'sshhh - it\'s a secret!');
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
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(mw.checkAuthToken);
//app.use(mw.allowCors);

// mounts
app.use('/auth', auth);
app.use('/activity', activity);
app.use('/items', items);
app.use('/users', users);

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
