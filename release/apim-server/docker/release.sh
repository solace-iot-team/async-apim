#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

SKIPPING="+++ SKIPPING +++";

############################################################################################################################
# Run

echo " >>> Starting $scriptName ..."

echo " >>> Build ..."
  cd $scriptDir
  runScript="$scriptDir/build.sh"
  $runScript
  code=$?;
  if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1; fi
echo " >>> Success."

echo " >>> Publish ..."
  cd $scriptDir
  runScript="npm run publish"
  $runScript
  code=$?;
  if [[ $code == 2 ]]; then
    echo ">>> [$SKIPPING]: version already exists - code=$code - $runScript' - $scriptName"; exit 0;
  elif [[ $code != 0 ]]; then
    echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1;
  fi
echo " >>> Success."


###
# The End.
