#
# Environment for tests
#
# Usage:
#   source source.env.sh && {run-tests} && unset_source_env

unset_source_env() {
    # env vars for test
    unset APIM_TEST_SERVER_ENABLE_LOGGING
    unset APIM_TEST_SERVER_PROTOCOL
    unset APIM_TEST_SERVER_HOST
    unset APIM_TEST_SERVER_PORT
    unset APIM_TEST_SERVER_API_BASE
    unset APIM_TEST_SERVER_ROOT_USER
    unset APIM_TEST_SERVER_ROOT_USER_PWD

    # env vars for server
    unset APIM_SERVER_PORT
    unset APIM_SERVER_API_BASE
    unset APIM_SERVER_MONGO_CONNECTION_STRING
    unset APIM_SERVER_MONGO_DB
    unset APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION
    unset APIM_SERVER_LOGGER_APP_ID
    unset APIM_SERVER_LOGGER_LOG_LEVEL
    unset APIM_SERVER_ROOT_USER
    unset APIM_SERVER_ROOT_USER_PWD
    # unset this function
    unset -f unset_source_env

    env | grep APIM_SERVER
    env | grep APIM_TEST
}

# Env vars for server:
export APIM_SERVER_PORT="3004"
export APIM_SERVER_API_BASE="/apim-server/v1"
export APIM_SERVER_MONGO_CONNECTION_STRING="mongodb://localhost:27020/?retryWrites=true&w=majority"
export APIM_SERVER_MONGO_DB="solace-apim-server"
export APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION="true"
export APIM_SERVER_LOGGER_APP_ID="apim-server"
export APIM_SERVER_LOGGER_LOG_LEVEL="trace"
export APIM_SERVER_ROOT_USER="root.admin@aps.com"
export APIM_SERVER_ROOT_USER_PWD="admin123!"

# ENV vars for tests
export APIM_TEST_SERVER_ENABLE_LOGGING="true"
export APIM_TEST_SERVER_PROTOCOL="http"
export APIM_TEST_SERVER_HOST="localhost"
export APIM_TEST_SERVER_PORT=$APIM_SERVER_PORT
export APIM_TEST_SERVER_API_BASE=$APIM_SERVER_API_BASE
export APIM_TEST_SERVER_ROOT_USER=$APIM_SERVER_ROOT_USER
export APIM_TEST_SERVER_ROOT_USER_PWD=$APIM_SERVER_ROOT_USER_PWD

#
# pino log levels:
#
# export APIM_SERVER_LOGGER_LOG_LEVEL=silent
# export APIM_SERVER_LOGGER_LOG_LEVEL=fatal
# export APIM_SERVER_LOGGER_LOG_LEVEL=error
# export APIM_SERVER_LOGGER_LOG_LEVEL=warn
export APIM_SERVER_LOGGER_LOG_LEVEL=info
# export APIM_SERVER_LOGGER_LOG_LEVEL=debug
export APIM_SERVER_LOGGER_LOG_LEVEL=trace

logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - APIM_SERVER:"
export -p | sed 's/declare -x //' | grep APIM_SERVER
# env | grep APIM_SERVER
echo "$logName - APIM_TEST:"
export -p | sed 's/declare -x //' | grep APIM_TEST
# env | grep APIM_TEST
