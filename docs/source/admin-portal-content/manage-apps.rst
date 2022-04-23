.. _admin-portal-manage-apps:

Manage Apps
===========

List of Apps
++++++++++++

The list of apps that can be managed is determined by the following access rules:

Logged-in User must have role **API Team** in selected **Business Group**.

Apps included in the list:
--------------------------

- App is a team app and current business group id equals the team id
- App is a user app:

  - if App ownerId is member of current business group and has the role **API Consumer** 

If logged-in User also has the role **Organization Admin**:

- all apps that are owned by external users or teams, i.e. the app ownerId is NOT known to the Admin Portal


