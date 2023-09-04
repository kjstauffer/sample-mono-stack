/* eslint-disable @typescript-eslint/naming-convention */

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  config: {
    addDocBlocks: false,
    enumsAsTypes: true,
    withMutationFn: false,
    withRefetchFn: true,
    scalars: {
      // Dates from the server come in as epoch time.
      Date: `number`,
    },
  },
  generates: {
    './src/graphql/generatedComponents.tsx': {
      schema: [
        {
          'http://localhost:3000/': {
            headers: {
              'gql-codegen-key': process.env.GQL_CODEGEN_KEY ?? ``,
            },
          },
        },
      ],
      documents: `src/**/*.graphql`,
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
            content: `/**\n * THIS FILE IS AUTO-GENERATED. DO NOT EDIT!\n * Run: 'yarn gqlCodegen' to regenerate.\n */\n`,
          },
        },
        `typescript`,
        `typescript-operations`,
        `typescript-react-apollo`,
      ],
    },
    './src/graphql/generatedFragmentMatcher.ts': {
      schema: [
        {
          'http://localhost:3000/': {
            headers: {
              'gql-codegen-key': process.env.GQL_CODEGEN_KEY ?? ``,
            },
          },
        },
      ],
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
            content: `/**\n * THIS FILE IS AUTO-GENERATED. DO NOT EDIT!\n * Run: 'yarn gqlCodegen' to regenerate.\n */\n`,
          },
        },
        `fragment-matcher`,
      ],
    },
  },
};

// eslint-disable-next-line import/no-default-export
export default config;
