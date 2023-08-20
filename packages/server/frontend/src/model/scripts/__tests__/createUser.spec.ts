import cp from 'child_process';
import path from 'path';
import util from 'util';

import { getDirname } from '../../../utils/getDirname.js';

const exec = util.promisify(cp.exec);

const relativeScriptPath = `./src/model/scripts`;

beforeAll(() => {
  const dirName = getDirname();
  const workspaceDir = path.join(dirName, `../../`);
  process.chdir(workspaceDir);
});

describe(`Success Tests`, () => {
  test(`Create`, async () => {
    const { stdout, stderr } = await exec(`yarn script ${relativeScriptPath}/createUser.ts`);

    expect(stdout).toMatch(`User created successfully.`);
    expect(stderr).toBe(``);
  });
});
