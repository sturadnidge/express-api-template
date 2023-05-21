'use strict';
/* jshint node: true, mocha: true, latedef: nofunc */

var app     = require('../app.js'),
    helpers = require('./helpers.js');

var _        = require('lodash'),
    chai     = require('chai'),
    chaiHttp = require('chai-http'),
    uuid     = require('uuid');

var should = chai.should();

var invalidDescription = "This was a triumph." +
                         "I'm making a note here: HUGE SUCCESS." +
                         "It's hard to overstate my satisfaction." +
                         "Aperture Science" +
                         "We do what we must" +
                         "because we can." +
                         "For the good of all of us." +
                         "Except the ones who are dead." +
                         "But there's no sense crying over every mistake." +
                         "You just keep on trying till you run out of cake." +
                         "And the Science gets done." +
                         "And you make a neat gun." +
                         "For the people who are still alive." +
                         "I'm not even angry." +
                         "I'm being so sincere right now." +
                         "Even though you broke my heart." +
                         "And killed me." +
                         "And tore me to pieces." +
                         "And threw every piece into a fire." +
                         "As they burned it hurt because I was so happy for you!" +
                         "Now these points of data make a beautiful line." +
                         "And we're out of beta." +
                         "We're releasing on time." +
                         "So I'm GLaD. I got burned." +
                         "Think of all the things we learned" +
                         "for the people who are still alive." +
                         "Go ahead and leave me." +
                         "I think I prefer to stay inside." +
                         "Maybe you'll find someone else to help you." +
                         "Maybe Black Mesa" +
                         "THAT WAS A JOKE." +
                         "HAHA. FAT CHANCE." +
                         "Anyway, this cake is great." +
                         "It's so delicious and moist." +
                         "Look at me still talking" +
                         "when there's Science to do." +
                         "When I look out there, it makes me GLaD I'm not you." +
                         "I've experiments to run." +
                         "There is research to be done." +
                         "On the people who are still alive." +
                         "And believe me I am still alive." +
                         "I'm doing Science and I'm still alive." +
                         "I feel FANTASTIC and I'm still alive." +
                         "While you're dying I'll be still alive." +
                         "And when you're dead I will be still alive." +
                         "STILL ALIVE";

chai.use(chaiHttp);

