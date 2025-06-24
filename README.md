# express-api-template

Express 5 based API skeleton, using JWT and backed by a mock db - clone, cd, npm install and npm start!

Implements a single route `/things`, using a mount-style architecture for easy extension if you're into monoliths.

### Usage

To do anything moderately useful with this template app, an `X-Auth-Token` HTTP header with a JSON Web Token should be sent with each request. A decoded JWT Claims Set should look something like:

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

### Create a JSON Web Token

All create/update/delete operations require a valid JSON Web Token. Whilst it's possible to sign them with symmetric keys, I wouldn't recommend it.

First, create keys to use for signing (private key) and verification (public key). On a *nix based system, run the following:

```shell
# generate a private key
openssl genpkey -algorithm Ed25519 -out private-key.pem

# extract the corresponding public key
openssl pkey -in private-key.pem -pubout -out public-key.pem
```

Then use the following script to output a JWT (first `npm install jsonwebtoken yargs` if you don't have them, and `cat` the private key into a `JWT_SIGNING_KEY` environment variable). Note: This script uses ES modules syntax to match the project configuration:

```javascript
import fs from 'fs';
import jwt from 'jsonwebtoken';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 -i <id> -r <role>[,<role>,...]')
  .demandOption(['i', 'r'])
  .alias('i', 'id')
  .alias('r', 'roles')
  .argv;

const options = {
  algorithm: 'EdDSA',
  expiresIn: '7d'
};

const secret = process.env.JWT_SIGNING_KEY;

const data = {
  id: argv.i,
  roles: argv.r.split(',')
};

const token = jwt.sign(data, secret, options);

console.log(token);

```

Ensure the `JWT_VERIFY_KEY` environment variable is set to the related public key when running the application.

### Use the token

If you `cat` the generated JSON Web Token into a `JWT` environment variable, you can then `curl` requests into the API with `curl -H "X-Auth-Token: $JWT" ... ` (assuming you haven't changed the default auth header configuration in the template app).

### Create a 'thing'

All create/update/delete operations require a valid JSON Web Token, and in the case of creating a 'thing' the only required attribute is a `description` (which must be less than 140 restricted chars... see `lib/validate.js` for details). To do so via curl for example, `curl -H 'Content-Type: application/json' -H "X-Auth-Token: $JWT" -X POST -d '{"description":"Weighted Companion Cube"}' localhost:3000/things`

### Tests

`npm test`
