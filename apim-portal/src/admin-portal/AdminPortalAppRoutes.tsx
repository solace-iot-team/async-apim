import { Route } from "react-router-dom";

import { ProtectedRoute } from "../auth/ProtectedRoute";
import { ProtectedRouteWithRbac } from "../auth/ProtectedRouteWithRbac";
import { ProtectedRouteWithRbacAndOrgAccess } from "../auth/ProtectedRouteWithRbacAndOrgAccess";
import { EUIAdminPortalResourcePaths } from '../utils/Globals';
import { AdminPortalUserHomePage } from "./pages/AdminPortalUserHomePage";
import { ManageUsersPage } from './pages/ManageOldUsersPage';
import { ManageOrganizationsPage } from "./pages/ManageOrganizationsPage";
import { ManageConnectorsPage } from "./pages/ManageConnectorsPage";
import { ManageSystemSettingsPage } from "./pages/ManageSystemSettingsPage";
import { MonitorSystemHealthPage } from "./pages/MonitorSystemHealthPage";
import { ManageOrgEnvironmentsPage } from "./pages/ManageOrgEnvironmentsPage";
import { ManageApisPage } from "./pages/ManageApisPage";
import { ManageApiProductsPage } from "./pages/ManageApiProductsPage";
import { ManageAppsPage } from './pages/ManageAppsPage';
import { AdminPortalHealthCheckViewPage } from "./pages/AdminPortalHealthCheckViewPage";
import { ManageOrgUsersPage } from "./pages/ManageOrgUsersPage";
import { ManageOrgSettingsPage } from "./pages/ManageOrgSettingsPage";
import { MonitorOrgStatusPage } from "./pages/MonitorOrgStatusPage";
import { ManageOrgIntegrationExternalSystemsPage } from "./pages/ManageOrgIntegrationExternalSystemsPage";
import { ManageOrgBusinessGroupsPage } from "./pages/ManageOrgBusinessGroupsPage";
import { ManageSystemUsersPage } from "./pages/ManageSystemUsersPage";

export const AdminPortalAppRoutes = (): Array<JSX.Element> => {
  // const componentName = 'AdminPortalAppRoutes';
  return (
    [
        <Route path={EUIAdminPortalResourcePaths.AdminPortalConnectorUnavailable} component={AdminPortalHealthCheckViewPage} exact key={EUIAdminPortalResourcePaths.AdminPortalConnectorUnavailable}/>,

        <ProtectedRoute path={EUIAdminPortalResourcePaths.UserHome} component={AdminPortalUserHomePage} exact key={EUIAdminPortalResourcePaths.UserHome}/>,
        /* System */
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemConfigConnectors} component={ManageConnectorsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemConfigConnectors} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemConfigSettings} component={ManageSystemSettingsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemConfigSettings} />,
        
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemUsers} component={ManageSystemUsersPage} exact key={EUIAdminPortalResourcePaths.ManageSystemUsers} />,

        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemOldUsers} component={ManageUsersPage} exact key={EUIAdminPortalResourcePaths.ManageSystemOldUsers} />,

        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemOrganizations} component={ManageOrganizationsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemOrganizations} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.MonitorSystemHealth} component={MonitorSystemHealthPage} exact key={EUIAdminPortalResourcePaths.MonitorSystemHealth} />,
        /* Organization */
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationSettings} component={ManageOrgSettingsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationSettings} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.MonitorOrganizationStatus} component={MonitorOrgStatusPage} exact key={EUIAdminPortalResourcePaths.MonitorOrganizationStatus} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationUsers} component={ManageOrgUsersPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationUsers} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationBusinessGroups} component={ManageOrgBusinessGroupsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationBusinessGroups} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationEnvironments} component={ManageOrgEnvironmentsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationEnvironments} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems} component={ManageOrgIntegrationExternalSystemsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems} />,
        /* API Team*/
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApis} component={ManageApisPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApis} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApiProducts} component={ManageApiProductsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApiProducts} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApps} component={ManageAppsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApps} />,
    ]
  );
}
