# Instrument Catalog — backend

![Tests](https://github.com/noahbrenner/instrument-catalog-backend/workflows/Tests/badge.svg)

This is the backend [Express](https://expressjs.com/) API server for [Instrument Catalog](https://github.com/noahbrenner/instrument-catalog-frontend), a React web app for sharing knowledge of musical instruments. The backend uses:

- A [PostgreSQL](https://www.postgresql.org/) database.
- Native SQL queries and migrations via [slonik](https://github.com/mmkal/slonik) (instead of an ORM).
- A development/testing environment using [Docker Compose](https://www.docker.com/).
- Tests using [Jest](https://jestjs.io/) and linting/formatting with [ESlint](https://eslint.org/), [Prettier](https://prettier.io/), and [TypeScript](https://www.typescriptlang.org/), all run via CI.

## Dependencies

- [Node.js](https://nodejs.org/) (and [`npm`](https://www.npmjs.com/get-npm), which is bundled with it)
- [Docker](https://docs.docker.com/get-docker/) (and Docker Compose, which you'll need to [install separately](https://docs.docker.com/compose/install/) if you're on a Linux distro)
  - Docker is only required in development, it's not currently used in production

## Project setup

- Clone the repositories
  - The backend is what you're looking at right now.
  - The frontend can be found here: https://github.com/noahbrenner/instrument-catalog-frontend
  - The front- and back- ends can be developed independently, so you don't _have_ to clone them both, but it's handy for testing.
  ```bash
  # Both repos must be placed in the same parent directory
  $ git clone $BACKEND_REPO_URL
  $ git clone $FRONTEND_REPO_URL
   
  # You should now have the following directory structure
  # (including the directory names, so they'll work with docker-compose)
  # .
  # ├── instrument-catalog-backend
  # └── instrument-catalog-frontend
  ```
- Install `npm` dependencies
  - In place of `$ npm ci`, you could use `$ npm install`. I just recommend `ci` for the initial setup so that the installation runs a little faster and, more importantly, you'll be using the exact package versions defined in `package-lock.json`.
  ```bash
  # If you cloned the frontend too
  $ cd /path/to/instrument-catalog-frontend
  $ npm ci
   
  # Do the same for the backend
  $ cd /path/to/instrument-catalog-backend
  $ npm ci
  ```
- Create `.env` by copying `template.env`
  - The frontend has its own `.env` file, but it isn't needed unless your working on the frontend by itself (without Docker Compose). When you _are_ using Docker Compose, the environment variables for the whole stack can be defined in the backend's `.env`.
  ```bash
  $ cd /path/to/instrument-catalog-backend
  $ cp template.env .env
  # Then edit `.env` as needed
  ```
- Set up the database schema
  - This uses `docker-compose` under the hood, so it may take a while the very first time you run it while Docker downloads the necessary images.
  ```bash
  $ npm run migrate up
  ```

## Commands used for local development

### Docker Compose

- **`$ docker-compose up`** - Start all Docker containers and processes needed during development. This includes the database as well as hot reloading for both the frontend and backend. It also sets environment variables from your `.env` file inside the containers.
  - Existing environment variables that are referenced in `docker-compose.yml` will override those defined in `.env`. This allows you to easily override them in one-off commands (true for _any_ `docker-compose` command listed here). POSIX example:
    ```bash
    $ PORT=4000 docker-compose up
    ```
  - FYI: `npm run start:dev` is run inside the backend container, but you shouldn't ever need to run `start:dev` yourself.
- **`$ docker-compose up backend`** - Only start the backend dev server (and the database, which it depends on).
- **`$ docker-compose stop`** - Stop all containers defined for this project. You'll need to run this even if you use `ctrl-C` to interrupt `docker-compose up`, otherwise the database container may be left running.

### `npm` scripts

- Linting/Testing
  - **`$ npm test`** - Run all tests using [Jest](https://jestjs.io/). The tests are run inside a Docker container.
    - Run tests in watch mode with: **`$ npm test -- --watch`**
  - **`$ npm run lint`** - Run all linters. Each can also be run individually:
    - **`$ npm run lint:lint`** - Lint codebase using [ESlint](https://eslint.org/).
      - Some linting issues can be fixed automatically with: **`$ npm run lint:lint -- --fix`**
    - **`$ npm run lint:types`** - Run static type checking for [TypeScript](https://www.typescriptlang.org/) files.
    - **`$ npm run lint:format`** - Verify that formatting is consistent using [Prettier](https://prettier.io/).
  - **`$ npm run format`** - Reformat code using Prettier.
    - _Prettier is also run (via a git hook) whenever you make a commit._
- Database management
  - Migrations using [@slonik/migrator](https://github.com/mmkal/slonik-tools/tree/master/packages/migrator). See their documentation for more options. For any commands in their documentation, you can replace `node migrate` with `npm run migrate`.
    - **`$ npm run migrate up`** - Ensure that database tables are created and their schemas are up to date.
    - **`$ npm run migrate down`** - Revert the most recently applied migration.
    - **`$ npm run migrate executed`** - Print the migrations that have been applied already.
    - **`$ npm run migrate pending`** - Print the migrations that haven't been applied, but which _will_ be if you run the "up" command.
    - **`$ npm run migrate create <migration-title>`** - Create 2 timestamped migration files using the name you provide, one for "up" in the `migrations/` directory and one for "down" in the `migrations/down/` directory.
      - The files are created on your host machine, but they're written from inside the `backend` Docker container, so depending on your OS the files may have the user/group permissions of the user inside the container. The Docker user is set using the environment variables `UID` and `GID` if they're available, so if you run into file permission issues while editing the files, make sure you export or provide those variables when running this command. For example:
        ```bash
        $ export UID
        $ export GID=$(id -g)
        $ npm run migrate create foo
        ```

## Commands used for production

- **`$ npm run build`** - Transpile the server code from TypeScript into JavaScript.
- **`$ npm start`** - Run the transpiled server in production mode.
  - This executes the compiled JavaScript, so you need to run **`$ npm run build`** first.
  - The server expects to be able to connect to a PostgreSQL database using the value of the `POSTGRES_CONNECTION_STRING` environment variable, so the database must be set up first and the connection string must be provided in the environment.
  - The `.env` file is _not_ read, so environment variables must be set manually on the production server. See `template.env` for what values need to be defined. To test locally, you can set variables manually, for example (POSIX): **`$ PORT=3000 npm start`**
- **`$ npm run migrate:prod <command>`** - Run migrations on a production database.
  - This command and its usage is (almost) identical to `npm run migrate`, including the fact that it executes the underlying command inside a Docker container (so it requires Docker Compose to be installed and it can be run from your local machine). The difference is that you can override the `POSTGRES_CONNECTION_STRING` environment variable, which is otherwise set programmatically in `docker-compose.yml`. In a POSIX terminal, you can do this on one line:
    ```bash
    $ POSTGRES_CONNECTION_STRING=postgresql://foo:bar@baz:1337/buzz npm run migrate:prod up
    ```
