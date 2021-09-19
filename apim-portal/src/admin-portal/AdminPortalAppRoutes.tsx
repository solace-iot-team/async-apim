import React from "react";

import { ProtectedRoute } from "../auth/ProtectedRoute";
import { ProtectedRouteWithRbac } from "../auth/ProtectedRouteWithRbac";
import { ProtectedRouteWithRbacAndOrgAccess } from "../auth/ProtectedRouteWithRbacAndOrgAccess";
import { EUIAdminPortalResourcePaths } from '../utils/Globals';
import { AdminPortalUserHomePage } from "./pages/AdminPortalUserHomePage";
import { ManageUsersPage } from './pages/ManageUsersPage';
import { ManageOrganizationsPage } from "./pages/ManageOrganizationsPage";
import { ManageConnectorsPage } from "./pages/ManageConnectorsPage";
import { ManageSystemSettingsPage } from "./pages/ManageSystemSettingsPage";
import { ViewSystemHealthPage } from "./pages/ViewSystemHealthPage";
import { ManageEnvironmentsPage } from "./pages/ManageEnvironmentsPage";
import { ManageApisPage } from "./pages/ManageApisPage";

export const AdminPortalAppRoutes = (): Array<JSX.Element> => {
  // const componentName = 'AdminPortalAppRoutes';
  return (
    [
        <ProtectedRoute path={EUIAdminPortalResourcePaths.UserHome} component={AdminPortalUserHomePage} exact key={EUIAdminPortalResourcePaths.UserHome}/>,
        /* System */
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemConfigConnectors} component={ManageConnectorsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemConfigConnectors} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemConfigSettings} component={ManageSystemSettingsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemConfigSettings} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemUsers} component={ManageUsersPage} exact key={EUIAdminPortalResourcePaths.ManageSystemUsers} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemOrganizations} component={ManageOrganizationsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemOrganizations} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.MonitorSystemHealth} component={ViewSystemHealthPage} exact key={EUIAdminPortalResourcePaths.MonitorSystemHealth} />,
        /* Organization */
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationEnvironments} component={ManageEnvironmentsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationEnvironments} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApis} component={ManageApisPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApis} />,
    ]
  );
}
