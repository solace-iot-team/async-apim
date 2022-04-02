.. _integration-content-overview:

Integration Overview
====================


External Systems
++++++++++++++++

External Systems are registered with their ID and display name.


External Business Groups
++++++++++++++++++++++++

Business Groups can be imported by external system id.


Subscribing to Asset Change Events
++++++++++++++++++++++++++++++++++

.. An APP subscribing to Asset Change Events should:
..
.. * filter the events by `externalSystemId` value in

Extracting Business Group information:
--------------------------------------

* filter by attribute: `_AP_BUSINESS_GROUP_EXTERNAL_SYSTEM_ID_`
* extract value from attribute: `_AP_BUSINESS_GROUP_OWNING_EXTERNAL_ID_`


.. seealso::

  - :ref:`managed-assets-overview`
