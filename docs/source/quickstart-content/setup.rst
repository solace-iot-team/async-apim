.. _quickstart-content-setup:

Setup & Getting Started
=======================

Login
+++++

Login with the root user.

Create Admin User
+++++++++++++++++

As a first step, it is advisable to create a system admin user:

* Go to System > Users
* New:

  * Fill out the userId & profile info
  * Add System Role = System Admin
  * Ensure user is activated
  * Review & Create the user

* Logout
* Login with the new system admin user


Create Organization & Organization Users
++++++++++++++++++++++++++++++++++++++++

* Create a new Organization: System > Organizations

  * Using Solace Cloud, have the Solace Cloud Token ready

* Create Users: System > Users

  * Add users to your new Organization with the roles of

    * Organization Admin
    * API Team
    * API Consumer

Create Environments
+++++++++++++++++++

* Login with Organization Admin user
* Organization > Environments

  * Create a new Environment

Create API Product
+++++++++++++++++++

* Login with API Team user
* APIs

  * Create a new API and upload an Async API Spec

* API Products

  * Create a new API Product

    * choose the API Spec
    * choose the Environment
    * mark approval = auto

  * Mark API Product as released

Create App
+++++++++++

* Login with API Consumer user
* Explore API Products

  * You should see the released API Product

* Create a new App

  * Select the API Product

Your App is ready to use.
