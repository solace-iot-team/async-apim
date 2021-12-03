#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));


############################################################################################################################
# Run

echo " >>> Install ..."
  cd $scriptDir
  runScript="npm install"
  $runScript
  code=$?;
  if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1; fi
echo " >>> Success."

echo " >>> Build ..."
  cd $scriptDir
  runScript="npm run build"
  $runScript
  code=$?;
  if [[ $code == 2 ]]; then
    echo ">>> nothing to do, version already exists - code=$code - $runScript' - $scriptName"; exit 0;
  elif [[ $code != 0 ]]; then
    echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1;
  fi
echo " >>> Success."

echo " >>> Starting release of package ..."
  cd $scriptDir
  runScript="npm publish"
  # runScript="npm publish --dry-run"
  $runScript
  code=$?; if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1; fi
echo " >>> Success."


###
# The End.
