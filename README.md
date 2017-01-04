# express-api-template

Express 4 based API skeleton, using JWT and backed by LowDB - clone, cd, npm install and npm start!

Implements a single route `/things`, using a mount-style architecture for easy extension if you're into monoliths.

### Usage

In this template app, a JSON Web Token with at least the following in the payload is expected:

```json
{
  "id":"an-id-representing-the-token-owner",
  "roles": [
    "an",
    "array",
    "of",
    "roles"
  ]
}
```

The template app makes some decisions based on whether the `admin` role is present or not, in both read and write operations. For example, `GET`ing a `thing` will only return all attributes of the thing if you are an `admin`.

### Create a usable JSON Web Token

All create/update/delete operations require a valid JSON Web Token, The following script will output one. First `npm install jsonwebtoken yargs` and obviously ensure `options.algorithm` and the `secret` used for signing are the same as what is used for verification in the app (as is the case below, compare it to the `checkToken` function in `lib/middleware.js`).

```javascript
'use strict';

var jwt = require('jsonwebtoken');

var argv = require('yargs')
  .usage('Usage: $0 -i <id> -r <role>[,<role>,...]')
  .demand(['i', 'r'])
  .alias('i', 'id')
  .alias('r', 'roles')
  .argv;

// assumes the secret is a string, not a private key
var options = {
  algorithm: 'HS256',
  expiresIn: '7d'
};

var secret = process.env.JWT_SECRET || 'sshhh - it\'s a secret!'

var data = {
  id: argv.i,
  roles: argv.r.split(',')
};

var jot = jwt.sign(data, secret, options);

console.log(jot);

```

If you saved that output in an environment variable `$JWT`, you could then curl requests into the API with `curl -H "X-Auth-Token: $JWT" ... ` (assuming you have configured the app to look for tokens in the `X-Auth-Token` header, as is the case in the template app).

### Create a 'thing'
All create/update/delete operations require a valid JSON Web Token, and in the case of creating a 'thing' the only required attribute is a `description`. To do so via curl for example, `curl -H 'Content-Type: application/json' -H "X-Auth-Token: $JWT" -X POST -d '{"description":"Weighted Companion Cube"}' localhost:3000/things`
