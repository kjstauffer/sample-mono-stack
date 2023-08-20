import crypto from 'crypto';

import { nanoid } from 'nanoid';

export type EncryptedPayload = {
  encrypted: string;
  salt: string;
  iv: string;
};

const ALGORITHM = `aes-256-cbc`;
const KEYLEN = 32;
const INPUT_ENCODING = `hex`;
const OUTPUT_ENCODING = `utf8`;

/**
 * Provides AES-256-CBC data decryption
 * @param encrypted encrypted string
 * @param salt salted value used to create encryption key
 * @param iv initialization value used to encrypt data
 */
const decrypt = (cryptKey: string, encrypted: string, salt: string, iv: string) => {
  const saltBuffer = Buffer.from(salt, INPUT_ENCODING);
  const ivBuffer = Buffer.from(iv, INPUT_ENCODING);

  const key = crypto.scryptSync(cryptKey, saltBuffer, KEYLEN);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);

  const decrypted =
    decipher.update(encrypted, INPUT_ENCODING, OUTPUT_ENCODING) + decipher.final(OUTPUT_ENCODING);

  return decrypted;
};

/**
 * Provides AES-256-CBC data encryption
 * @param cryptKey a key to use for the encryption
 * @param decrypted the value to encrypt
 */
const encrypt = (cryptKey: string, decrypted: string): EncryptedPayload => {
  const saltBuffer = crypto.randomBytes(32);
  const ivBuffer = crypto.randomBytes(16);

  const key = crypto.scryptSync(cryptKey, saltBuffer, KEYLEN);
  const cipher = crypto.createCipheriv(ALGORITHM, key, ivBuffer);

  let encrypted = ``;

  encrypted =
    cipher.update(decrypted, OUTPUT_ENCODING, INPUT_ENCODING) + cipher.final(INPUT_ENCODING);

  return {
    encrypted,
    salt: saltBuffer.toString(INPUT_ENCODING),
    iv: ivBuffer.toString(INPUT_ENCODING),
  };
};

/**
 * Generate a hash of a password/secret using scrypt.
 * @param password a password or secret to hash
 */
const generateHash = async (password: string) => {
  return new Promise<string>((resolve, reject) => {
    /* Generate random KEYLEN bytes long salt */
    const salt = crypto.randomBytes(KEYLEN).toString(`hex`);

    crypto.scrypt(password, salt, KEYLEN, (err, derivedKey) => {
      if (err) {
        reject(err);
      }

      resolve(`${salt}.${derivedKey.toString(`hex`)}`);
    });
  });
};

/**
 * Compare a plain-text password with a salted password.
 * @param password the plain-text password to compare against
 * @param hash the salted hash to compare against the password.
 */
const compareHash = async (password: string, hash: string) => {
  return new Promise<boolean>((resolve, reject) => {
    const [salt, hashKey] = hash.split(`.`);

    /* Convert `hashKey` to Buffer to use with `timingSafeEqual`. */
    const hashKeyBuff = Buffer.from(hashKey, `hex`);

    crypto.scrypt(password, salt, KEYLEN, (err, derivedKey) => {
      if (err) {
        reject(err);
      }

      /* Compare `password` with the hashed password using `timeSafeEqual`. */
      resolve(crypto.timingSafeEqual(hashKeyBuff, derivedKey));
    });
  });
};

/**
 * Generate a random unique 32-character string.
 */
const generateEncryptionKey = () => {
  return crypto.createHmac(`sha256`, nanoid()).digest(`hex`).slice(0, 32);
};

/**
 * Helper function to generate a hash of a password/secret using scrypt.
 * @param password
 */
const encryptPassword = (password: string) => {
  if (!password) {
    return;
  }

  return generateHash(password);
};

export {
  decrypt,
  encrypt,
  generateEncryptionKey,
  encryptPassword,
  generateHash,
  compareHash,
  ALGORITHM,
  KEYLEN,
  INPUT_ENCODING,
  OUTPUT_ENCODING,
};
