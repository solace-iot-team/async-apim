#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

  dockerProjectName="qs-async-apim"
  dockerComposeFile="$scriptDir/docker.compose.yml"

############################################################################################################################
# Run

echo " >>> Docker-compose down for project: $dockerProjectName ..."

  docker-compose -p $dockerProjectName -f "$dockerComposeFile" down --volumes --rmi all
  if [[ $? != 0 ]]; then echo " >>> ERROR: docker compose down for '$dockerProjectName'"; exit 1; fi
  docker ps -a

echo " >>> Success."

###
# The End.
