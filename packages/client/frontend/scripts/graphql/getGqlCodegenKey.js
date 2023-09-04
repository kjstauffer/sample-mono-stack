/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import config from 'config';

const key = config.get(`gqlCodegenKey`);

console.log(key);
