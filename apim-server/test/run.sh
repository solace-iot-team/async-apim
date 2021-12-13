#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Prepare

  LOG_DIR="$scriptDir/logs";
  mkdir -p $LOG_DIR;
  rm -rf $LOG_DIR/*;
  FAILED=0

############################################################################################################################
# Run

  # runScript="npm run test:pretty:devel"
  runScript="npm run test:pretty"
  echo "starting: $runScript ..."
  logFile="$LOG_DIR/npm.run.test.out"; mkdir -p "$(dirname "$logFile")";
  # $runScript
  $runScript > $logFile 2>&1
  code=$?; if [[ $code != 0 ]]; then echo ">>> ERROR - code=$code - runScript='$runScript' - $scriptName"; FAILED=1; fi


##############################################################################################################################
# Check for errors

if [[ "$FAILED" -eq 0 ]]; then
  echo ">>> FINISHED:SUCCESS - $scriptName"
  touch "$LOG_DIR/$scriptName.SUCCESS.out"
else
  echo ">>> FINISHED:FAILED";
  echo "   scanning logs for ERROR & failing ..."
  filePattern="$LOG_DIR"
  errors=$(grep -n -r -e "ERROR" $filePattern )
  test_failing=$(grep -n -r -e "failing" $filePattern )
  if [ ! -z "$errors" ]; then
    echo "   found ${#errors[@]} ERRORS"
    while IFS= read line; do
      echo $line >> "$LOG_DIR/$scriptName.ERROR.out"
    done < <(printf '%s\n' "$errors")
  else
    echo "   no ERROR found"
  fi
  if [ ! -z "$test_failing" ]; then
    echo "   found ${#test_failing[@]} failing"
    while IFS= read line; do
      echo $line >> "$LOG_DIR/$scriptName.ERROR.out"
    done < <(printf '%s\n' "$test_failing")
  else
    echo "   no failing found"
  fi
  exit 1
fi

###
# The End.
