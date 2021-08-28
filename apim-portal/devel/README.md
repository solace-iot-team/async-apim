# APIM Portal Development

## Standup APIM Connector System

````bash
apim-connector-system/start.system.sh
````

[Lookup username/password here](./apim-connector-system/docker-volumes/apim-connector/organization_users.json).

Stop:
````bash
apim-connector-system/stop.system.sh
````

## APIM Server OpenAPI from Local Release
````bash
cd async-apim/release/apim-server-openapi-browser
# create link in global node_modules
npm link
````

### Link APIM Server OpenAPI from Global
````bash
cd async-apim/admin-portal
npm link @solace-iot-team/apim-server-openapi-browser
````

### Re-build APIM Server OpenApi
e.g. after changes to the OpenAPI Spec.
````bash
cd async-apim/release/apim-server-openapi-browser
npm run build
# NOTE: no need to re-link
````

### UnLink APIM Server OpenAPI from Global
````bash
cd apim-portal/admin-portal
npm unlink --no-save @solace-iot-team/apim-server-openapi-browser
# NOTE: now install the released package
npm install
````

## Connector OpenAPI from Local Release
````bash
# NOTE: in platform-api/release/platform-api-openapi-client-fe
npm link # creates link in global node_modules
````

### Link Connector OpenAPI from Global
````bash
# NOTE: in admin-portal
npm link @solace-iot-team/platform-api-openapi-client-fe
````
### UnLink Connector OpenAPI from Global
````bash
# NOTE: in admin-portal
npm unlink --no-save @solace-iot-team/platform-api-openapi-client-fe
# NOTE: now install the released package
npm install
````

---
