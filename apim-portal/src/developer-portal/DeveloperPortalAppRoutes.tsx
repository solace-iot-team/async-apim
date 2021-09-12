import React from "react";

import { ProtectedRouteWithRbacAndOrgAccess } from "../auth/ProtectedRouteWithRbacAndOrgAccess";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { EUIDeveloperPortalResourcePaths } from '../utils/Globals';

import { DeveloperPortalUserHomePage } from "./pages/DeveloperPortalUserHomePage";
import { DeveloperPortalViewProductCatalogPage } from "./pages/DeveloperPortalViewProductCatalogPage";
import { ManageUserApplicationsPage } from "./pages/ManageUserApplicationsPage";
import { ManageTeamApplicationsPage } from "./pages/ManageTeamApplicationsPage";

export const DeveloperPortalAppRoutes = (): Array<JSX.Element> => {
  // const componentName = 'DeveloperPortalAppRoutes';
  return (
    [
      <ProtectedRoute path={EUIDeveloperPortalResourcePaths.UserHome} component={DeveloperPortalUserHomePage} exact key={EUIDeveloperPortalResourcePaths.UserHome}/>,
      <ProtectedRouteWithRbacAndOrgAccess path={EUIDeveloperPortalResourcePaths.ViewProductCatalog} component={DeveloperPortalViewProductCatalogPage} exact key={EUIDeveloperPortalResourcePaths.ViewProductCatalog} />,
      <ProtectedRouteWithRbacAndOrgAccess path={EUIDeveloperPortalResourcePaths.ManageUserApplications} component={ManageUserApplicationsPage} exact key={EUIDeveloperPortalResourcePaths.ManageUserApplications} />,
      <ProtectedRouteWithRbacAndOrgAccess path={EUIDeveloperPortalResourcePaths.ManageTeamApplications} component={ManageTeamApplicationsPage} exact key={EUIDeveloperPortalResourcePaths.ManageTeamApplications} />,
    ]
  );
}
