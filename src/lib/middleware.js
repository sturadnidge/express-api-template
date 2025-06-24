import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const jwtVerify = promisify(jwt.verify);

const checkToken = async (req, res, next) => {
  const data = {};

  const token = req.get(req.app.get('authHeader'));
  
  if (!token) {
    // no token, flag as unauthenticated
    req.authenticated = false;
    return next();
  }

  try {
    const options = {
      algorithms: ['PS256']
    };

    const decoded = await jwtVerify(token, process.env.JWT_VERIFY_KEY, options);
    req.authenticated = true;
    req.user = decoded;
    next();
  } catch (err) {
    data.message = 'cannot verify authenication token';
    res.status(400).json(data);
  }
};

const requireAuthentication = (req, res, next) => {
  const data = {};

  data.message = 'only authenticated requests can attempt that';
  if (req.authenticated) {
    next();
  } else {
    res.status(401).json(data);
  }
};

// private

if (!process.env.JWT_VERIFY_KEY) {
  console.log('JWT_VERIFY_KEY environment variable not set, exiting\n');
  process.exit(1);
}

export default {
  checkToken,
  requireAuthentication
};
