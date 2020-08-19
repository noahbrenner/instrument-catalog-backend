# Instrument Catalog — backend

## Dependencies

- [Node.js](https://nodejs.org/) (and [`npm`](https://www.npmjs.com/get-npm), which is bundled with it)
- [Docker](https://docs.docker.com/get-docker/) (and [Docker Compose](https://docs.docker.com/compose/install/), which you'll need to do separately if you're on Linux)
  - These are only required for development. They're not currently used for production deployment

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

## Commands used for local development

### Docker Compose

- **`$ docker-compose up`** - Start all Docker containers and processes needed during development. This includes hot reloading for both the frontend and backend. It also sets environment variables from your `.env` file inside the containers.
  - The dev server uses [`nodemon`](https://nodemon.io/), so any code changes will be automatically compiled and the server will restart.
  - Existing environment variables override those defined in `.env`. This allows you to easily override them in one-off commands (true for _any_ `docker-compose` command listed here). POSIX example:
    ```bash
    $ PORT=4000 docker-compose up
    ```
- **`$ docker-compose up backend`** - Only start the backend dev server.
- **`$ docker-compose up frontend`** - Only start the frontend dev server. This command isn't often useful by itself, since you could just run the frontend on its own without the overhead of a docker container.

### `npm` scripts

- **`$ npm run lint`** - Report linting issues.
- **`$ npm run lint:fix`** - Automatically fix some linting issue. Right now, this is just running [prettier](https://prettier.io/). Prettier is also run via a git hook when committing changes.
- **`$ npm run test`** - Run the test suite.
- **`$ npm run build`** - Transpile the server code from TypeScript into JavaScript.
- **`$ npm start`** - Run the transpiled server in production mode.
  - The server must be built first, so run `$ npm run build` before this.
  - The `.env` file is _not_ read, so environment variables must be set manually in the production environment. See `template.env` for what values need to be defined. To test locally, you can set variables manually, for example (POSIX): `$ PORT=3000 npm start`
- **`$ npm run start:dev`** - Start the dev server.
  - **You generally shouldn't run this directly.** It's run inside a Docker container when you run `$ docker-compose up`.
