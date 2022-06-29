#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

  apimMongoDBDataPath="$scriptDir/docker-volumes/apim-mongodb-data/*"

############################################################################################################################
# Run

echo " >>> Deleting $apimMongoDBDataPath ..."
  rm -rf $apimMongoDBDataPath
  if [[ $? != 0 ]]; then echo " >>> ERROR: deleting db files"; exit 1; fi
echo " >>> Success."

###
# The End.
