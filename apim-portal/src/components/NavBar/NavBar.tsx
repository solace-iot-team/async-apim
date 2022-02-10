import React from "react";
import { useHistory } from 'react-router-dom';

import { Menubar } from 'primereact/menubar';
import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Divider } from 'primereact/divider';

import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import { UserContext } from "../UserContextProvider/UserContextProvider";
import { APHealthCheckSummaryContext } from "../APHealthCheckSummaryContextProvider";
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";
import { RenderWithRbac } from "../../auth/RenderWithRbac";
import { DisplaySystemHealthCheck } from "./DisplaySystemHealthCheck";
import { SelectOrganization } from "../SelectOrganization/SelectOrganization";
import { TApiCallState } from "../../utils/ApiCallState";
import { EAppState, EUICommonResourcePaths, EUIDeveloperToolsResourcePaths, Globals } from "../../utils/Globals";
import { Config } from '../../Config';
import { APDisplayAbout } from "../APAbout/APDisplayAbout";
import { TAPEntityIdList } from "../../utils/APEntityIdsService";

import '../APComponents.css';
import './NavBar.css';

export interface INavBarProps {}

export const NavBar: React.FC<INavBarProps> = (props: INavBarProps) => {
  const componentName = 'NavBar';

  const UndefinedPortalLogoUrl = process.env.PUBLIC_URL + '/images/logo.png';
  const AdminPortalLogoUrl = process.env.PUBLIC_URL + '/admin-portal/images/logo.png';
  const DeveloperPortalLogoUrl = process.env.PUBLIC_URL + '/developer-portal/images/logo.png';

  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [healthCheckSummaryContext] = React.useContext(APHealthCheckSummaryContext);
  const history = useHistory();
  const userOverlayPanel = React.useRef<any>(null);
  const organizationOverlayPanel = React.useRef<any>(null);

  const [showAbout, setShowAbout] = React.useState<boolean>(false);

  const navigateTo = (path: string): void => { history.push(path); }

  const navigateToCurrentHome = (): void => {
    if(userContext.currentAppState !== EAppState.UNDEFINED) navigateTo(Globals.getCurrentHomePath(authContext.isLoggedIn, userContext.currentAppState));
    else navigateToOriginHome();
  }

  const navigateToOriginHome = (): void => {
    if(userContext.originAppState !== EAppState.UNDEFINED) navigateTo(Globals.getOriginHomePath(userContext.originAppState));
    else navigateTo(EUICommonResourcePaths.Home);
  }

  const isSystemAvailable = (): boolean => {
    // still allow login even if connector is unavailable ==> configure connector
    if( healthCheckSummaryContext.serverHealthCheckSuccess === EAPHealthCheckSuccess.FAIL) return false;    
    return true;
  }

  const onLogout = () => {
    dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT' });
    dispatchUserContextAction({ type: 'CLEAR_USER_CONTEXT' });
    navigateTo(EUICommonResourcePaths.Home);
    // navigateToOriginHome();
  }

  const onHideUserOverlayPanel = () => {
    organizationOverlayPanel.current.hide();
  }

  const onSelectOrganizationSuccess = () => {
    organizationOverlayPanel.current.hide();
    userOverlayPanel.current.hide();
    navigateToCurrentHome();
  }

  const onSelectOrganizationError = (apiCallStatus: TApiCallState) => {
    dispatchUserContextAction({ type: 'SET_USER_MESSAGE', userMessage: {
      success: false,
      context: {
        internalAction: apiCallStatus.context.action,
        userAction: 'select organization',
        userMessage: apiCallStatus.context.userDetail?apiCallStatus.context.userDetail:'unknown error'
      }
    }})
  }

  const getDevelMenuItem = (): MenuItem => {
    return {
      label: 'DEVEL',
      items: [
        {
          label: 'Test Errors',
          disabled: false,
          command: () => { navigateTo(EUIDeveloperToolsResourcePaths.TestErrors); }
        },
        {
          label: 'Test Roles',
          disabled: false,
          command: () => { navigateTo(EUIDeveloperToolsResourcePaths.TestRoles); }
        },
        {
          label: 'View Contexts',
          disabled: false,
          command: () => { navigateTo(EUIDeveloperToolsResourcePaths.ViewContexts); }
        }
      ]
    };
  }

  const getMenuItems = (): Array<MenuItem> => {
    let items: Array<MenuItem> = [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        command: () => { navigateToCurrentHome(); }
      },
      {
        label: 'Resources',
        icon: 'pi pi-fw pi-file',
        items: [
          {
            label: 'Documentation',
            icon: 'pi pi-fw pi-file',
            url: 'https://solace-iot-team.github.io/async-apim',
            target: '_blank'
          },
          {
            label: 'Reference Designs',
            icon: 'pi pi-fw pi-github',
            url: 'https://github.com/solace-iot-team/solace-apim-reference-designs',
            target: '_blank'
          }
        ]
      },
      // { 
      //   label: 'Notifications',
      //   icon: 'pi pi-fw pi-bell',
      //   command: () => { navigateTo('/notifications'); }
      // }
    ];

    if(Config.getUseDevelTools()) items.push(getDevelMenuItem());
    return items;
  }

  const getLogoUrl = (appState: EAppState): string => {
    const funcName = 'getLogoUrl';
    const logName = `${componentName}.${funcName}()`;
    switch(appState) {
      case EAppState.ADMIN_PORTAL:
        return AdminPortalLogoUrl;
      case EAppState.DEVELOPER_PORTAL:
      case EAppState.PUBLIC_DEVELOPER_PORTAL:
        return DeveloperPortalLogoUrl;
      case EAppState.UNDEFINED:
        if(userContext.originAppState !== EAppState.UNDEFINED) return getLogoUrl(userContext.originAppState);
        return UndefinedPortalLogoUrl;
      default:
        Globals.assertNever(logName, appState);
    }
    return 'never gets here';
  }
  const menubarStartTemplate = () => {
    return (
      <img alt="logo" src={getLogoUrl(userContext.currentAppState)} className="p-menubar-logo p-mr-2" onClick={(e) => setShowAbout(true)}/>
    );
  }
  const renderAbout = () => {
    const onClose = () => {
      setShowAbout(false);
    }
    return (
      <APDisplayAbout
        onClose={onClose}
      />
    );
  }
  const renderUserOpInfo = () => {
    return (
      <React.Fragment>
        <p>{userContext.user.profile?.email}</p>
      </React.Fragment>
    );   
  }
  const renderOpOrganization = () => {
    const availableOrganizationEntityIdList: TAPEntityIdList = userContext.runtimeSettings.availableOrganizationEntityIdList || [];
    if(userContext.runtimeSettings.currentOrganizationEntityId) {
      const label: string = 'Organization: ' + userContext.runtimeSettings.currentOrganizationEntityId.displayName;
      if(availableOrganizationEntityIdList.length < 2) {
        return (
          <p>{label}</p>
        )
      } else {
        return (
          <Button 
            className="p-button-text p-button-plain" 
            icon="pi pi-fw pi-angle-left" 
            label={label}
            aria-haspopup={true}
            aria-controls="organization_overlay_panel"
            onClick={(e) => organizationOverlayPanel.current.toggle(e) }
          />
        )
      }
    }
  }

  const menubarEndTemplate = () => {
    if(!isSystemAvailable()) return (
      <React.Fragment>
        {/* <SystemHealthCheck /> */}
        <DisplaySystemHealthCheck />
      </React.Fragment>
    );
    return (
      <React.Fragment>
        {!authContext.isLoggedIn && 
          <Button className="p-button-text p-button-plain" icon="pi pi-sign-in" label="Login" onClick={() => navigateTo('/login')} />
        }
        {authContext.isLoggedIn &&
          <React.Fragment>
            <Button 
              className="p-button-text p-button-plain" 
              icon="pi pi-fw pi-user" 
              label={`${userContext.user.profile?.first} ${userContext.user.profile?.last}`}
              aria-haspopup={true}
              aria-controls="user_overlay_panel"
              onClick={(e) => userOverlayPanel.current.toggle(e) } />
            <OverlayPanel 
              className="ap-navbar user-overlay-panel" 
              ref={userOverlayPanel} 
              id="user_overlay_panel" 
              style={{width: '650px'}}
              onHide={onHideUserOverlayPanel}
              >
              {renderUserOpInfo()}
              {renderOpOrganization()}
              <RenderWithRbac resourcePath={EUICommonResourcePaths.ManageUserAccount} >
                <Divider />
                <Button className="p-button-text p-button-plain" icon="pi pi-fw pi-user" label="Account" onClick={() => { navigateTo(EUICommonResourcePaths.ManageUserAccount); userOverlayPanel.current.hide(); }} />
              </RenderWithRbac>
              <Divider />
              <Button className="p-button-text p-button-plain" icon="pi pi-sign-out" label="Logout" onClick={() => onLogout()} />
            </OverlayPanel>

            <OverlayPanel 
              className="ap-navbar organnization-overlay-panel" 
              ref={organizationOverlayPanel} 
              id="organization_overlay_panel" 
              style={{width: '450px'}} 
              dismissable={true}
              showCloseIcon={false}
              >
                <SelectOrganization onSuccess={onSelectOrganizationSuccess} onError={onSelectOrganizationError} />
            </OverlayPanel>

          </React.Fragment>
        }
        {/* <SystemHealthCheck /> */}
        <DisplaySystemHealthCheck />
      </React.Fragment>
    );
  }
  
  return (
    <React.Fragment>
      <div className="card" >
        <Menubar model={getMenuItems()} start={menubarStartTemplate} end={menubarEndTemplate} />
      </div>
      {showAbout && renderAbout()}
    </React.Fragment>
  );
}

