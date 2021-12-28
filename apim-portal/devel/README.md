# APIM Portal Development

## Standup APIM Connector System

````bash
apim-connector-system/start.system.sh
````
- Check the [docker.compose.yml](./docker.compose.yml) for ports / credentials, etc.
- [Connector username/password](./apim-connector-system/docker-volumes/apim-connector/organization_users.json).

Stop:
````bash
apim-connector-system/stop.system.sh
````

## Start Devel Portal
````bash
npm install
npm run dev:build
````
````bash
# start portal with react script
npm start
````
## Build & Start Prod Portal
````bash
npm run dev:build # if not up to date already
npm run build
npm install -g serve
serve -s build
````

<!-- ## Using APIM Server OpenAPI from Local Release
````bash
cd async-apim/release/apim-server-openapi/apim-server-openapi-browser
# create link in global node_modules
npm link
````

### Link APIM Server OpenAPI from Global
````bash
cd async-apim/apim-portal
npm link @solace-iot-team/apim-server-openapi-browser
````

### Re-build APIM Server OpenApi
e.g. after changes to the OpenAPI Spec.
````bash
cd async-apim/release/apim-server-openapi
npm run build
# NOTE: no need to re-link
````

### UnLink APIM Server OpenAPI from Global
````bash
cd async-apim/apim-portal
npm unlink --no-save @solace-iot-team/apim-server-openapi-browser
# NOTE: now install the released package
npm install
```` -->

## Using Connector OpenAPI from Local Release

### Build Connector OpenAPI for Browser
````bash
cd platform-api/release/apim-connector-openapi-browser
````
````bash
npm install
````
````bash
npm run updateVersion
````
````bash
npm run prepublishOnly
````

### Link Connector OpenAPI to Global
````bash
# NOTE: in platform-api/release/apim-connector-openapi-browser
npm link # creates link in global node_modules
````

### Link Connector OpenAPI from Global
````bash
cd aysnc-apim/apim-portal
````
````bash
npm link @solace-iot-team/apim-connector-openapi-browser
````
### UnLink Connector OpenAPI from Global
````bash
# NOTE: in apim-portal
npm unlink --no-save @solace-iot-team/apim-connector-openapi-browser
# NOTE: now install the released package
npm install
````

---
