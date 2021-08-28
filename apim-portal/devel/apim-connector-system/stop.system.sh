#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

  apimConnectorSystemProjectName="apim-portal-connector-system"
  dockerComposeFile="$scriptDir/docker.compose.yml"

  export APIM_PORTAL_CONNECTOR_CONTAINER_NAME="apim-portal-connector"

############################################################################################################################
# Run

echo " >>> Docker-compose down for project: $apimConnectorSystemProjectName ..."

  docker-compose -p $apimConnectorSystemProjectName -f "$dockerComposeFile" down --volumes --rmi all
  if [[ $? != 0 ]]; then echo " >>> ERROR: docker compose down for '$apimConnectorSystemProjectName'"; exit 1; fi
  docker ps -a

echo " >>> Success."

###
# The End.
