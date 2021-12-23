import { Route } from "react-router-dom";

import { ProtectedRouteWithRbacAndOrgAccess } from "../auth/ProtectedRouteWithRbacAndOrgAccess";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { EUIDeveloperPortalResourcePaths } from '../utils/Globals';

import { DeveloperPortalUserHomePage } from "./pages/DeveloperPortalUserHomePage";
import { DeveloperPortalManageUserAppsPage } from "./pages/DeveloperPortalManageUserAppsPage";
import { ManageTeamApplicationsPage } from "./pages/ManageTeamApplicationsPage";
import { DeveloperPortalExploreApiProductsPage } from "./pages/DeveloperPortalExploreApiProductsPage";
import { DeveloperPortalExploreApisPage } from "./pages/DeveloperPortalExploreApisPage";
import { DeveloperPortalHealthCheckViewPage } from "./pages/DeveloperPortalHealthCheckViewPage";

export const DeveloperPortalAppRoutes = (): Array<JSX.Element> => {
  // const componentName = 'DeveloperPortalAppRoutes';
  return (
    [
      <Route path={EUIDeveloperPortalResourcePaths.DeveloperPortalConnectorUnavailable} component={DeveloperPortalHealthCheckViewPage} exact key={EUIDeveloperPortalResourcePaths.DeveloperPortalConnectorUnavailable}/>,
      <ProtectedRoute path={EUIDeveloperPortalResourcePaths.UserHome} component={DeveloperPortalUserHomePage} exact key={EUIDeveloperPortalResourcePaths.UserHome}/>,
      <ProtectedRouteWithRbacAndOrgAccess path={EUIDeveloperPortalResourcePaths.ExploreApiProducts} component={DeveloperPortalExploreApiProductsPage} exact key={EUIDeveloperPortalResourcePaths.ExploreApiProducts} />,
      <ProtectedRouteWithRbacAndOrgAccess path={EUIDeveloperPortalResourcePaths.ExploreApis} component={DeveloperPortalExploreApisPage} exact key={EUIDeveloperPortalResourcePaths.ExploreApis} />,
      <ProtectedRouteWithRbacAndOrgAccess path={EUIDeveloperPortalResourcePaths.ManageUserApplications} component={DeveloperPortalManageUserAppsPage} exact key={EUIDeveloperPortalResourcePaths.ManageUserApplications} />,
      <ProtectedRouteWithRbacAndOrgAccess path={EUIDeveloperPortalResourcePaths.ManageTeamApplications} component={ManageTeamApplicationsPage} exact key={EUIDeveloperPortalResourcePaths.ManageTeamApplications} />,
    ]
  );
}
