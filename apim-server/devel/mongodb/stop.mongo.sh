#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

export APIM_SERVER_MONGO_PORT=27019

############################################################################################################################
# Run

echo " >>> Stopping mongo in docker..."
  docker-compose -f "$scriptDir/docker-compose.yml" down --volumes --rmi all
  if [[ $? != 0 ]]; then echo " >>> ERROR: stopping mongo in docker"; exit 1; fi
  docker ps -a
echo " >>> Success."

###
# The End.
