# Solace Async API Management: Quickstart

## Start
````bash
./start.sh
````
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

#### Configure Connector
- contains a sample bootstrap connector config with `localhost`
- change to `{ip-address}` if required

#### Configure Orgs

#### Configure Users

...

## Exposed URLs

* **APIM Server**: ``http://{ip-address}:5002``
* **APIM Connector API** ``http://localhost:5001``

---
