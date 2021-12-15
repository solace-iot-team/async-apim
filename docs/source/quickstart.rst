Quickstart
==========

The quickstart starts all required services using this
:download:`docker-compose-file <../../quickstart/docker.compose.yml>`:

:qs-async-apim-www: an nginx service as a single point of entry, see `nginx.conf`_ for exposed services
:qs-async-apim-admin-portal: the admin portal web server
:qs-async-apim-server: the portal server
:qs-async-apim-server-mongodb: the portal database
:qs-async-apim-connector: the connector
:qs-async-apim-connector-mongodb: the connector database


.. seealso::

  - `Quickstart`_ - quickstart directory in Repo.

The following figure shows the set-up of the containers:

.. figure:: ./images/async-apim.quickstart.png
   :width: 800

   Figure 1: Quickstart Docker Compose Container Setup


.. _Quickstart :
  https://github.com/solace-iot-team/async-apim/tree/main/quickstart

.. _nginx.conf :
  https://github.com/solace-iot-team/async-apim/blob/main/quickstart/docker-volumes/apim-www/nginx.conf
