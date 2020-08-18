# Instrument Catalog — backend

## Dependencies

- [Node.js](https://nodejs.org/) (and [`npm`](https://www.npmjs.com/get-npm), which is bundled with it)
- [Docker](https://docs.docker.com/get-docker/) (and [Docker Compose](https://docs.docker.com/compose/install/), which you'll need to do separately if you're on Linux)
  - These are only required for development. They're not currently used for production deployment

## Project setup

- Clone the repository
  ```bash
  $ git clone $REPO_URL
  $ cd /path/to/instrument-catalog-backend
  ```
- Install `npm` dependencies
  ```bash
  # Use *one* of the following:
  $ npm ci      # Either exact versions from package-lock.json
  $ npm install # Or recalculate the dependency tree using package.json
  ```
- Create `.env` file from `template.env`
  ```bash
  $ cp template.env .env
  # Then edit as needed...
  ```

## Commands used for local development

### Docker

- **`$ docker-compose up`** - Start the dev server. This includes hot reloading and sets environment variables from your `.env` file.
  - The dev server uses [nodemon](https://nodemon.io/), so any code changes will be automatically compiled and the server will restart.
  - Existing environment variables override those in `.env`, so you can easily override them in one-off commands. This applies to _any_ `docker-compose` command listed here. POSIX example:
    ```bash
    $ PORT=4000 docker-compose up
    ```

### `npm`

- **`$ npm run lint`** - Report linting issues.
- **`$ npm run lint:fix`** - Automatically fix some linting issue. Right now, this is just running [prettier](https://prettier.io/). Prettier is also run via a git hook when committing changes.
- **`$ npm run test`** - Run the test suite.
- **`$ npm run build`** - Transpile the server code from TypeScript into JavaScript.
- **`$ npm start`** - Run the transpiled server in production mode.
  - The server must be built first, so run `$ npm run build` before this.
  - The `.env` file is _not_ read, so environment variables must be set manually in the production environment. See `template.env` for what values need to be defined. To test locally, you can set variables manually, for example (POSIX): `$ PORT=3000 npm start`
- **`$ npm start:dev`** - Start the dev server.
  - **You generally shouldn't run this directly.** It's run inside a Docker container when you run `$ docker-compose up`.
