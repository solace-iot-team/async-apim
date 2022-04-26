# Release Notes

Solace Async API Management.

## Version 0.1.6
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.1.6
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.1.0
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.1.0
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.7.11

#### API-M Admin & Developer Portal
**Fixes:**
* **API Products**
  - added validation of business group information stored in the attributes. if business group not found, then API Product is categorized as a Recovered Asset.
* **Organization:Asset Maintenance:API Products**
  - fixed recovery of API Products without any version information

## Version 0.1.5
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.1.5
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.1.0
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.1.0
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.7.11

#### API-M Admin & Developer Portal
**New Features:**
- **Developer Portal: My Apps**
  - refactored module
  - view and manage api products including api product approval state
- **Admin Portal: Manage Apps**
  - approve/revoke api products individually on apps
  - list of apps that can be managed is RBAC controlled, [see Manage Apps in doc](https://solace-iot-team.github.io/async-apim/admin-portal-content/manage-apps.html)
- **Admin Portal: Organizations: Asset Maintenance: API Products**
  - new component to manage all api products in the organization
  - useful to assign owner & business group info to api products created by external systems

## Version 0.1.4
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.1.4
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.1.0
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.1.0
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.7.6

#### API-M Admin & Developer Portal
**New Features:**
* **Recover API Products**
  - added `recover api products` module to `Manage API Products`.
    - allows users with `organization admin` role to list, edit, delete API Products not containing the business group information

## Version 0.1.3
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.1.3
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.1.0
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.1.0
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.7.6

#### API-M Admin & Developer Portal
**New Features:**
* **Manage API Products**
  - added versions to view and update
  - management of owning business group
  - manage sharing with business group - including access type = `readonly`, `full-access`
  - added accessLevel attribute: `internal`, `private`, `public`
  - added lifecycle attribute: `draft`, `released`, `deprecated`
  - added access rights checks for edit, delete, and view (see documentation for details)
* **API Product Catalog in Developer Portal**
  - renamed `Explore API Products` to `Explore APIs`
  - refactored grid/list view
  - added access right checks for list, view and creating apps from products (see documentation for details)

## Version 0.1.2
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.1.2
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.1.0
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.1.0
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.6.5

#### API-M Admin & Developer Portal

**Fixes:**
- **API Products**
  - fixed error when displaying an API Product

## Version 0.1.1
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.1.1
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.1.0
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.1.0
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.6.5

#### API-M Admin & Developer Portal

**New Features:**
- **API Products**
  - added owning Business Group attribute management
  - refactored edit/new UI components
  - list only shows API Products owned by the currently selected business group
  - **_Note:_** Existing API Products not tagged with the correct attribute settings will not be displayed

## Version 0.1.0
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.1.0
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.1.0
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.1.0
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.7.6

#### API-M Admin & Developer Portal

**Fixes:**
- **Business Groups / login / member calculation**
  - various fixes in roles calculation & business group display

## Version 0.0.37
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.37
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.19
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.13
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.6.5

#### API-M Admin & Developer Portal

**New Features:**
- **Organization/Business Groups**
  - manage business groups within an organization including import from external systems
  - assign organization users to be members of business groups with roles in that group
  - user select business group to work in
  - top level business group is the organization
  - user roles are inherited by all children of business group
  - business groups can be imported via API from external systems using the external system id and external system business group id
- **User Selection of Business Group**
  - user can select the business group they are working in from toolbar based on calculated roles
  - roles are adjusted to settings for that business group
  - last business group is saved and on new login automatically selected for the user. On first login, system will assign a default business group).
- **Organization/External Systems**
  - define external systems for integration - e.g. import of business groups
- **Organization/Users**
  - assign users to business groups with roles per business group
  - roles flow down from parent business groups to all children
- **System/Users**
  - separated organization users from system user management
- **System/Organization/Manage Users**
  - allows for setting organization roles by organization on users
- **User Session Management**
  - API calls for session management in case of re-configuration of system and/or organization:
    - logout,
    - logout all users,
    - logout all users logged into an organization,
  - API call to login on behalf of a user (loginAs)

