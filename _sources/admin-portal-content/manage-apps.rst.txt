.. _admin-portal-manage-apps:

Manage Apps
===========

Apps can be managed only by users who have the role **API Team** in current business group.

List of Apps
++++++++++++

The list of apps that can be managed is determined by the following access rules:

* Logged-in user must have role **API Team** in selected **Business Group**.
* If logged-in user also has role **Organization Admin**, they can manage all organization apps.

Apps included in the list
-------------------------

- App is a team app and current business group id equals the team id
- App is a user app:

  - if App ownerId is member of current business group and has the role **API Consumer**

If logged-in user also has the role **Organization Admin**:

- all apps that are owned by external users or teams, i.e. the app ownerId is NOT known to the Admin Portal
- can select to view all organization apps or just the current business group apps


Calculation of App Status
+++++++++++++++++++++++++

Each App has a **Status** with the following possible values:

:live: App is live and all associated API Products are live
:approval pending: one or more associated API Products in the App are not live (could be waiting for approval or approval has been revoked)
:No API Products: App does not contain any API Products


Mapping of Status for Legacy Apps
---------------------------------

Legacy Apps do not indicate a status per API Product. In this case, the following mapping rules apply:

.. list-table:: Status Mapping for Legacy Apps
  :widths: 50 50 50 50
  :header-rows: 1

  * - Legacy App Status
    - API Product Approval Type
    - Portal App Status
    - Portal API Product Status
  * - approved
    - auto or manual
    - live
    - live
  * - pending
    - auto or manual
    - approval pending
    - approval pending
  * - revoked
    - auto or manual
    - approval pending
    - approval revoked
