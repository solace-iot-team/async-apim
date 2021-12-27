# Release Notes

Solace Async API Management.

## Version 0.0.29
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.29
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.15
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.9
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.5.7

#### API-M Admin & Developer Portal
**New:**
- **Monitor System Health**
  - New component to display system health (portal app, server, connector)
- **System Health Check**
  - added health & version monitor for portal app
    - reloads portal app in case of error / version mismatch

**Fixes:**
- **Re-render Components**
  - better control of re-render components - only when required
- **Developer Portal User App**
  - fixed error on deleting an App Webhook

#### API-M Server OpenAPI

**Updated:**
- **GET /apsMonitor/apsStatus**
  - added timestamp to result body

#### API-M Server
**No Changes.**

## Version 0.0.28
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.28
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.14
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.8

#### API-M Admin & Developer Portal
**No Changes.**

#### API-M Server OpenAPI

**New:**
- **error-id**
  - `serverNotOperational`: returned for api calls when server is not ready

#### API-M Server
**New:**
- **monitor**
  - re-initializes server after failed healthcheck
- **startup/initialization**
  - exits server for unrecoverable errors, e.g.:
    - mal-formed DB connection string
    - DB authentication error
  - log of DB server and client info
  - bootstrap users

## Version 0.0.27
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.27
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.13
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.7

#### API-M Admin & Developer Portal
**New:**
- **logos**
  - separate logos for admin & developer portal, logo switched based on view
- **about info**
  - click on logo to see about info
- **health check apim-server**
  - healthcheck now includes apim-server
- **handling of health check failures**
  - server: auto logout
  - connector: disable connector components

**Fixes:**
- **Manage User**
  - ability to manage users even without connector available

#### API-M Server OpenAPI
**New:**
- **about**
  - get about info
- **monitor/status**
  - get the status of the server

#### API-M Server
**New:**
- **about**
  - generate about in build phase
- **monitor**
  - periodic monitor of DB connection
- **logging**
  - added middleware to log API requests & responses

## Version 0.0.25
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.25
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.12
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.6

#### API-M Admin & Developer Portal
**New:**
- **created docs, test, and release workflows**
  - in gh-pages branch

**Known Issues:**
- **Manage User**
  - fails if connector not reachable to load orgs

#### API-M Server OpenAPI
**No Changes.**

#### API-M Server
**No Changes.**

## Version 0.0.24
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.24
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.12
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.6

#### API-M Admin & Developer Portal
**Fixes:**
- **ManageConnectors/TestConnector**
  - removed extensive console logging

**Known Issues:**
- **Manage User**
  - fails if connector not reachable to load orgs

#### API-M Server OpenAPI
**No Changes.**

#### API-M Server
**Release/Test:**
- **Linter**
  - fixed linter issues

## Version 0.0.23
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.23
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.11
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.5

#### API-M Admin & Developer Portal
**New Features:**
- **Release**
  - re-factor release to include generating a standalone tar.gz of the admin portal

**Known Issues:**
- **Manage User**
  - fails if connector not reachable to load orgs

#### API-M Server OpenAPI
**No Changes.**

#### API-M Server
**No Changes.**


## Version 0.0.22
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.22
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.11
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.5

#### API-M Admin & Developer Portal

**Fixes:**
- **Connector Healthcheck**
  - re-worked base path check - only accepts 401 return as valid

**Known Issues:**
- **Manage User**
  - fails if connector not reachable to load orgs

#### API-M Server OpenAPI
**No Changes.**

#### API-M Server
**No Changes.**


## Version 0.0.21
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.21
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.11
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.5

* **Connector Healthcheck**
  - re-factor health check to support option internal proxy

## Version 0.0.20
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.20
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.10
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.5

* **Connector Config**
  - added option for internal proxy & external url config

## Version 0.0.18
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.18
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.9
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.3

**Initial Release.**


---
