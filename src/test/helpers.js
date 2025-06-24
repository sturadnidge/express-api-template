import { generateKeyPairSync } from 'crypto';
import jwt from 'jsonwebtoken';

// generate test keys
const keyOpts = { 
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  }
};

const { publicKey, privateKey } = generateKeyPairSync('rsa', keyOpts);

process.env.JWT_VERIFY_KEY = publicKey;

const createJwt = (userId, roles) => {
  const options = {
    algorithm: 'PS256',
    expiresIn: '60s'
  };

  const data = {
    id: userId,
    roles: roles.split(',')
  };

  return jwt.sign(data, privateKey, options);
};

export default {
  createJwt
};