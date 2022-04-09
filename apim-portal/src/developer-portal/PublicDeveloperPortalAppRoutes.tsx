import { Route } from "react-router-dom";

import { EUIDeveloperPortalResourcePaths, EUIPublicDeveloperPortalResourcePaths } from '../utils/Globals';
import { DeveloperPortalExplorePublicApiProductsPage } from "./pages/DeveloperPortalExplorePublicApiProductsPage";
import { DeveloperPortalHealthCheckViewPage } from "./pages/DeveloperPortalHealthCheckViewPage";
import { PublicDeveloperPortalWelcomePage } from "./pages/PublicDeveloperPortalWelcomePage";

export const PublicDeveloperPortalAppRoutes = (): Array<JSX.Element> => {
  // const componentName = 'PublicDeveloperPortalAppRoutes';
  return (
    [
      <Route path={EUIDeveloperPortalResourcePaths.DeveloperPortalConnectorUnavailable} component={DeveloperPortalHealthCheckViewPage} exact key={EUIDeveloperPortalResourcePaths.DeveloperPortalConnectorUnavailable}/>,
      
      <Route path={EUIPublicDeveloperPortalResourcePaths.Welcome} component={PublicDeveloperPortalWelcomePage} exact key={EUIPublicDeveloperPortalResourcePaths.Welcome}/>,

      <Route path={EUIPublicDeveloperPortalResourcePaths.ExploreApiProducts} component={DeveloperPortalExplorePublicApiProductsPage} exact key={EUIPublicDeveloperPortalResourcePaths.ExploreApiProducts} />,


      // <ProtectedRouteWithRbacAndOrgAccess path={EUIDeveloperPortalResourcePaths.ExploreApiProducts} component={DeveloperPortalExploreApiProductsPage} exact key={EUIDeveloperPortalResourcePaths.ExploreApiProducts} />,
    ]
  );
}
