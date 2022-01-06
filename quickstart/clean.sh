#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Settings

  apimServerMongoDBDataPath="$scriptDir/docker-volumes/apim-server-mongodb-data/*"
  apimConnectorMongoDBDataPath="$scriptDir/docker-volumes/apim-connector-mongodb-data/*"

############################################################################################################################
# Run

echo " >>> Deleting $apimServerMongoDBDataPath ..."
  rm -rf $apimServerMongoDBDataPath
  if [[ $? != 0 ]]; then echo " >>> ERROR: deleting db files"; exit 1; fi
echo " >>> Success."

echo " >>> Deleting $apimConnectorMongoDBDataPath ..."
  rm -rf $apimConnectorMongoDBDataPath
  if [[ $? != 0 ]]; then echo " >>> ERROR: deleting db files"; exit 1; fi
echo " >>> Success."


###
# The End.
