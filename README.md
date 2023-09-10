# Sample Monolith Stack

This repo contains a sample setup, including authentication, for a monolith stack for a `development` environment in ESM (CommonJS is used only for the config files, for now). This setup could also be extended to support other environments for deployment (e.g. `staging` and `production`).

## Notes

- This document is still a work-in-progress and may be missing things.

## Stack/Tools

Below is a list of technology used:

- [Node.js](https://nodejs.org/dist/latest-v18.x/docs/api/) - A server-side JavaScript runtime.
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [React.js](https://react.dev/) - The library used to create frontend (UI) components.
- [Apollo GraphQL](https://www.apollographql.com/) - Used to implements the GraphQL API.
- [Express](http://expressjs.com/) - API routing (used to set up the GraphQL endpoint and a single REST authentication endpoint).
- [MySQL](https://www.mysql.com) - The database.
- [Prisma](https://www.prisma.io/) - The database ORM.
- [Emotion](https://emotion.sh) - CSS-in-JS
- [Zod](https://zod.dev/) - Validation
- [Docker](https://www.docker.com/) - Runs various services inside a container.
- [ioredis](https://github.com/redis/ioredis) - Used for caching and sessions.
- [ts-node](https://github.com/TypeStrong/ts-node) - Execute typescript.
- [Babel](https://babeljs.io/) - Transforms code.
- [ESLint](https://eslint.org/) - Static code analyzer to find/fix mistakes & enforce certain conventions.
- [Jest](https://jestjs.io/) - Used for automated testing.
- [webpack](https://webpack.js.org/) - Used to bundle the `client-frontend` package.
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) - Used to generate GraphQL typings and React hooks to query the resolvers.
- [GraphQL Shield](https://the-guild.dev/graphql/shield) - Guards access to the GraphQL schema.
- [Yarn](https://yarnpkg.com/) - Package/Project manager tool.

## Prerequisites

Since this is for a development environment, it's probably best to run it locally or, even better, in a VM. Either way, certain things must be installed/configured before running `yarn docker:dev` (the command to start docker and run the app).

- Install Node.js

  ```sh
  # For Mac
  brew install node@18
  ```

  For other platforms: https://nodejs.org/en/download

- Install MySQL

  This installation is to store persistent data locally. The MySQL service running inside Docker is temporary and only used for automated tests.

  ```sh
  # Install MySQL
  brew install mysql

  # Start MySQL
  brew services start mysql
  ```

  For other platforms: https://dev.mysql.com/doc/refman/8.1/en/installing.html

- Set the `root` database user password as `root`. This can be changed, but keeping it this way should work out of the box.

  ```sh
  # Open the Mysql command prompt
  mysql -u root

  # Enter the following commands at the MySQL command prompt
  ALTER USER 'root'@'localhost' IDENTIFIED BY 'root'; flush privileges; exit;
  ```

- Update `/etc/hosts`.
  Below is a sample of what the file might look like and what needs to be included.

  ```sh
  ##
  # Host Database
  #
  # localhost is used to configure the loopback interface
  # when the system is booting.  Do not change this entry.
  ##

  # ... leave existing mappings in place

  # Add these mappings to the end of the file
  127.0.0.1       host.docker.internal
  127.0.0.1       redis
  127.0.0.1       sample-mono-stack.dev
  ```

  After saving, the DNS cache may need to be flushed:

  ```sh
  # On Mac, run
  sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

  # On Linux
  sudo systemd-resolve --flush-caches
  # or
  sudo systemctl restart NetworkManager
  # or
  sudo resolvectl flush-caches
  # or for dnsmasq
  sudo killall -HUP dnsmasq
  # or
  sudo systemctl restart dnsmasq
  # or for ncsd
  sudo systemctl restart nscd
  # or
  sudo systemctl restart systemd-resolved
  ```

- Install Docker

  ```sh
  # For Mac
  brew install docker
  ```

  For other platforms: https://docs.docker.com/get-docker/

## Installation

- Clone the repo to your projects directory (or wherever you keep repos).

  ```sh
  git clone https://github.com/kjstauffer/sample-mono-stack.git
  ```

- Copy `config/template.local-development.cjs` to `config/local-development.cjs`

  ```sh
  # From the project root, run
  cp config/template.local-development.cjs config/local-development.cjs
  ```

- Update `config/local-development.cjs`

  Replace instances of `A_VERY_LONG_RANDOM_STRING_HERE` with a unique random string. Unique strings can be found here: https://www.grc.com/passwords.htm

- Initialize Prisma (ORM)

  ```sh
  # Run all prisma database migrations (create tables, etc...)
  cd packages/server/frontend
  yarn prisma migrate dev
  ```

- Install yarn's `plugin-workspace-tools`

  ```sh
  # This makes the `yarn workspaces foreach` command available for use in `package.json`.
  yarn plugin import @yarnpkg/plugin-workspace-tools
  ```

## Running

- Start `server-frontend`. This starts the server that controls the REST & GraphQL API endpoints.

  ```sh
  # From the root of the project:

  # Stop docker
  yarn docker-down:dev

  # Start docker
  yarn docker-up:dev

  # Tail docker
  yarn docker-tail:dev

  # Do all of the above in one command.
  yarn docker:dev
  ```

## Troubleshooting

- Run the type checker

  ```sh
  # From the root of the project, run
  yarn typeCheck
  ```

- Run the linter

  ```sh
  # From the root of the project, run
  yarn lint
  ```

- Run tests

  ```sh
  # From the root of the project, run
  yarn jest
  ```
