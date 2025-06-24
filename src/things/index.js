import express from 'express';
import lib from './lib.js';
import mw from '../lib/middleware.js';
import things from './things.js';

const app = express.Router();

// params
app.param('thing', (req, res, next) => {
  const data = {};

  data.message = 'invalid thing id';

  if (lib.validate.uuid(req.params.thing)) {
    next();
  } else {
    res.status(400).json(data);
  }
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

export default app;
