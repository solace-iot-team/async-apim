.. _managed-assets-overview:

Managed Assets Overview
=======================


General
+++++++

Managed assets are:

* API Products


Versioning
++++++++++

Managed assets are versioned using semantic versioning.

* each update requires a new version of the asset

Attributes
++++++++++

Assets are tagged with the following, reserved attributes:

:_AP_ASSET_OWNER_ID_: the owner id the asset belongs to
:_AP_BUSINESS_GROUP_OWNING_ID_: the internal business group Id the asset belongs to
:_AP_BUSINESS_GROUP_OWNING_DISPLAY_NAME_: the internal business group display name the asset belongs to
:_AP_BUSINESS_GROUP_OWNING_EXTERNAL_ID_: the external system's business group id, if the business group was imported from an external system
:_AP_BUSINESS_GROUP_OWNING_EXTERNAL_DISPLAY_NAME_: the external system's business group display name, if the business group was imported from an external system
:_AP_BUSINESS_GROUP_EXTERNAL_SYSTEM_ID_: the external system's id the external business group information relates to
:_AP_BUSINESS_GROUP_SHARING_LIST_: list of business group information the asset is shared with. see below for details.
:_AP_LIFECYLE_STATE_: state of the asset. values: `draft`, `released`, `deprecated`

.. seealso::

  - :ref:`integration-content-overview`
  - :ref:`managed-assets-api-products`

.. _managed-assets-overview-business-group-sharing-list:

Business Group Sharing List
+++++++++++++++++++++++++++

The attribute `_AP_BUSINESS_GROUP_SHARING_LIST_` contains a list of JSON objects with the following
:download:`schema <../../../apim-portal/src/displayServices/schemas/APManagedAssetDisplay_BusinessGroupSharing_Schema.json>`.

:apEntityId.id: the id of the business group the asset is shared with
:apEntityId.displayName: the display name of the business group the asset is shared with
:apSharingAccessType: the access granted, values `readonly`, `full-access`
:apExternalReference: contains information about the external system if the business group was imported from an external system
:apExterenalReference.externalId: the business group id in the external system
:apExterenalReference.displayName: the business group display name in the external system
:apExterenalReference.externalSystemId: the id of the external system
:apExterenalReference.externalSystemdisplayName: the display name of the external system
