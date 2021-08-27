#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));


############################################################################################################################
# Run

echo "UNDER CONSTRUCTION"
exit 1;

echo " >>> Install ..."
  cd $scriptDir
  runScript="npm install"
  $runScript
  code=$?;
  if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1; fi
echo " >>> Success."


TODO: checkVersion: exit if return is 2

echo " >>> Update Version ..."
  cd $scriptDir
  runScript="npm run updateVersion"
  $runScript
  code=$?;
  if [[ $code == 2 ]]; then
    echo ">>> nothing to do, version up to date - code=$code - $runScript' - $scriptName"; exit 0;
  elif [[ $code != 0 ]]; then
    echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1;
  fi
echo " >>> Success."

echo " >>> Starting release of platform-api-openapi-fe ..."
  cd $scriptDir
  runScript="npm publish"
  # runScript="npm publish --dry-run"
  $runScript
  code=$?; if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1; fi
echo " >>> Success."


###
# The End.
