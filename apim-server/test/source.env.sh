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
    unset APIM_TEST_DOCKER_PROJECT_NAME
    unset APIM_TEST_MONGO_DB_CONTAINER_NAME
    unset APIM_TEST_SERVER_MONGO_PORT
    unset APIM_TEST_SERVER_CONNECTOR_PORT
    unset APIM_TEST_CONNECTOR_CONTAINER_NAME
    unset DOCKER_CLIENT_TIMEOUT
    unset COMPOSE_HTTP_TIMEOUT
    # env vars for server
    unset APIM_SERVER_APP_ID
    unset APIM_SERVER_PORT
    unset APIM_SERVER_MONGO_CONNECTION_STRING
    unset APIM_SERVER_MONGO_DB
    unset APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION
    unset APIM_SERVER_LOGGER_LOG_LEVEL
    unset APIM_SERVER_ROOT_USER
    unset APIM_SERVER_ROOT_USER_PWD
    unset APIM_SERVER_DATA_PATH
    unset APIM_SERVER_COOKIE_SECRET
    unset APIM_SERVER_INTERNAL_CONNECTOR_API_URL
    unset APIM_SERVER_AUTH_TYPE
    unset APIM_SERVER_AUTH_INTERNAL_JWT_SECRET
    unset APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS
    unset APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_SECRET
    unset APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS
    unset APIM_SERVER_CONNECTOR_AUTH_ISSUER
    unset APIM_SERVER_CONNECTOR_AUTH_AUDIENCE
    unset APIM_SERVER_CONNECTOR_AUTH_SECRET

    # unset this function
    unset -f unset_source_env
}

# Env vars for server:
export APIM_SERVER_APP_ID="test-apim-server"
export APIM_SERVER_PORT="3004"
export APIM_SERVER_MONGO_CONNECTION_STRING="mongodb://localhost:27020/?retryWrites=true&w=majority"
# export APIM_SERVER_MONGO_DB="solace-apim-server"
export APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION="true"
export APIM_SERVER_LOGGER_LOG_LEVEL="debug"
export APIM_SERVER_ROOT_USER="root.admin@async-apim.dev"
export APIM_SERVER_ROOT_USER_PWD="admin123!"
export APIM_SERVER_DATA_PATH="./test/data"
export APIM_SERVER_COOKIE_SECRET="myCookieSecret"
# connector proxy
export APIM_SERVER_INTERNAL_CONNECTOR_API_URL="http://localhost:9020/v1"
# Auth
# APIM_SERVER_AUTH_TYPE = oidc | internal | none
export APIM_SERVER_AUTH_TYPE="internal"
# internal auth
export APIM_SERVER_AUTH_INTERNAL_JWT_SECRET="myAuthJwtSecret"
# 15 minutes: 60 * 15 = 900 seconds
export APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS="900"
export APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_SECRET="myRefreshJwtSecret"
# 30 days = 60 * 60 * 24 * 30 = 2592000 seconds
# 5 days = 60 * 60 * 24 * 5 = 432000 seconds
export APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS="432000"
# token auth for connector
export APIM_SERVER_CONNECTOR_AUTH_ISSUER="apim-server"
export APIM_SERVER_CONNECTOR_AUTH_AUDIENCE="platform-api-server"
export APIM_SERVER_CONNECTOR_AUTH_SECRET="myConnectorAuthJwtSecret"
#future
# APIM_SERVER_AUTH_WHITELISTED_DOMAINS = http://localhost:3000
# oidc auth
# todo

# ENV vars for tests
export APIM_TEST_SERVER_ENABLE_LOGGING="true"
export APIM_TEST_SERVER_PROTOCOL="http"
export APIM_TEST_SERVER_HOST="localhost"
export APIM_TEST_SERVER_PORT=$APIM_SERVER_PORT
export APIM_TEST_SERVER_API_BASE="/apim-server/v1"
export APIM_TEST_SERVER_ROOT_USER=$APIM_SERVER_ROOT_USER
export APIM_TEST_SERVER_ROOT_USER_PWD=$APIM_SERVER_ROOT_USER_PWD

# services: docker
export APIM_TEST_DOCKER_PROJECT_NAME="apim-test-system"
export APIM_TEST_MONGO_DB_CONTAINER_NAME="apim-test-mongodb"
export APIM_TEST_SERVER_MONGO_PORT="27020"
export APIM_TEST_SERVER_CONNECTOR_PORT="9020"
export APIM_TEST_CONNECTOR_CONTAINER_NAME="apim-test-connector"
export DOCKER_CLIENT_TIMEOUT=120
export COMPOSE_HTTP_TIMEOUT=120

######################################################
logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - APIM_SERVER:"
export -p | sed 's/declare -x //' | grep APIM_SERVER
echo "$logName - APIM_TEST:"
export -p | sed 's/declare -x //' | grep APIM_TEST
