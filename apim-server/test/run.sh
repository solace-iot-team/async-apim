#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Environment Variables

  source "$scriptDir/source.env.sh"

  if [ -z "$APIM_SOLACE_PLATFORM_API_PROJECT_HOME" ]; then echo ">>> ERROR: - $scriptName - missing env var: APIM_SOLACE_PLATFORM_API_PROJECT_HOME"; exit 1; fi
  if [ -z "$APIM_INTEGRATION_TEST_WORKING_DIR" ]; then echo ">>> ERROR: - $scriptName - missing env var: APIM_INTEGRATION_TEST_WORKING_DIR"; exit 1; fi
  if [ -z "$APIM_INTEGRATION_TEST_LOG_DIR" ]; then echo ">>> ERROR: - $scriptName - missing env var: APIM_INTEGRATION_TEST_LOG_DIR"; exit 1; fi
  if [ -z "$APIM_INTEGRATION_TEST_HOME" ]; then echo ">>> ERROR: - $scriptName - missing env var: APIM_INTEGRATION_TEST_HOME"; exit 1; fi
  if [ -z "$RUN_FG" ]; then export RUN_FG="false"; fi

############################################################################################################################
# Prepare

  LOG_DIR=$APIM_INTEGRATION_TEST_LOG_DIR; mkdir -p $LOG_DIR; rm -rf $LOG_DIR/*;

############################################################################################################################
# Scripts

declare -a testScripts=(
  "generate.openapi-client.sh"
  "mongodb/start.mongo.sh"
  "start.server.background.sh"
  "run.npm.integration-tests.logfile.sh"
)

############################################################################################################################
# Run

  FAILED=0

  # for testing
  # RUN_FG="true"

  for testScript in ${testScripts[@]}; do
    if [ "$FAILED" -eq 0 ]; then
      runScript="$scriptDir/$testScript"
      echo "starting: $runScript ..."
      if [[ "$RUN_FG" == "false" ]]; then
        logFile="$LOG_DIR/$testScript.out"; mkdir -p "$(dirname "$logFile")";
        "$runScript" > $logFile 2>&1
      else
        "$runScript"
      fi
      code=$?; if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - runScript='$runScript' - $scriptName"; FAILED=1; fi
    fi
  done


##############################################################################################################################
# Check for errors

if [[ "$FAILED" -eq 0 ]]; then
  echo ">>> FINISHED:SUCCESS - $scriptName"
  touch "$LOG_DIR/$scriptName.SUCCESS.out"
else
  echo ">>> FINISHED:FAILED";
  filePattern="$LOG_DIR"
  errors=$(grep -n -r -e "ERROR" $filePattern )
  npm_errors=$(grep -n -r -e "failing" $filePattern )
  if [ ! -z "$errors" ]; then
    while IFS= read line; do
      echo $line >> "$LOG_DIR/$scriptName.ERROR.out"
    done < <(printf '%s\n' "$errors")
  fi
  if [ ! -z "$npm_errors" ]; then
    while IFS= read line; do
      echo $line >> "$LOG_DIR/$scriptName.ERROR.out"
    done < <(printf '%s\n' "$npm_errors")
  fi
  exit 1
fi

###
# The End.
