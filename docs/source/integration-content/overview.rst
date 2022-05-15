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

* External system connectors should only import / publish assets that are in `released` stage AND its publish destination contains the correct external system id.
* If a previously imported asset changes stage to `deprecated` or `retired`, external system connectors should remove the asset.

**Adding an Asset to external systems:**

* check if attribute `_AP_PUBLISH_DESTINATION_` is present and contains <configured external system id>

  - add the asset if lifecycle stage === `released`


**Removing an Asset from external systems:**

* remove the asset if attribute `_AP_PUBLISH_DESTINATION_` is absent or does not contain <configured external system id>, regardless of stage.


Extracting Business Group information:
--------------------------------------

* extract value from attribute: `_AP_BUSINESS_GROUP_OWNING_EXTERNAL_ID_`
* extract values from attribute `_AP_BUSINESS_GROUP_SHARING_LIST_`, see :ref:`managed-assets-overview-business-group-sharing-list` for details.

.. seealso::

  - :ref:`managed-assets-overview`
