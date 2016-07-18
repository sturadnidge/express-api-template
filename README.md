# express-api-template

Express 4 based API skeleton, using JWT and backed by LowDB - clone, cd, npm install and npm start!

Using mount-style architecture for easy collaboration / upgrades / split out to independent microservices.

### CORS
CORS during development can be unnecessarily painful when using things like Postman, so the `mw.allowCors` middleware is commented out by default. You'll need to change the regex in `allowedOrigin` variable in `middleware.js` to something meaningful if you actually want to enable CORS anyway, which will involve more than removing the 2 forward slashes in `app.js` to enable the middleware!

If you do want to test with CORS enabled, here's a `curl` example that will work 'out of the box':

`curl -X POST -H 'Content-Type: application/json' -H 'Origin: http://localhost' -d '{"email":"user@domain.com"}' http://localhost:3000/users`
