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

A suggested approach for integration of assets is to subscribe to asset create/update/delete events.

Filtering:
----------

A suggested filtering approach:

* discard event if access level !== `public`
* discard event if attribute `_AP_BUSINESS_GROUP_EXTERNAL_SYSTEM_ID_` !== <configured external system>
* discard event if attribute: `_AP_LIFECYLE_STATE_` === `draft`


Extracting Lifecycle Status:
----------------------------

* extract value from attribute: `_AP_LIFECYLE_STATE_` (`released` or `deprecated`)

Extracting Business Group information:
--------------------------------------

* extract value from attribute: `_AP_BUSINESS_GROUP_OWNING_EXTERNAL_ID_`
* extract values from attribute `_AP_BUSINESS_GROUP_SHARING_LIST_`, see :ref:`managed-assets-overview-business-group-sharing-list` for details.

.. seealso::

  - :ref:`managed-assets-overview`
