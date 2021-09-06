#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

echo " >>> Docker Container: Starting server ..."
cd $scriptDir
runScript="node dist/server/server/index.js"
while true; do
  $runScript
  code=$?
  echo "ERROR: script exited with code=$code. trying again after 5 seconds"
  sleep 5;
done

###
# The End.
