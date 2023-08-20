/* eslint-disable @typescript-eslint/naming-convention */

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: `./src/graphql/public/schema.ts`,
  generates: {
    './src/graphql/public/generatedTypes.ts': {
      config: {
        useIndexSignature: true,
        contextType: `../../types.ts#ApiServerContext`,
      },
      plugins: [
        {
          add: {
            content: `/* eslint-disable */`,
          },
        },
        {
          add: {
            content: `/* istanbul ignore file */\n`,
          },
        },
        {
          add: {
            content: `// @ts-nocheck\n`,
          },
        },
        {
          add: {
            content: `/**\n * THIS FILE IS AUTO-GENERATED. DO NOT EDIT!\n * Run: 'yarn gqlCodegen' to regenerate.\n */\n`,
          },
        },
        `typescript`,
        `typescript-resolvers`,
      ],
    },
  },
  require: [`ts-node/esm`, `ts-node/register`],
};

// eslint-disable-next-line import/no-default-export
export default config;
