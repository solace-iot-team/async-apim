#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

############################################################################################################################
# Run

echo " >>> Starting: $scriptName ..."
  docker start $APIM_TEST_MONGO_DB_CONTAINER_NAME
  if [[ $? != 0 ]]; then echo " >>> ERROR: start mongo docker container"; exit 1; fi
  docker ps -a
echo " >>> Success."

###
# The End.
