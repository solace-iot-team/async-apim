#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

# make sure this is the same port as configured for the apim-server
export APIM_SERVER_MONGO_PORT=27020

dockerProjectName="apim-test-server-mongodb"

############################################################################################################################
# Run

echo " >>> Starting: $scriptName ..."
  docker start $dockerProjectName
  if [[ $? != 0 ]]; then echo " >>> ERROR: start mongo docker container"; exit 1; fi
  docker ps -a
echo " >>> Success."

###
# The End.
