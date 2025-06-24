import _ from 'lodash';
import lib from './lib.js';

// note that req.params.thing is validated by express before anything gets this far 

const del = {
  thing: (req, res) => {
    // URI: /things/:thing
    // protected by middleware:
    //   requireAuthentication
    const data = {};
    const { thing: id } = req.params;

    lib.findThingById(id, (err, thing) => {
      if (err) {
        data.message = 'error finding thing';
        return res.status(500).json(data);
      }

      if (!thing) {
        data.message = 'thing not found';
        return res.status(404).json(data);
      }

      // only allow admins or thing owner to delete
      if (lib.hasRole(req.user, 'admin') || lib.isOwner(req.user, thing)) {
        lib.deleteThing(thing, (err) => {
          if (err) {
            data.message = 'error deleting thing';
            return res.status(500).json(data);
          }

          data.message = 'thing deleted';
          res.status(200).json(data);
        });
      } else {
        data.message = 'you are not authorised to do that';
        res.status(403).json(data);
      }
    });
  }
};

const get = {
  list: (req, res) => {
    // URI /things or /things?owner=XXX
    let data = {};

    if (req.query.owner) {
      if (lib.validate.uuid(req.query.owner)) {
        lib.findThingsByOwner(req.query.owner, (err, things) => {
          if (err) {
            data.message = 'error looking up things';
            return res.status(500).json(data);
          }

          if (things) {
            data = _.map(things, _.partialRight(_.pick, ['id', 'owner', 'description']));
          } else {
            data = [];
          }
          res.status(200).json(data);
        });
      } else {
        data.message = 'invalid owner';
        return res.status(400).json(data);
      }
    } else {
      lib.findThings((err, things) => {
        if (err) {
          data.message = 'error looking up things';
          return res.status(500).json(data);
        }

        if (things) {
          data = _.map(things, _.partialRight(_.pick, ['id', 'description']));
        } else {
          data = [];
        }
        res.status(200).json(data);
      });
    }
  },

  thing: (req, res) => {
    // URI /things/:thing
    let data = {};
    const { thing: id } = req.params;

    lib.findThingById(id, (err, thing) => {
      if (err) {
        data.message = 'error finding thing';
        return res.status(500).json(data);
      }

      if (!thing) {
        data.message = 'thing not found';
        return res.status(404).json(data);
      }

      if (req.authenticated) {
        // authenticated users see a subset of data
        data = _.pick(thing, [
          'createdAt', 'description', 'id', 'owner', 'updatedAt'
        ]);

        // owner sees almost everything
        if (lib.isOwner(req.user, thing)) {
          data = _.omit(thing, ['secret']);
        }
        
        // admins see everything
        if (lib.hasRole(req.user, 'admin')) {
          data = thing;
        }

      } else {
        // anonymous users don't see much
        data = _.pick(thing, [
          'createdAt', 'description', 'id'
        ]);
      }

      res.status(200).json(data);
    });
  }
};

const post = {
  create: (req, res) => {
    // URI /things
    // protected by middleware:
    //   requireAuthentication
    const data = {};
    const thing = req.body;

    if (!lib.validate.description(thing)) {
      // invalid thing
      data.message = 'invalid thing';
      return res.status(400).json(data);
    }

    lib.createThing(req.user, thing.description, (err, thing) => {
      if (err || !thing) {
        data.message = 'error creating thing';
        return res.status(500).json(data);
      }

      // redirect to thing URL
      res.redirect(`${req.baseUrl}/${thing.id}`);
    });
  },

  update: (req, res) => {
    // URI /things/:thing
    // protected by middleware:
    //   requireAuthentication
    const data = {};
    const { thing: id } = req.params;
    const updatedThing = req.body;

    // need to check thing owner against requestor id, so need to find the thing first.
    lib.findThingById(id, (err, thing) => {
      if (err) {
        data.message = 'error finding thing';
        return res.status(500).json(data);
      }

      if (!thing) {
        data.message = 'thing not found';
        return res.status(404).json(data);
      }

      // only allow admins and thing owner to update thing
      if (lib.hasRole(req.user, 'admin') || lib.isOwner(req.user, thing)) {

        // users can only update thing description
        if (updatedThing.description) {
          if (lib.validate.description(updatedThing)) {
            thing.description = updatedThing.description;
          } else {
            data.message = 'invalid update (description)';
            return res.status(400).json(data);
          }
        }

        // admins can change ownership and enable / disable things
        if (lib.hasRole(req.user, 'admin')) {
          // key has a boolean value
          if (Object.hasOwn(updatedThing, 'enabled')) {
            thing.enabled = updatedThing.enabled;
          }

          if (updatedThing.owner) {
            thing.owner = updatedThing.owner;
          }
        }

        lib.updateThing(thing, (err, thing_) => {
          if (err || !thing_) {
            data.message = 'error updating thing';
            return res.status(500).json(data);
          }

          // redirect to thing URL
          res.redirect(req.baseUrl + req.path);
        });
      } else {
        data.message = 'you are not authorised to do that';
        res.status(403).json(data);
      }
    });
  }
};

export default {
  del,
  get,
  post
};
