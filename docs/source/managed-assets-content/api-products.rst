.. _managed-assets-api-products:

API Products
============


Access Level
++++++++++++

API Products have an access level property with the following values:

:private: the API Product can only be viewed within the owning business group (unless shared with other business groups)
:internal: the API Product can be viewed by everybody who is logged in
:public: the API Product can be viewed in public marketplaces, regardless of login status


Lifecycle Stage
+++++++++++++++

API Products have a lifecycle stage property with the following values:

:draft: the API Product is in draft mode, Apps cannot add it
:released: the API Product is released, Apps can add it and it can be published to marketplaces
:deprecated: the API Product is deprecated, Apps which already include it are unaffected, but it cannot be added any more
:retired: the API Product is retired. It will be deprovisioned automatically from all Apps that include it


Managing API Products
+++++++++++++++++++++

View API Product
----------------

* user is member of the business group with roles `API Team`

Create API Product
------------------

* user is member of the business group with roles `API Team`

Update API Product
------------------

* user is member of the business group with roles `API Team`

Delete API Product
------------------

* user is member of the business group with roles `API Team`
* note: an API Product cannot be deleted if APPs reference it

Change Owner of API Product
---------------------------

* user owns the API Product
* user has role of `Organization Administrator`

Share with Business Groups
--------------------------

* user can share with other business groups if they are member of the target business group with role `API Team`



.. seealso::

  - :ref:`managed-assets-overview`