describe('Things', function() {

  var createdThingId = ''; // this feels horrible, but I can't see another way

  beforeEach(function(done) {
    // blank database
    done();
  });

  describe('GET /', function() {
    it('should welcome us', function(done) {
      chai.request(app)
          .get('/')
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message');
            res.body.message.should.eql('welcome anonymous user');
            done();
          });
    });
  });

  describe('GET /things', function() {
    it('should GET all things, but there are none', function(done) {
      chai.request(app)
          .get('/things')
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.eql(0);
            done();
          });
    });
  });

  describe('POST /things', function() {
    it('should not create a thing without authenticating', function(done) {
      var thing = {
        description: "Weighted Companion Cube"
      };

      chai.request(app)
          .post('/things')
          .send(thing)
          .end(function(err, res) {
            res.should.have.status(401);
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.message.should.eql('only authenticated requests can attempt that');
            done();
          });
    });
  });

  describe('POST /things', function() {
    it('should create a thing for authenticated user 111', function(done) {
      var token = helpers.createJwt("111", "user");
      var thing = {
        description: "Weighted Companion Cube"
      };

      // even though a POST to /things returns a redirect, chai-http (or rather,
      // superagent) follows them so this all 'just works'
      chai.request(app)
          .post('/things')
          .set(app.get('authHeader'), token)
          .send(thing)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.should.have.property('description');
            res.body.description.should.eql(thing.description);
            res.body.should.have.property('owner');
            res.body.owner.should.eql('111');
            res.body.should.have.property('createdBy');
            res.body.createdBy.should.eql(res.body.owner);
            res.body.should.have.property('createdAt');
            res.body.should.have.property('updatedAt');
            res.body.createdAt.should.eql(res.body.updatedAt);
            res.body.should.not.have.property('secret');
            createdThingId = res.body.id; // I mean, I _really_ can't think of another way...
            done();
          });
    });
  });

  describe('POST /things', function() {
    it('should create a thing for authenticated user 222', function(done) {
      var token = helpers.createJwt("222", "user");
      var thing = {
        description: "Weighted Storage Cube"
      };

      // even though a POST to /things returns a redirect, chai-http (or rather,
      // superagent) follows them so this all 'just works'
      chai.request(app)
          .post('/things')
          .set(app.get('authHeader'), token)
          .send(thing)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.should.have.property('description');
            res.body.description.should.eql(thing.description);
            res.body.should.have.property('owner');
            res.body.owner.should.eql('222');
            res.body.should.have.property('createdBy');
            res.body.createdBy.should.eql(res.body.owner);
            res.body.should.have.property('createdAt');
            res.body.should.have.property('updatedAt');
            res.body.createdAt.should.eql(res.body.updatedAt);
            res.body.should.not.have.property('secret');
            done();
          });
    });
  });

  describe('POST /things', function() {
    it('should not create a thing with a description longer than 140 characters', function(done) {
      var token = helpers.createJwt("111", "user");
      var thing = {
        description: invalidDescription
      };

      chai.request(app)
          .post('/things')
          .set(app.get('authHeader'), token)
          .send(thing)
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.message.should.eql('invalid thing');
            done();
          });
    });
  });

  describe('POST /things', function() {
    it('should not create a thing without a description property', function(done) {
      var token = helpers.createJwt("111", "user");
      var thing = {};

      chai.request(app)
          .post('/things')
          .set(app.get('authHeader'), token)
          .send(thing)
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.message.should.eql('invalid thing');
            done();
          });
    });
  });

  describe('GET /things', function() {
    it('should GET all the things, each thing should have minimal properties', function(done) {

      chai.request(app)
          .get('/things')
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(2);
            res.body.should.have.deep.property('[0].id');
            res.body.should.have.deep.property('[0].description');
            res.body.should.not.have.deep.property('[0].createdAt');
            res.body.should.not.have.deep.property('[0].owner');
            done();
          });
    });
  });

  describe('GET /things/:id', function() {
    it('should return a thing with all properties to an authenticated admin', function(done) {

      var token = helpers.createJwt("888", "admin");

      chai.request(app)
          .get('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.id.should.eql(createdThingId);
            res.body.should.have.property('description');
            res.body.should.have.property('owner');
            res.body.should.have.property('createdAt');
            res.body.should.have.property('updatedAt');
            res.body.createdAt.should.eql(res.body.updatedAt);
            res.body.should.have.property('createdBy');
            res.body.createdBy.should.eql(res.body.owner);
            res.body.should.have.property('secret');
            res.body.secret.should.eql('the cake is a lie.');
            done();
          });
    });
  });

  describe('GET /things/:id', function() {
    it('should return a thing with most properties to the owner', function(done) {

      var token = helpers.createJwt("111", "user");

      chai.request(app)
          .get('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.id.should.eql(createdThingId);
            res.body.should.have.property('description');
            res.body.should.have.property('owner');
            res.body.should.have.property('enabled');
            res.body.should.have.property('createdBy');
            res.body.should.have.property('createdAt');
            res.body.should.have.property('updatedAt');
            res.body.createdAt.should.eql(res.body.updatedAt);
            res.body.should.not.have.property('secret');
            done();
          });
    });
  });

  describe('GET /things/:id', function() {
    it('should return a thing with fewer properties to an authenticated user', function(done) {

      var token = helpers.createJwt("222", "user");

      chai.request(app)
          .get('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.id.should.eql(createdThingId);
            res.body.should.have.property('description');
            res.body.should.have.property('owner');
            res.body.should.have.property('createdAt');
            res.body.should.have.property('updatedAt');
            res.body.createdAt.should.eql(res.body.updatedAt);
            res.body.should.not.have.property('createdBy');
            res.body.should.not.have.property('enabled');
            res.body.should.not.have.property('secret');
            done();
          });
    });
  });

  describe('GET /things/:id', function() {
    it('should return a thing with hardly any properties to an anonymous user', function(done) {

      chai.request(app)
          .get('/things/' + createdThingId)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.id.should.eql(createdThingId);
            res.body.should.have.property('description');
            res.body.should.have.property('createdAt');
            res.body.should.not.have.property('owner');
            res.body.should.not.have.property('enabled');
            res.body.should.not.have.property('updatedAt');
            res.body.should.not.have.property('createdBy');
            res.body.should.not.have.property('secret');
            done();
          });
    });
  });

  describe('GET /things/:id', function() {
    it('should not return a thing that was never created', function(done) {

      chai.request(app)
          .get('/things/' + uuid())
          .end(function(err, res) {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.message.should.eql('thing not found');
            done();
          });
    });
  });

  describe('POST /things/:id', function() {
    it('should not update a thing if not authenticated as the thing owner', function(done) {
      var token = helpers.createJwt("222", "user");
      var updatedThing = {
        description: "Weighted Storage Cube"
      };

      chai.request(app)
          .post('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .send(updatedThing)
          .end(function(err, res) {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.message.should.eql('you are not authorised to do that');
            done();
          });
    });
  });

  describe('POST /things/:id', function() {
    it('should not update a thing with an invalid description if authenticated as the thing owner', function(done) {
      var token = helpers.createJwt("111", "user");
      var updatedThing = {
        description: invalidDescription
      };

      chai.request(app)
          .post('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .send(updatedThing)
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.message.should.eql('invalid update (description)');
            done();
          });
    });
  });

  describe('POST /things/:id', function() {
    it('should update a thing description if authenticated as the thing owner', function(done) {
      var token = helpers.createJwt("111", "user");
      var updatedThing = {
        description: "Weighted Storage Cube"
      };

      // even though a POST to /things returns a redirect, chai-http (or rather,
      // superagent) follows them so this all 'just works'
      chai.request(app)
          .post('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .send(updatedThing)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.should.have.property('description');
            res.body.description.should.eql(updatedThing.description);
            res.body.should.have.property('owner');
            res.body.should.have.property('enabled');
            res.body.should.have.property('createdBy');
            res.body.should.have.property('createdAt');
            res.body.should.have.property('updatedAt');
            res.body.updatedAt.should.not.eql(res.body.createdAt);
            res.body.should.not.have.property('secret');
            done();
          });
    });
  });

  describe('POST /things/:id', function() {
    it('should not update a thing owner even if authenticated as the thing owner', function(done) {
      var token = helpers.createJwt("111", "user");
      var updatedThing = {
        owner: "222"
      };

      // even though a POST to /things returns a redirect, chai-http (or rather,
      // superagent) follows them so this all 'just works'
      chai.request(app)
          .post('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .send(updatedThing)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.should.have.property('description');
            res.body.should.have.property('owner');
            res.body.owner.should.eql('111');
            res.body.should.have.property('enabled');
            res.body.should.have.property('createdBy');
            res.body.should.have.property('createdAt');
            res.body.should.have.property('updatedAt');
            res.body.should.not.have.property('secret');
            done();
          });
    });
  });

  describe('POST /things/:id', function() {
    it('should not disable a thing even if authenticated as the thing owner', function(done) {
      var token = helpers.createJwt("111", "user");
      var updatedThing = {
        enabled: false
      };

      // even though a POST to /things returns a redirect, chai-http (or rather,
      // superagent) follows them so this all 'just works'
      chai.request(app)
          .post('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .send(updatedThing)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.should.have.property('description');
            res.body.should.have.property('owner');
            res.body.owner.should.eql('111');
            res.body.should.have.property('enabled');
            res.body.enabled.should.be.true;
            res.body.should.have.property('createdBy');
            res.body.should.have.property('createdAt');
            res.body.should.have.property('updatedAt');
            res.body.should.not.have.property('secret');
            done();
          });
    });
  });

  describe('POST /things/:id', function() {
    it('should update a thing owner if authenticated as an admin', function(done) {
      var token = helpers.createJwt("888", "admin");
      var updatedThing = {
        owner: "222"
      };

      // even though a POST to /things returns a redirect, chai-http (or rather,
      // superagent) follows them so this all 'just works'
      chai.request(app)
          .post('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .send(updatedThing)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.should.have.property('description');
            res.body.should.have.property('owner');
            res.body.owner.should.eql('222');
            res.body.owner.should.not.eql(res.body.createdBy);
            res.body.should.have.property('createdBy');
            res.body.should.have.property('createdAt');
            res.body.should.have.property('updatedAt');
            res.body.should.have.property('secret');
            done();
          });
    });
  });

  describe('DEL /things/:id', function() {
    it('should delete a thing if authenticated as the owner', function(done) {
      var token = helpers.createJwt("222", "user");

      // even though a POST to /things returns a redirect, chai-http (or rather,
      // superagent) follows them so this all 'just works'
      chai.request(app)
          .delete('/things/' + createdThingId)
          .set(app.get('authHeader'), token)
          .send()
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.message.should.eql('thing deleted');
            done();
          });
    });
  });

  describe('GET /things', function() {
    it('should GET all things, and there is only 1 left', function(done) {
      chai.request(app)
          .get('/things')
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.eql(1);
            done();
          });
    });
  });

});
