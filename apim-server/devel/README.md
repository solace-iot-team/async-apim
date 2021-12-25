# APIM Server Development

## Setup (MacOS)

````bash
brew search node
brew install node@16
````

### Link / Unlink
````bash
brew unlink node
brew link node@14
````
## Build & Run
````bash
npm install
npm run build
npm start
# or
npm run start:pretty
````

## Development Build & Run
### Devel Build
````bash
npm install
````
````bash
# NOTE:
# - builds open api types for server
# - builds node open api package for client
# - about.json
npm run dev:build
````
### Lint
````bash
npm run lint
````

## Adding/Changing an API Resource
- edit `server/common/api.yml`
- dev build, compile, lint
  ````bash
  npm run dev:build
  npm run compile
  npm run lint
  ````
- implement a new service in `server/api/services`
- implement a new controller in `server/api/controllers`
- add new routes in `server/api/controllers`
- add new router to `server/routes.ts`
- add new initialize call to `index.ts`
- implement a new test in `test`
- run tests

### MongoDB
### Start Mongo in Docker Container

````bash
vi mongodb/start.mongo.sh
# check the port number mapped and adjust / align with env for apim-server
````

````bash
# start
mongodb/start.mongo.sh
# login
docker exec -it apim-devel-server-mongodb bash
# docker logs
docker logs apim-devel-server-mongodb
````

### Stop Mongo Docker Container
````bash
mongodb/stop.mongo.sh
````


### Start Devel Server
````bash
npm run dev
````

## Tests

### Set Test Env
````bash
vi test/source.env.sh
# adjust the settings for openapi & inline tests
````
### Run All Tests
````bash
npm run dev:build
npm test
# with pretty print server output:
npm run test:pretty
````

### Run a Single Test
````bash
# set the env
source ./test/source.env.sh
# run test
# for example:
npx mocha --config test/.mocharc.yml test/apsUsers.inline.spec.ts
# pretty print server output:
npx mocha --config test/.mocharc.yml test/apsUsers.inline.spec.ts | npx pino-pretty
# unset the env
unset_source_env
````

---
