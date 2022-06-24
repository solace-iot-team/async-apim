.. _system-content-configuration:

APIM Server Configuration
=========================

Environment Variables
+++++++++++++++++++++

.. list-table:: General
   :widths: 25 25 50
   :header-rows: 1

   * - Environment Variable
     - Value(s)/Format
     - Description
   * - APIM_SERVER_APP_ID
     - alpha & '-'
     - the server app id
   * - APIM_SERVER_PORT
     - number
     - the port the http server is listening on
   * - APIM_SERVER_MONGO_CONNECTION_STRING
     - mongodb connection string
     - connection string for mongo. example: `mongodb://{hostname}:{port}/?retryWrites=true&w=majority`
   * - APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION
     - boolean (false|true)
     - whether the responses from server should be validated against it's open api spec. switch off for production.
   * - APIM_SERVER_LOGGER_LOG_LEVEL
     - 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
     - the log level. use warn or info for production.
   * - APIM_SERVER_REQUEST_SIZE_LIMIT
     - number + 'kb'
     - the limit of the request size. example: `100kb`
   * - APIM_SERVER_COOKIE_SECRET
     - string
     - the secret for signing browser cookies
   * - APIM_SERVER_ROOT_USER
     - string in e-mail format
     - the user name for the root user. example: `root@apim-server.com`.
   * - APIM_SERVER_ROOT_USER_PWD
     - string
     - the password for the root user.
   * - APIM_SERVER_DATA_PATH
     - directory
     - the directory for server data. see below.
   * - APIM_SERVER_INTERNAL_CONNECTOR_API_URL
     - url
     - APIM Connector API url for `internal` connector configuration. example:`http://{hostname}:{port}/v1`

.. list-table:: Internal IDP Configuration
    :widths: 25 25 50
    :header-rows: 1

    * - Environment Variable
      - Value(s)/Format
      - Description
    * - APIM_SERVER_AUTH_TYPE
      - `internal`
      - denotes that the APIM Server acts as the IDP
    * - APIM_SERVER_AUTH_INTERNAL_JWT_SECRET
      - string
      - the secret for signing the JWT
    * - APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS
      - number (JWT expiry in seconds)
      - the JWT expiration in seconds. example: 15 minutes = 60 * 15 = 900 seconds. must be lower than refresh token expiry
    * - APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_SECRET
      - string
      - the secret for signing the refresh JWT
    * - APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS
      - number (refresh JWT expiry in seconds)
      - the refresh JWT expiration in seconds. example: 5 days = 60 * 60 * 24 * 5 = 432000 seconds. must be higher than jwt expiry
    * - APIM_SERVER_CONNECTOR_AUTH_ISSUER
      - string
      - the issuer in the generated token for the APIM Connector. Must be the same as in Connector configuration.
    * - APIM_SERVER_CONNECTOR_AUTH_AUDIENCE
      - string
      - the audience in the generated token for the APIM Connector. Must be the same as in Connector configuration.
    * - APIM_SERVER_CONNECTOR_AUTH_SECRET
      - string
      - the secret for signing the bearer token for the APIM Connector. Must be the same as in Connector configuration.

.. note::
  When signing into the Portal app, the server generates two tokens, the bearer token for the API requests and the refresh token.
  The refresh token is stored as a Cookie on the browser and is used to automatically refresh the bearer token until it is expired.
  The portal refreshes the bearer token for the signed in user every 5 minutes, hence, the bearer token expiry must be greater than 5 mins.

.. note::
  The APIM Server functions as a proxy from the APIM Portal to the APIM Connector.
  It generates the connector api bearer token from information of the signed-in user.


.. list-table:: OpenID Connect IDP Configuration
    :widths: 25 25 50
    :header-rows: 1

    * - Environment Variable
      - Value(s)/Format
      - Description
    * - APIM_SERVER_AUTH_TYPE
      - `oidc`
      - future support for open id connect idp configuration

Bootstrapping Data
++++++++++++++++++

Boostrapping Connector Configuration
------------------------------------

- TODO, example file


.. seealso::

  - `docker.compose.yml`_ - docker compose in repo.


.. _docker.compose.yml :
  https://github.com/solace-iot-team/async-apim/blob/main/quickstart/docker.compose.yml
