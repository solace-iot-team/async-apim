#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

  dockerComposeFile="$scriptDir/docker.compose.yml"

############################################################################################################################
# Run

echo " >>> Docker-compose down for project: $APIM_TEST_DOCKER_PROJECT_NAME ..."

  # remove volumes as well
  # docker-compose -p $apimConnectorSystemProjectName -f "$dockerComposeFile" down --volumes --rmi all
  # leave volumes
  docker-compose -p $APIM_TEST_DOCKER_PROJECT_NAME -f "$dockerComposeFile" down --rmi all
  if [[ $? != 0 ]]; then echo " >>> ERROR: docker compose down for '$APIM_TEST_DOCKER_PROJECT_NAME'"; exit 1; fi
  docker ps -a

echo " >>> Success."

###
# The End.
