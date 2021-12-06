#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

  dockerProjectName="qs-async-apim"
  dockerComposeFile="$scriptDir/docker.compose.yml"
  # export QS_ASYNC_APIM_CONNECTOR_CONTAINER_NAME="qs-async-apim-connector"
  # export QS_ASYNC_APIM_SERVER_MONGODB_DATA_MOUNT_PATH="$scriptDir/docker-volumes/apim-server-mongodb-data"
  # export QS_ASYNC_APIM_CONNECTOR_MONGODB_DATA_MOUNT_PATH="$scriptDir/docker-volumes/apim-connector-mongodb-data"
  # export QS_ASYNC_APIM_WWW_CONF_MOUNT_PATH="$scriptDir/docker-volumes/apim-www"
  # export QS_ASYNC_APIM_WWW_LOGS_MOUNT_PATH="$scriptDir/docker-volumes/apim-www-logs"
############################################################################################################################
# Run

# mkdir -p $QS_ASYNC_APIM_SERVER_MONGODB_DATA_MOUNT_PATH
# mkdir -p $QS_ASYNC_APIM_CONNECTOR_MONGODB_DATA_MOUNT_PATH
# mkdir -p $QS_ASYNC_APIM_WWW_LOGS_MOUNT_PATH

export DOCKER_CLIENT_TIMEOUT=120
export COMPOSE_HTTP_TIMEOUT=120

echo " >>> Docker-compose down for project: $dockerProjectName ..."
  # docker-compose -p $dockerProjectName -f "$dockerComposeFile" down --volumes
  docker-compose -p $dockerProjectName -f "$dockerComposeFile" down --volumes --rmi all
  if [[ $? != 0 ]]; then echo " >>> ERROR: docker compose down for '$dockerProjectName'"; exit 1; fi
echo " >>> Success."

# echo "continue here"; exit 1

echo " >>> Docker-compose up for project: $dockerProjectName ..."

  docker-compose -p $dockerProjectName -f "$dockerComposeFile" up -d
  if [[ $? != 0 ]]; then echo " >>> ERROR: docker compose up for '$dockerProjectName'"; exit 1; fi

  docker ps -a

echo " >>> Success."

###
# The End.
