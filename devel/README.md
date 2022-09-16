# APIM Portal Development

## Standup Devel Infrastructure

````bash
./start.sh
````

  - Check the [docker.compose.yml](./docker.compose.yml) for details.

Stop:
````bash
./stop.sh
````

## Standup Standalone MongoDB

````bash
./mongodb/start.sh
````

Stop:
````bash
./mongodb/stop.sh
````

## Standup NGINX

Browser: http://localhost:3002

Loads portal from http://localhost:3001

````bash
./nginx/start.sh
````

Stop:
````bash
./nginx/stop.sh
````

---
