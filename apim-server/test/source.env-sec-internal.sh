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
    unset APIM_SERVER_AUTH_TYPE


    # env vars for server
    unset APIM_SERVER_PORT
    unset APIM_SERVER_MONGO_CONNECTION_STRING
    unset APIM_SERVER_MONGO_DB
    unset APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION
    unset APIM_SERVER_LOGGER_APP_ID
    unset APIM_SERVER_LOGGER_LOG_LEVEL
    unset APIM_SERVER_ROOT_USER
    unset APIM_SERVER_ROOT_USER_PWD

    # unset this function
    unset -f unset_source_env
}

# Env vars for server:
export APIM_SERVER_PORT="3004"
export APIM_SERVER_MONGO_CONNECTION_STRING="mongodb://localhost:27020/?retryWrites=true&w=majority"
export APIM_SERVER_MONGO_DB="solace-apim-server"
export APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION="true"
# export APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION="false"
export APIM_SERVER_LOGGER_APP_ID="test-apim-server"
export APIM_SERVER_LOGGER_LOG_LEVEL="trace"
export APIM_SERVER_ROOT_USER="root.admin@async-apim.dev"
export APIM_SERVER_ROOT_USER_PWD="admin123!"
# APIM_SERVER_AUTH_TYPE = oidc | internal | none
export APIM_SERVER_AUTH_TYPE=internal
# internal auth
export APIM_SERVER_AUTH_INTERNAL_JWT_SECRET=myTestAuthJwtSecret
# 15 minutes: 60 * 15 = 900 seconds
export APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS=900
export APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_SECRET=myTestRefreshJwtSecret
# 30 days = 60 * 60 * 24 * 30 = 2592000 seconds
export APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS=2592000

# ENV vars for tests
export APIM_TEST_SERVER_ENABLE_LOGGING="true"
export APIM_TEST_SERVER_PROTOCOL="http"
export APIM_TEST_SERVER_HOST="localhost"
export APIM_TEST_SERVER_PORT=$APIM_SERVER_PORT
export APIM_TEST_SERVER_API_BASE="/apim-server/v1"
export APIM_TEST_SERVER_ROOT_USER=$APIM_SERVER_ROOT_USER
export APIM_TEST_SERVER_ROOT_USER_PWD=$APIM_SERVER_ROOT_USER_PWD

# ########################################################################
# pino log levels:
#
# level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
# export APIM_SERVER_LOGGER_LOG_LEVEL=info
# export APIM_SERVER_LOGGER_LOG_LEVEL=debug
export APIM_SERVER_LOGGER_LOG_LEVEL=trace

######################################################
logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - APIM_SERVER:"
export -p | sed 's/declare -x //' | grep APIM_SERVER
echo "$logName - APIM_TEST:"
export -p | sed 's/declare -x //' | grep APIM_TEST
