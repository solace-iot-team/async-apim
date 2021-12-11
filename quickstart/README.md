# Solace Async API Management: Quickstart

## Start
````bash
./start.sh
````
_Note:_ Pulls latest images for `solaceiotteam/async-apim-admin-portal` and `solaceiotteam/apim-connector-server`.
Change in [docker.compose.yml](./docker.compose.yml) to choose specific images.

## Stop
````bash
./stop.sh
````

## Admin Portal

### Login
* **URL**: http://{ip-address}:5000
* **Login** with root user:
  - [See docker.compose.yml](./docker.compose.yml):
    - APIM_SERVER_ROOT_USER=`root.admin@aps.com`
    - APIM_SERVER_ROOT_USER_PWD=`admin123!`

### Setup

* users
* orgs
* ...


## Exposed URLs

* **APIM Connector** ``http://localhost:5001``
* **APIM Server**: ``http://{ip-address}:5002``

---
