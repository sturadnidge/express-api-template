# express-api-template

Express 4 based API skeleton, using JWT and backed by LowDB - clone, cd, npm install and npm start!

Using mount-style architecture for easy collaboration / upgrades / split out to independent microservices.

### CORS
CORS during development can be unnecessarily painful when using things like Postman, so the `mw.allowCors` middleware is commented out by default. You'll need to change the regex in `allowCors()` in `middleware.js` to something meaningful if you actually want to enable CORS anyway, which will involve more than removing the 2 forward slashes in `app.js` to enable the middleware!
