import crypto, { type BinaryLike } from 'crypto';

import { jest } from '@jest/globals';

import {
  compareHash,
  decrypt,
  encrypt,
  encryptPassword,
  generateEncryptionKey,
  generateHash,
} from '../crypt.js';

const authKey = `mockAuthKey`;

afterEach(() => {
  jest.restoreAllMocks();
});

describe(`Error Tests`, () => {
  test(`Hash generation - scrypt error`, async () => {
    jest.spyOn(crypto, `scrypt`).mockImplementation(
      /* TS is expecting 5 args, but only 4 are required in this case. */
      // @ts-expect-error
      (
        _pw: BinaryLike,
        _salt: BinaryLike,
        _keyLen: number,
        cb: (err: Error | null, derivedKey: Buffer) => void,
      ) => {
        cb(new Error(`mockScryptError`), Buffer.from(`mockDerivedKey`));
      },
    );

    await expect(generateHash(`someString`)).rejects.toThrow(`mockScryptError`);
  });

  test(`Hash comparison - scrypt error`, async () => {
    jest.spyOn(crypto, `scrypt`).mockImplementation(
      /* TS is expecting 5 args, but only 4 are required in this case. */
      // @ts-expect-error
      (
        _pw: BinaryLike,
        _salt: BinaryLike,
        _keyLen: number,
        cb: (err: Error | null, derivedKey: Buffer) => void,
      ) => {
        cb(new Error(`mockScryptError`), Buffer.from(`mockDerivedKey`));
      },
    );

    await expect(compareHash(`someString`, `some.Hash`)).rejects.toThrow(`mockScryptError`);
  });
});

describe(`Success Tests`, () => {
  test(`Encrypt`, () => {
    const payload = { id: 8675309 };
    const encrypted = encrypt(authKey, JSON.stringify(payload));

    expect(encrypted).toHaveProperty(`encrypted`);
    expect(encrypted).toHaveProperty(`salt`);
    expect(encrypted).toHaveProperty(`iv`);
    expect(encrypted.encrypted).not.toEqual(JSON.stringify(payload));
  });

  test(`Decrypt`, () => {
    const payload = { id: 8675309 };
    const encrypted = encrypt(authKey, JSON.stringify(payload));
    const decrypted = decrypt(authKey, encrypted.encrypted, encrypted.salt, encrypted.iv);

    expect(decrypted).toEqual(JSON.stringify(payload));
  });

  test(`Generate encryption key`, () => {
    const key = generateEncryptionKey();
    expect(key).toHaveLength(32);
  });

  test(`Encrypt password`, async () => {
    const password = `abc123`;
    const encrypted1 = await encryptPassword(password);
    const encrypted2 = await encryptPassword(password);
    const encrypted3 = await encryptPassword(``);

    expect(encrypted1).not.toEqual(password);
    expect(encrypted2).not.toEqual(password);
    expect(encrypted3).toBeUndefined();

    /* Hashed passwords should be different due to random salt. */
    expect(encrypted1).not.toEqual(encrypted2);
  });

  test(`Compare hashed password`, async () => {
    const password = `abc123`;
    const encrypted = await encryptPassword(password);

    if (!encrypted) {
      throw new Error(`Failed to encrypt password.`);
    }

    const isHashEqualToPassword = await compareHash(password, encrypted);

    expect(isHashEqualToPassword).toBe(true);
  });
});
