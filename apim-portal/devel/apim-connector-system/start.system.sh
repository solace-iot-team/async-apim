#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

  # docker compose
  apimConnectorSystemProjectName="apim-portal-connector-system"
  dockerComposeFile="$scriptDir/docker.compose.yml"
  # apim connector
  export APIM_PORTAL_CONNECTOR_CONTAINER_NAME="apim-portal-connector"

############################################################################################################################
# Run

export DOCKER_CLIENT_TIMEOUT=120
export COMPOSE_HTTP_TIMEOUT=120

echo " >>> Docker-compose down for project: $apimConnectorSystemProjectName ..."
  docker-compose -p $apimConnectorSystemProjectName -f "$dockerComposeFile" down --volumes --rmi all
  if [[ $? != 0 ]]; then echo " >>> ERROR: docker compose down for '$apimConnectorSystemProjectName'"; exit 1; fi
echo " >>> Success."

echo " >>> Docker-compose up for project: $apimConnectorSystemProjectName ..."

  docker-compose -p $apimConnectorSystemProjectName -f "$dockerComposeFile" up -d
  if [[ $? != 0 ]]; then echo " >>> ERROR: docker compose up for '$apimConnectorSystemProjectName'"; exit 1; fi

  docker ps -a

  containerName="$APIM_PORTAL_CONNECTOR_CONTAINER_NAME"
  echo "   >>> check: docker logs $containerName ..."
    WORKING_DIR=$scriptDir/tmp; mkdir -p $WORKING_DIR; rm -rf $WORKING_DIR/*;
    dockerLogsFile="$WORKING_DIR/$containerName.docker.logs"
    isInitialized=0; checks=0
    isServerListening=0;
    isConnected2Mongo=0;
    isUserRegistryLoaded=0;
    until [[ $isInitialized -gt 2 || $checks -gt 10 ]]; do
      ((checks++))
      echo "   check: $checks"
      docker logs $containerName > $dockerLogsFile
      if [[ $? != 0 ]]; then echo " >>> ERROR: docker logs '$containerName'"; exit 1; fi

      entryListeningOnPort=$(grep -n -e "Listening on port" $dockerLogsFile)
      echo "      - entryListeningOnPort='$entryListeningOnPort'"
      if [ ! -z "$entryListeningOnPort" ]; then isServerListening=1; fi

      entryConnected2Mongo=$(grep -n -e "Connected to Mongo" $dockerLogsFile)
      echo "      - entryConnected2Mongo='$entryConnected2Mongo'"
      if [ ! -z "$entryConnected2Mongo" ]; then isConnected2Mongo=1; fi

      entryLoadedUserRegistry=$(grep -n -e "Loaded user registry" $dockerLogsFile)
      echo "      - entryLoadedUserRegistry='$entryLoadedUserRegistry'"
      if [ ! -z "$entryLoadedUserRegistry" ]; then isUserRegistryLoaded=1; fi

      isInitialized=$(($isServerListening + $isConnected2Mongo + $isUserRegistryLoaded));
      if [ $isInitialized -lt 3 ]; then sleep 2s; fi
    done
    if [ $isInitialized -lt 3 ]; then echo " >>> ERROR: server is not initialized, checks=$checks"; exit 1; fi
  echo "   >>> success."

echo " >>> Success."

###
# The End.
