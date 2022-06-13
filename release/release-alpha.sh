#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

if [ -z "$APIM_RELEASE_APLPHA_BUILD_NUM" ]; then echo ">>> XT_ERROR: - $scriptLogName - missing env var: APIM_RELEASE_APLPHA_BUILD_NUM"; exit 1; fi

export APIM_RELEASE_ALPHA_VERSION="alpha+$APIM_RELEASE_APLPHA_BUILD_NUM"

releaseScript="$scriptDir/release.sh"

echo ">>> Running: $releaseScript"

$releaseScript

code=$?;

if [[ $code != 0 ]]; then
  echo ">>> ERROR - code=$code - $releaseScript' - $scriptDir/$scriptName"; exit 1;
fi

echo " >>> Success: $scriptDir/$scriptName"

###
# The End.
