#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

  dockerProjectName="qs-async-apim"
  dockerComposeFile="$scriptDir/docker.compose.yml"

# Note: change these
  export APIM_SERVER_ROOT_USER="root.admin@async-apim-quickstart.com"
  export APIM_SERVER_ROOT_USER_PWD="admin123!"

############################################################################################################################
# Run

export DOCKER_CLIENT_TIMEOUT=120
export COMPOSE_HTTP_TIMEOUT=120

echo " >>> Docker-compose down for project: $dockerProjectName ..."
  # docker-compose -p $dockerProjectName -f "$dockerComposeFile" down --volumes
  docker-compose -p $dockerProjectName -f "$dockerComposeFile" down --volumes --rmi all
  if [[ $? != 0 ]]; then echo " >>> ERROR: docker compose down for '$dockerProjectName'"; exit 1; fi
echo " >>> Success."

echo " >>> Docker-compose up for project: $dockerProjectName ..."
  docker-compose -p $dockerProjectName -f "$dockerComposeFile" up -d
  if [[ $? != 0 ]]; then echo " >>> ERROR: docker compose up for '$dockerProjectName'"; exit 1; fi
  docker ps -a
echo " >>> Success."

###
# The End.
