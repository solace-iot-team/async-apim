#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

  dockerProjectName="apim-devel-standalone-mongodb"
  dockerComposeFile="$scriptDir/docker.compose.yml"

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
