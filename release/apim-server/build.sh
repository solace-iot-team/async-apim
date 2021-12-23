#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

echo " >>> Starting $scriptName ..."

buildDirs=(
  "docker"
)

for buildDir in ${buildDirs[@]}; do

  buildScript="$scriptDir/$buildDir/build.sh"

  echo ">>> Running: $buildScript"

  $buildScript

  code=$?;
  if [[ $code != 0 ]]; then
    echo ">>> [$buildDir] ERROR - code=$code - $buildScript' - $scriptName"; exit 1;
  fi

done

###
# The End.
