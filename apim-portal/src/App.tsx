import React from "react";
import { useHistory } from 'react-router-dom';

import { Route, Switch } from 'react-router-dom';
import { Config } from "./Config";
import { EUIResourcePaths, EUIEmbeddableResourcePaths, EUIDeveloperToolsResourcePaths } from './utils/Globals';
import { ProtectedRouteWithRbac } from "./auth/ProtectedRouteWithRbac";
import { ProtectedRouteWithRbacAndOrgAccess } from "./auth/ProtectedRouteWithRbacAndOrgAccess";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { HomePage } from './pages/HomePage';
import { UserHomePage } from './pages/UserHomePage';
import { UserLoginPage } from './pages/UserLoginPage';
import { ManageUsersPage } from './pages/ManageUsersPage';
import { ManageOrganizationsPage } from './pages/ManageOrganizationsPage';
import { ManageConnectorsPage } from './pages/ManageConnectorsPage';
import { ManageSystemSettingsPage } from './pages/ManageSystemSettingsPage';
import { ViewSystemHealthPage } from "./pages/ViewSystemHealthPage";
import { ManageUserAccountPage } from "./pages/ManageUserAccountPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { NoOrganizationPage } from "./pages/NoOrganizationPage";
import { NotFoundPage } from './pages/NotFoundPage';
import { NavBar } from './components/NavBar/NavBar';
import { SideBar } from './components/SideBar/SideBar';
import { ShowUserMessage } from "./components/ShowUserMessage/ShowUserMessage";
import { ManageEnvironmentsPage } from "./pages/ManageEnvironmentsPage";
// * Developer Portal *
import { DeveloperPortalSideBar } from "./developer-portal/components/DeveloperPortalSideBar/DeveloperPortalSideBar";
import { DeveloperPortalHomePage } from "./developer-portal/pages/DeveloperPortalHomePage";
import { DeveloperPortalManageApplicationsPage } from "./developer-portal/pages/DeveloperPortalManageApplicationsPage";
import { DeveloperPortalViewProductCatalogPage } from "./developer-portal/pages/DeveloperPortalViewProductCatalogPage";
// * Developer Tools *
import { BootstrapUsersPage } from "./pages/devel/BootstrapUsersPage";
import { BootstrapConnectorsPage } from "./pages/devel/BootstrapConnectorsPage";
import { BootstrapOrganizationsPage } from "./pages/devel/BootstrapOrganizationsPage";
import { RolesTestPage } from "./pages/devel/RolesTestPage";
import { ContextsTestPage } from "./pages/devel/ContextsTestPage";
// * Embedded Components *
import { EmbeddableDeveloperConfigureAppPortalPage } from "./embeddable/portal-pages/EmbeddableDeveloperConfigureAppPortalPage";

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';

