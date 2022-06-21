.. _quickstart-content-installation:

Installation
============

This guide describes the `Quickstart`_ which is part of the project repo.

The installation starts all required services using this
:download:`docker-compose-file <../../../quickstart/docker.compose.yml>`:

:qs-async-apim-www: an nginx service as a single point of entry, see `nginx.conf`_ for exposed services
:qs-async-apim-admin-portal: the admin and developer portal web server
:qs-async-apim-server: the portal server
:qs-async-apim-server-mongodb: the portal database
:qs-async-apim-connector: the connector
:qs-async-apim-connector-mongodb: the connector database

.. seealso::

  - `Quickstart`_ - quickstart directory in Repo.

Prerequisites
+++++++++++++

The quickstart requires the following components:

- nodejs, version 16.x
- docker
- docker-compose

Setup
+++++

At start-up, the APIM Server creates a `root` user based on these environment variables, which can be found in the `start.sh`_.
All other variables are set directly in the `docker.compose.yml`_ file.


.. note::

  Change the default root user & password in `start.sh`_.


.. code-block:: bash

  # Note: change these
  export APIM_SERVER_ROOT_USER="root.admin@async-apim-quickstart.com"
  export APIM_SERVER_ROOT_USER_PWD="admin123!"


Start, Stop, Update
+++++++++++++++++++

Change to the `Quickstart`_ directory.

Start:

.. code-block:: bash

  ./start.sh


Stop:

.. code-block:: bash

  ./stop.sh

Update:

If you want to start with clean APIM Server & Connector databases, run:

.. code-block:: bash

  ./stop.sh
  ./clean.sh

Now start the system again:

.. code-block:: bash

  ./start.sh

Connect
+++++++

By default, the `docker.compose.yml`_ creates an NGINX container serving as a reverse proxy on port `5000`.

Use the following URL in your browser: `http://{ip-address}:5000`.

Additional exposed ports are:

- `5001` - APIM Connector
- `5002` - APIM Server

Details
+++++++

The following figure shows the set-up of the containers:

.. figure:: ../images/async-apim.quickstart.containers.png
   :width: 800

   Figure 1: Quickstart Docker Compose Container Setup


**Browser connections:**

Note that the portal app uses the APIM Server as a proxy for the APIM Connector with the following URL: `/apim-server/v1/connectorProxy/v1`.

.. figure:: ../images/async-apim.quickstart.connect.png
   :width: 800

   Figure 2: Quickstart Browser Connections



.. _Quickstart :
  https://github.com/solace-iot-team/async-apim/tree/main/quickstart

.. _nginx.conf :
  https://github.com/solace-iot-team/async-apim/blob/main/quickstart/docker-volumes/apim-www/nginx.conf

.. _start.sh :
  https://github.com/solace-iot-team/async-apim/blob/main/quickstart/start.sh

.. _docker.compose.yml :
  https://github.com/solace-iot-team/async-apim/blob/main/quickstart/docker.compose.yml