## Version 0.0.36
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.36
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.18
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.12
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.6.5

#### API-M Admin & Developer Portal

**New Features:**
- **Organization->Integration->External Systems**
  - manage external systems for integration
- **Organization->Business Groups**
  - manage business groups including imported groups from external systems

#### API-M Server OpenAPI
**New:**
- **resource: /apsBusinessGroups/{organization_id}**
  - manage business group entities for an organization
- **resource: /apsExternalSystems/{organization_id}**
  - manage external system entities for an organization

## Version 0.0.35
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.35
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.17
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.11
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.6.5

#### API-M Admin & Developer Portal

**Fixes:**
- **Intial page load showing 'system unavailable'**
  - fixed. shows homepage.
- **Typescript version:**
  - moved back to 4.3.5 (supported version)

**Framework**
- **refactored Manage API Products**

## Version 0.0.34
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.34
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.17
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.11
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.6.5

#### API-M Admin & Developer Portal

**Enhancements:**
- **Organization Status**
  - display connectivity status of the organization
- **Edit/New Organization**
  - advanced configuration: event portal config is now optional
- **Import APIs from Event Portal**
  - disabled if no event portal connectivity
- **Organzation Display Name**
  - use display name instead of id
- **Admin Portal: Manage API Products**
  - added `accessLevel` property, defaults to `private`
- **Developer Portal: Explore API Products**
  - added `accessLevel` to view & search facility

**Fixes:**
- **Developer App: Manage Webhooks**
  - now takes into account the reversal of pub v. sub permissions - these are now the same as the spec
- **Login without available connector**
  - login as a user with `systemAdmin` role works now regardless of connector config/availability
- **Developer Portal: My Apps**
  - issue: invalid format of portal user as a connector developer
  - portal now uses the same validation as connector for first/last name
  - in case of an error, portal displays error message on page instead of blank page



## Version 0.0.33
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.33
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.16
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.10
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.6.1

**Minor bug fixes**

## Version 0.0.32
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.32
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.16
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.10
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.6.1

#### API-M Admin & Developer Portal

**New:**
- **Separated System Management & Organization Management**
  - Users are known system wide and can belong to 1 or multiple organizations
  - for each organization, a User can have different roles
- **User Management**
  - Users can be managed at a system level and/or at an organization level

#### API-M Server OpenAPI
**New:**
- **resource: apsAdministration/apsOrganizations**
  - manage organization entities

**Changes:**
- **APSUser Schema & API**
  - memberOfOrganizations list contains organization specific roles
  - PATCH: replaces arrays instead of merging them
  - GET: added searchOrganizationId, searchIsActivated and searchUserId as query parameters

#### API-M Server
**New:**
- **ApsOrganizations Service**
  - implementation of `apsAdministration/apsOrganizations` resource
- **DB Migration**
  - on startup, DB collections are migrated from current version to new versions allowing for simple updates

**Enhancements:**
- **search**
  - search now searches for 'contains' and ORs the space separated search word list

## Version 0.0.31
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.31
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.15
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.9
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.6.1

#### API-M Admin & Developer Portal

**New:**
- **Monitor App**
  - monitor user app - connections, queues, RDPs

#### API-M Server OpenAPI
**No Changes.**

#### API-M Server
**No Changes.**

## Version 0.0.30
  * [API-M Admin & Developer Portal](https://github.com/solace-iot-team/async-apim/tree/main/apim-portal): 0.0.30
  * [API-M Server OpenAPI](https://github.com/solace-iot-team/async-apim/blob/main/apim-server/server/common/api.yml): 0.0.15
  * [API-M Server](https://github.com/solace-iot-team/async-apim/tree/main/apim-server): 0.0.9
  * [API-M Connector OpenAPI](https://github.com/solace-iot-team/platform-api): 0.5.7

#### API-M Admin & Developer Portal

**New:**
- **Global Error Handling**
  - 'catch-all' component added

**Update:**
- **index.html**
  - added cache-control no-cache

**Fix:**
- **System/Monitor/Health** - fixed minor bug

#### API-M Server OpenAPI
**No Changes.**

#### API-M Server
**No Changes.**

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
