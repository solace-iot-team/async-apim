import React from "react";
import { useHistory, Route, Switch } from 'react-router-dom';

import { Config } from "./Config";
import { UserContext } from './components/UserContextProvider/UserContextProvider';

// * Admin Portal *
import { AdminPortalHomePage } from "./admin-portal/pages/AdminPortalHomePage";
import { AdminPortalAppRoutes } from "./admin-portal/AdminPortalAppRoutes";
import { AdminPortalSideBar } from "./admin-portal/components/AdminPortalSideBar/AdminPortalSideBar";
// * Developer Portal *
import { DeveloperPortalHomePage } from "./developer-portal/pages/DeveloperPortalHomePage";
import { DeveloperPortalAppRoutes } from "./developer-portal/DeveloperPortalAppRoutes";
import { DeveloperPortalSideBar } from "./developer-portal/components/DeveloperPortalSideBar/DeveloperPortalSideBar";

import { EUIEmbeddableResourcePaths, EUIDeveloperToolsResourcePaths, EUICommonResourcePaths, EUIAdminPortalResourcePaths, EUIDeveloperPortalResourcePaths, EAppState, TLocationStateAppState } from './utils/Globals';
import { ProtectedRouteWithRbac } from "./auth/ProtectedRouteWithRbac";
import { HomePage } from './pages/HomePage';
import { UserLoginPage } from './pages/UserLoginPage';
import { ManageUserAccountPage } from "./pages/ManageUserAccountPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { NoOrganizationPage } from "./pages/NoOrganizationPage";
import { NotFoundPage } from './pages/NotFoundPage';
import { NavBar } from './components/NavBar/NavBar';
import { ShowUserMessage } from "./components/ShowUserMessage/ShowUserMessage";
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
  const componentName = 'App';
  
  const IS_DEBUG: boolean = true;

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [isDebug, setIsDebug] = React.useState<boolean>(IS_DEBUG);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [showDeveloperPortal, setShowDeveloperPortal] = React.useState<boolean>(false);
  const [showAdminPortal, setShowAdminPortal] = React.useState<boolean>(false);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [showDeveloperTools, setShowDeveloperTools] = React.useState<boolean>(Config.getUseDevelTools());
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [showEmbeddablePages, setShowEmbeddablePages] = React.useState<boolean>(Config.getUseEmbeddablePages());
  const appPortalHistory = useHistory<TLocationStateAppState>();

  const navigateToWithoutStateChange = (path: string): void => { 
    appPortalHistory.push({
      pathname: path,
      state: {
        setAppState: false
      }
    }); 
  }

  React.useEffect(() => {
    calculateShowStates(userContext.currentAppState);
  }, [userContext.currentAppState]); 

  const onSwitchToDeveloperPortal = () => {
    const funcName = 'onSwitchToDeveloperPortal';
    const logName = `${componentName}.${funcName}()`;
    if(userContext.originAppState === EAppState.UNDEFINED) throw new Error(`${logName}: userContext.orginAppState=${userContext.originAppState}`);
    // leave origin, set current
    dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: EAppState.DEVELOPER_PORTAL});
    navigateToWithoutStateChange(EUIDeveloperPortalResourcePaths.Home);
  }

  const onSwitchToAdminPortal = () => {
    const funcName = 'onSwitchToAdminPortal';
    const logName = `${componentName}.${funcName}()`;
    if(userContext.originAppState === EAppState.UNDEFINED) throw new Error(`${logName}: userContext.orginAppState=${userContext.originAppState}`);
    // leave origin, set current
    dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: EAppState.ADMIN_PORTAL});
    navigateToWithoutStateChange(EUIAdminPortalResourcePaths.Home);
  }

  const calculateShowStates = (appState: EAppState) => {
    if(appState === EAppState.ADMIN_PORTAL) {
      setShowAdminPortal(true);
      setShowDeveloperPortal(false);
    }
    else if (appState === EAppState.DEVELOPER_PORTAL) {
      setShowAdminPortal(false);
      setShowDeveloperPortal(true);
    }
  }

  const displayStateInfo = () => {
    return (
      <p>
        userContext.originAppState={userContext.originAppState}, 
        userContext.currentAppState={userContext.currentAppState}, 
        showDeveloperPortal={String(showDeveloperPortal)}, 
        showAdminPortal={String(showAdminPortal)}
      </p>  
    );
  }

  return (
    <React.Fragment>
      <ShowUserMessage />
      <NavBar />
      {/* { isDebug && userContext && displayStateInfo() } */}
      <div className="ap-app-grid">
        <div className="ap-app-grid-left">
          {showDeveloperPortal &&
            <DeveloperPortalSideBar onSwitchToAdminPortal={onSwitchToAdminPortal} />
          }
          {showAdminPortal && 
            <AdminPortalSideBar onSwitchToDeveloperPortal={onSwitchToDeveloperPortal} />          
          }
        </div>
        <div className="ap-app-grid-right">
          <div id="page-body">
            <Switch>

              {/* Misc Public */}
              <Route path={EUICommonResourcePaths.Home} component={HomePage} exact />
              <Route path={EUIAdminPortalResourcePaths.Home} component={AdminPortalHomePage} exact />
              <Route path={EUIDeveloperPortalResourcePaths.Home} component={DeveloperPortalHomePage} exact />
              <Route path={EUICommonResourcePaths.Unauthorized} component={UnauthorizedPage} exact />
              <Route path={EUICommonResourcePaths.NoOrganization} component={NoOrganizationPage} exact />

              {/* User */}
              <Route path={EUICommonResourcePaths.Login} component={UserLoginPage} exact />
              <ProtectedRouteWithRbac path={EUICommonResourcePaths.ManageUserAccount} component={ManageUserAccountPage} exact />

              {/* Admin Portal */}
              { showAdminPortal && AdminPortalAppRoutes() }

              {/* Developer Portal */}
              { showDeveloperPortal && DeveloperPortalAppRoutes() }
              
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
    </React.Fragment>
  );
}

export default App;
