import { Route } from "react-router-dom";

import { ProtectedRoute } from "../auth/ProtectedRoute";
import { ProtectedRouteWithRbac } from "../auth/ProtectedRouteWithRbac";
import { ProtectedRouteWithRbacAndOrgAccess } from "../auth/ProtectedRouteWithRbacAndOrgAccess";
import { EUIAdminPortalResourcePaths } from '../utils/Globals';
import { AdminPortalUserHomePage } from "./pages/AdminPortalUserHomePage";
import { ManageUsersPage } from './pages/ManageUsersPage';
import { ManageOrganizationsPage } from "./pages/ManageOrganizationsPage";
import { ManageConnectorsPage } from "./pages/ManageConnectorsPage";
import { ManageSystemSettingsPage } from "./pages/ManageSystemSettingsPage";
import { MonitorSystemHealthPage } from "./pages/MonitorSystemHealthPage";
import { ManageEnvironmentsPage } from "./pages/ManageEnvironmentsPage";
import { ManageApisPage } from "./pages/ManageApisPage";
import { ManageApiProductsPage } from "./pages/ManageApiProductsPage";
import { ManageAppsPage } from './pages/ManageAppsPage';
import { AdminPortalHealthCheckViewPage } from "./pages/AdminPortalHealthCheckViewPage";

export const AdminPortalAppRoutes = (): Array<JSX.Element> => {
  // const componentName = 'AdminPortalAppRoutes';
  return (
    [
        <Route path={EUIAdminPortalResourcePaths.AdminPortalConnectorUnavailable} component={AdminPortalHealthCheckViewPage} exact key={EUIAdminPortalResourcePaths.AdminPortalConnectorUnavailable}/>,

        <ProtectedRoute path={EUIAdminPortalResourcePaths.UserHome} component={AdminPortalUserHomePage} exact key={EUIAdminPortalResourcePaths.UserHome}/>,
        /* System */
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemConfigConnectors} component={ManageConnectorsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemConfigConnectors} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemConfigSettings} component={ManageSystemSettingsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemConfigSettings} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemUsers} component={ManageUsersPage} exact key={EUIAdminPortalResourcePaths.ManageSystemUsers} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemOrganizations} component={ManageOrganizationsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemOrganizations} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.MonitorSystemHealth} component={MonitorSystemHealthPage} exact key={EUIAdminPortalResourcePaths.MonitorSystemHealth} />,
        /* Organization */
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationEnvironments} component={ManageEnvironmentsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationEnvironments} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApis} component={ManageApisPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApis} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApiProducts} component={ManageApiProductsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApiProducts} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApps} component={ManageAppsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApps} />,
    ]
  );
}
