#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

SKIPPING="+++ SKIPPING +++";


############################################################################################################################
# Run

echo " >>> Starting $scriptName ..."

releaseDirs=(
  "targz-package"
  "docker"
)

echo " >>> Build ..."
  cd $scriptDir
  runScript="$scriptDir/build.sh"
  $runScript
  code=$?;
  if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - $runScript' - $scriptName"; exit 1; fi
echo " >>> Success."

# run each releaseDir
for releaseDir in ${releaseDirs[@]}; do

  releaseScript="$scriptDir/$releaseDir/release.sh"

  echo ">>> Running: $releaseScript"

  $releaseScript

  code=$?;
  if [[ $code == 2 ]]; then
    echo ">>> [$releaseDir] [$SKIPPING]: version already exists - code=$code - $releaseScript' - $scriptName"; exit 0;
  elif [[ $code != 0 ]]; then
    echo ">>> [$releaseDir] ERROR - code=$code - $releaseScript' - $scriptName"; exit 1;
  fi

done

###
# The End.