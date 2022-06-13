import { Route } from "react-router-dom";

import { ProtectedRoute } from "../auth/ProtectedRoute";
import { ProtectedRouteWithRbac } from "../auth/ProtectedRouteWithRbac";
import { ProtectedRouteWithRbacAndOrgAccess } from "../auth/ProtectedRouteWithRbacAndOrgAccess";
import { EUIAdminPortalResourcePaths } from '../utils/Globals';
import { AdminPortalUserHomePage } from "./pages/AdminPortalUserHomePage";
import { ManageConnectorsPage } from "./pages/ManageConnectorsPage";
import { ManageSystemSettingsPage } from "./pages/ManageSystemSettingsPage";
import { MonitorSystemHealthPage } from "./pages/MonitorSystemHealthPage";

import { ManageAppsPage } from "./pages/ManageAppsPage";
// import { ManageApisPage } from "./pages/ManageApisPage";

import { AdminPortalHealthCheckViewPage } from "./pages/AdminPortalHealthCheckViewPage";
import { ManageOrgUsersPage } from "./pages/ManageOrgUsersPage";
import { ManageOrgEnvironmentsPage } from "./pages/ManageOrgEnvironmentsPage";
import { ManageOrgAssetMaintenanceApiProductsPage } from "./pages/ManageOrgAssetMaintenanceApiProductsPage";
import { ManageOrgAssetMaintenanceApisPage } from "./pages/ManageOrgAssetMaintenanceApisPage";
import { ManageOrgIntegrationExternalSystemsPage } from "./pages/ManageOrgIntegrationExternalSystemsPage";
import { ManageOrgBusinessGroupsPage } from "./pages/ManageOrgBusinessGroupsPage";
import { MonitorOrganizationStatusPage } from "./pages/MonitorOrganizationStatusPage";
import { ManageOrganizationSettingsPage } from "./pages/ManageOrganizationSettingsPage";

import { ManageSystemUsersPage } from "./pages/ManageSystemUsersPage";
import { ManageSystemOrganizationsPage } from "./pages/ManageSystemOrganizationsPage";
import { ManageApisPage } from "./pages/ManageApisPage";
import { ManageApiProductsPage } from "./pages/ManageApiProductsPage";

// DELETEME
// import { ManageAppsPage as deleteme_ManageAppsPage} from './pages/deleteme.ManageAppsPage';
// import { ManageApisPage as deleteme_ManageApisPage} from "./pages/deleteme_ManageApisPage";



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
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.ManageSystemOrganizations} component={ManageSystemOrganizationsPage} exact key={EUIAdminPortalResourcePaths.ManageSystemOrganizations} />,
        <ProtectedRouteWithRbac path={EUIAdminPortalResourcePaths.MonitorSystemHealth} component={MonitorSystemHealthPage} exact key={EUIAdminPortalResourcePaths.MonitorSystemHealth} />,
        /* Organization */
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationSettings} component={ManageOrganizationSettingsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationSettings} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.MonitorOrganizationStatus} component={MonitorOrganizationStatusPage} exact key={EUIAdminPortalResourcePaths.MonitorOrganizationStatus} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationUsers} component={ManageOrgUsersPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationUsers} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationBusinessGroups} component={ManageOrgBusinessGroupsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationBusinessGroups} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationEnvironments} component={ManageOrgEnvironmentsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationEnvironments} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems} component={ManageOrgIntegrationExternalSystemsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApiProducts} component={ManageOrgAssetMaintenanceApiProductsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApiProducts} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApis} component={ManageOrgAssetMaintenanceApisPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApis} />,
        /* API Team*/
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApis} component={ManageApisPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApis} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApiProducts} component={ManageApiProductsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApiProducts} />,
        <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.ManageOrganizationApps} component={ManageAppsPage} exact key={EUIAdminPortalResourcePaths.ManageOrganizationApps} />,

        // // DELETEME
        // <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.DELETEME_ManageOrganizationApps} component={deleteme_ManageAppsPage} exact key={EUIAdminPortalResourcePaths.DELETEME_ManageOrganizationApps} />,
        // <ProtectedRouteWithRbacAndOrgAccess path={EUIAdminPortalResourcePaths.deleteme_ManageOrganizationApis} component={deleteme_ManageApisPage} exact key={EUIAdminPortalResourcePaths.deleteme_ManageOrganizationApis} />,





    ]
  );
}
