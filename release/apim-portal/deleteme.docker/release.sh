#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

apimServerOpenApiBrowserReleaseDir="$scriptDir/../../apim-server-openapi-browser"

############################################################################################################################
# Run

echo " >>> Npm install ..."
  cd $scriptDir
  runScript="npm install"
  $runScript
  code=$?;
  if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1; fi
echo " >>> Success."

echo " >>> Release apim-server-openapi-browser ..."
  cd $apimServerOpenApiBrowserReleaseDir
  runScript="./release.sh"
  $runScript
  code=$?;
  if [[ $code == 2 ]]; then
    echo ">>> nothing to do, version already exists - code=$code - $runScript' - $scriptName"; exit 0;
  elif [[ $code != 0 ]]; then
    echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1;
  fi
echo " >>> Success."

echo " >>> Build & Push Docker Image ..."
  cd $scriptDir
  runScript="npm run build+push"
  $runScript
  code=$?;
  if [[ $code == 2 ]]; then
    echo ">>> nothing to do, image already exists - code=$code - $runScript' - $scriptName"; exit 0;
  elif [[ $code != 0 ]]; then
    echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1;
  fi
echo " >>> Success."

###
# The End.
