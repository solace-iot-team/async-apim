.. _managed-assets-overview:

Managed Assets Overview
=======================


General
+++++++

Managed assets are:

* :ref:`API Products<managed-assets-api-products>`


Revision History
++++++++++++++++

Managed asset revisions are tracked from one update to the next. Revision numbers are presented using semantic versioning.

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
:_AP_PUBLISH_DESTINATION_: comma separated list of external system Ids the asset is published to. if asset is not published, attribute is absent.


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
