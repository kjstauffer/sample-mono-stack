# Workspace Config for all packages

The config settings in this directory are used throughout the first-party code in the packages. All apps, servers, and shared packages can use them.

They are not used for configuring third-party tools and utilities, like Jest, Webpack, Babel, etc... Those tools will have their own config elsewhere. Typically, at the root of the project or the root of a package's directory.

For details about the `config` package, see: https://github.com/lorenwest/node-config/wiki

## Default

The file `default.cjs` contains the settings that are used in every environment, deployment, and instance. Only settings that are needed everywhere, or that need a safe fallback, should be added to the default config.

## Testing (Jest)

The file `test.cjs` contains the settings that are only used in automated testing (Jest).

## Production

If applicable, the file `production.cjs` contains the settings that are only used in the production environment.

## Local

Local files are only used locally and are not tracked in git. They should be used for local overrides.

`local-development.cjs` is used for overriding local development settings.

Local files for other environments can be created as needed for testing. For example, if some code needs to test how things would work in production, a `local-production.cjs` file can be created and edited as needed.

### Local Templates

Each local file can have a template file to define the useful settings to override locally. The template filename should be the same as the local file name, but with a `template.` prefix. These files should be added to the git repo.

For example, the template file for `local-development.cjs` is `template.local-development.cjs`.

The template file will likely contain "variables" that need to be replaced to make the file useful locally. These variables should be in all capital letters. Things like PORT, HOSTNAME, and DOMAIN are the types of variables to look for and replace.

For a new clone/setup, the template file should be copied to the actual file, then edited as needed.

## React apps

When using these config settings in a React app, Webpack will replace the variables with the actual values as the bundle is generated. So, the file bundle will have the hard coded settings.

In the source code, the config settings are referenced using the `CONFIG` global.

For example:

```javascript
const uri = CONFIG.domain;
```

In order for the `CONFIG` global to be type safe, any settings needed in the React app will need to be added to `src/types/global.d.ts` file that is relative to the app root directory.

Example:

```javascript
declare namespace CONFIG {
  const domain: string;
}
```

Only add the settings that are actually used in the app. The entire config does not need to be in there.

Interfaces should be created for nested config objects.

## Node server daemons and standalone scripts

When using the config settings in node daemons or scripts, the `config` package will need to know how to get to the config files.

### Inside yarn scripts

If the daemon/script is being run from a yarn script, it will look for a `config` directory at the same level as the `package.json` file. This config directory should be a symlink to the root `config` dir.

For example, from the `packages/server/frontend` directory, run:

```sh
ln -s ../../../config
```

This symlink can safely be added to the git repo.

### Standalone node scripts

If standalone node scripts need to run outside of yarn scripts, the `NODE_CONFIG_DIR` environment variable will need to be set to point to the `config` dir. It can either point to the symlinked directory setup in the previous section or to the workspaces' root `config` directory.

Example:

```sh
# From the 'scripts' directory relative to the package, reference the symlink:
NODE_CONFIG_DIR=../config node myScript.js

# or, if you need the env setting to persist, use the full path to the workspace config dir:
export NODE_CONFIG_DIR=~/projects/sample-mono-stack/config
node myScript.js

cd anotherDirectory
node myOtherScript.js
```