const App: React.FC = () => {
  // const componentName = 'App';
  
  enum E_APP_STATE {
    ADMIN_PORTAL = "ADMIN_PORTAL",
    DEVELOPER_PORTAL = "DEVELOPER_PORTAL"
  }

  const [appState, setAppState] = React.useState<E_APP_STATE>(E_APP_STATE.ADMIN_PORTAL);
  const [showDeveloperPortal, setShowDeveloperPortal] = React.useState<boolean>(false);
  const [showAdminPortal, setShowAdminPortal] = React.useState<boolean>(false);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [showDeveloperTools, setShowDeveloperTools] = React.useState<boolean>(Config.getUseDevelTools());
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [showEmbeddablePages, setShowEmbeddablePages] = React.useState<boolean>(Config.getUseEmbeddablePages());
  const history = useHistory();

  const navigateTo = (path: string): void => { history.push(path); }

  React.useEffect(() => {
    calculateShowStates(appState);
  }, [appState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSwitchToDeveloperPortal = () => {
    setAppState(E_APP_STATE.DEVELOPER_PORTAL);
    navigateTo(EUIResourcePaths.DeveloperPortalHome);
  }

  const onSwitchToAdminPortal = () => {
    setAppState(E_APP_STATE.ADMIN_PORTAL);
    navigateTo(EUIResourcePaths.Home);
  }

  const calculateShowStates = (appState: E_APP_STATE) => {
    if(appState === E_APP_STATE.ADMIN_PORTAL) {
      setShowAdminPortal(true);
      setShowDeveloperPortal(false);
    }
    else if (appState === E_APP_STATE.DEVELOPER_PORTAL) {
      setShowAdminPortal(false);
      setShowDeveloperPortal(true);
    }
  }

  const renderDeveloperPortal = () => {

    return (
      <div className="ap-app-grid">
        <div className="ap-app-grid-left">
          <DeveloperPortalSideBar onSwitchToAdminPortal={onSwitchToAdminPortal}/>
        </div>
        <div className="ap-app-grid-right">
          <div id="page-body">
            <Switch>
              {/* Misc Public */}
              <Route path={EUIResourcePaths.DeveloperPortalHome} component={DeveloperPortalHomePage} exact />
              <Route path={EUIResourcePaths.Unauthorized} component={UnauthorizedPage} exact />
              <Route path={EUIResourcePaths.NoOrganization} component={NoOrganizationPage} exact />

              {/* User */}
              <ProtectedRouteWithRbac path={EUIResourcePaths.ManageUserAccount} component={ManageUserAccountPage} exact />
              
              {/* Organization/DeveloperPortal */}
              <Route path={EUIResourcePaths.DeveloperPortalHome} component={DeveloperPortalHomePage} exact />
              {/* <ProtectedRouteWithRbac path={EUIResourcePaths.DeveloperPortalUserHome} component={DeveloperPortalUserHomePage} exact /> */}
              <ProtectedRouteWithRbacAndOrgAccess path={EUIResourcePaths.DeveloperPortalViewProductCatalog} component={DeveloperPortalViewProductCatalogPage} exact />
              <ProtectedRouteWithRbacAndOrgAccess path={EUIResourcePaths.DeveloperPortalManageApplications} component={DeveloperPortalManageApplicationsPage} exact />

              {/* Catch all */}
              <Route component={NotFoundPage} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }

  const renderAdminPortal = () => {
    // const funcName = 'renderAdminPortal';
    // const logName = `${componentName}.${funcName}()`;
    return (
      <div className="ap-app-grid">
        <div className="ap-app-grid-left">
          <SideBar onSwitchToDeveloperPortal={onSwitchToDeveloperPortal} />
        </div>
        <div className="ap-app-grid-right">
          <div id="page-body">
            <Switch>
              {/* Misc Public */}
              <Route path={EUIResourcePaths.Home} component={HomePage} exact />
              <Route path={EUIResourcePaths.Unauthorized} component={UnauthorizedPage} exact />
              <Route path={EUIResourcePaths.NoOrganization} component={NoOrganizationPage} exact />

              {/* User */}
              <Route path={EUIResourcePaths.Login} component={UserLoginPage} exact />
              <ProtectedRoute path={EUIResourcePaths.UserHome} component={UserHomePage} exact />
              <ProtectedRouteWithRbac path={EUIResourcePaths.ManageUserAccount} component={ManageUserAccountPage} exact />

              {/* System */}
              <ProtectedRouteWithRbac path={EUIResourcePaths.ManageSystemUsers} component={ManageUsersPage} exact />
              <ProtectedRouteWithRbac path={EUIResourcePaths.ManageSystemOrganizations} exact component={ManageOrganizationsPage} />
              <ProtectedRouteWithRbac path={EUIResourcePaths.ManageSystemConfigConnectors} exact component={ManageConnectorsPage} />
              <ProtectedRouteWithRbac path={EUIResourcePaths.ManageSystemConfigSettings} exact component={ManageSystemSettingsPage} />
              <ProtectedRouteWithRbac path={EUIResourcePaths.MonitorSystemHealth} exact component={ViewSystemHealthPage} />
              
              {/* Organization */}
              <ProtectedRouteWithRbacAndOrgAccess path={EUIResourcePaths.ManageOrganizationEnvironments} component={ManageEnvironmentsPage} exact />

              {/* Embedded Components */}
              { showEmbeddablePages && 
                [
                  <Route path={EUIEmbeddableResourcePaths.DeveloperAppConfigure} key={EUIEmbeddableResourcePaths.DeveloperAppConfigure} component={EmbeddableDeveloperConfigureAppPortalPage} exact/>
                ]
              }

              {/* Developer Tools */}
              { showDeveloperTools && 
                [
                  <ProtectedRouteWithRbac path={EUIDeveloperToolsResourcePaths.TestRoles} key={EUIDeveloperToolsResourcePaths.TestRoles} component={RolesTestPage} exact />,
                  <Route path={EUIDeveloperToolsResourcePaths.BootstrapOrganizations} key={EUIDeveloperToolsResourcePaths.BootstrapOrganizations} component={BootstrapOrganizationsPage} exact />,
                  <Route path={EUIDeveloperToolsResourcePaths.BootstrapUsers} key={EUIDeveloperToolsResourcePaths.BootstrapUsers} component={BootstrapUsersPage} exact />,
                  <Route path={EUIDeveloperToolsResourcePaths.BootstrapConnectors} key={EUIDeveloperToolsResourcePaths.BootstrapConnectors} component={BootstrapConnectorsPage} exact />,
                  <Route path={EUIDeveloperToolsResourcePaths.ViewContexts} key={EUIDeveloperToolsResourcePaths.ViewContexts} component={ContextsTestPage} exact />,
                ]
              }

              {/* Catch all */}
              <Route component={NotFoundPage} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ShowUserMessage />
      <NavBar />
      {showDeveloperPortal && 
        renderDeveloperPortal()
      }
      {showAdminPortal && 
        renderAdminPortal()
      }
    </React.Fragment>
  );
}

export default App;
