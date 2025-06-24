import express from 'express';
import { createServer } from 'http';
import mw from './lib/middleware.js';
import things from './things/index.js';

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
  .get((req, res) => {
    const data = {};

    if (req.authenticated) {
      data.message = `welcome back user ${req.user.id}`;
    } else {
      data.message = 'welcome anonymous user';
    }

    res.status(200).json(data);
  });

// catch all handler
app.route('/*splat')
  .all((req, res) => {
    const data = {};

    data.message = 'nope. nothing. nada. zip. zilch.';
    res.status(404).json(data);
  });

// go go go!
createServer(app).listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`);
});

export default app; // for testing
