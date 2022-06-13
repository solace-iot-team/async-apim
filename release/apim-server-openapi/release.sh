#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

SKIPPING="+++ SKIPPING +++";

############################################################################################################################
# Run

echo " >>> Starting $scriptName ..."

# if alpha release, do nothing
if [ -n "$APIM_RELEASE_APLPHA_BUILD_NUM" ]; then echo ">>> $SKIPPING: - $scriptDir/$scriptName - APIM_RELEASE_APLPHA_BUILD_NUM=$APIM_RELEASE_APLPHA_BUILD_NUM"; exit 0; fi


echo " >>> Build ..."
  cd $scriptDir
  runScript="$scriptDir/build.sh"
  $runScript
  code=$?;
  if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - $runScript' - $scriptDir/$scriptName"; exit 1; fi
echo " >>> Success."

echo " >>> Publish ..."
  cd $scriptDir
  runScript="npm run publish"
  $runScript
  code=$?;
  if [[ $code == 2 ]]; then
    echo ">>> [$SKIPPING]: version already exists - code=$code - $runScript' - $scriptDir/$scriptName"; exit 0;
  elif [[ $code != 0 ]]; then
    echo ">>> ERROR - code=$code - $runScript' - $scriptDir/$scriptName"; exit 1;
  fi

echo " >>> Success: $scriptDir/$scriptName"

###
# The End.
