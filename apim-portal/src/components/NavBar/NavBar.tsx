import React from "react";
import { useHistory } from 'react-router-dom';

import { Menubar } from 'primereact/menubar';
import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import { Divider } from 'primereact/divider';

import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import { UserContext } from "../APContextProviders/APUserContextProvider";
import { APHealthCheckSummaryContext } from "../APHealthCheckSummaryContextProvider";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";
import { RenderWithRbac } from "../../auth/RenderWithRbac";
import { DisplaySystemHealthCheck } from "./DisplaySystemHealthCheck";
import { EAppState, EUICommonResourcePaths, EUIDeveloperToolsResourcePaths, Globals } from "../../utils/Globals";
import { Config } from '../../Config';
import { APDisplayAbout } from "../APAbout/APDisplayAbout";
import { TAPEntityId, TAPEntityIdList } from "../../utils/APEntityIdsService";
import { APSelectOrganization } from "../APSelectOrganization";
import APMemberOfService from "../../displayServices/APUsersDisplayService/APMemberOfService";
import APContextsDisplayService from "../../displayServices/APContextsDisplayService";
import { Loading } from "../Loading/Loading";
import { ManageBusinessGroupSelect } from "../ManageBusinessGroupSelect/ManageBusinessGroupSelect";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import APLoginUsersDisplayService from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { SessionContext } from "../APContextProviders/APSessionContextProvider";

import '../APComponents.css';
import './NavBar.css';

export interface INavBarProps {}

export const NavBar: React.FC<INavBarProps> = (props: INavBarProps) => {
  const ComponentName = 'NavBar';

  const UndefinedPortalLogoUrl = process.env.PUBLIC_URL + '/images/logo.png';
  const AdminPortalLogoUrl = process.env.PUBLIC_URL + '/admin-portal/images/logo.png';
  const DeveloperPortalLogoUrl = process.env.PUBLIC_URL + '/developer-portal/images/logo.png';

  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [configContext] = React.useContext(ConfigContext);
  const [healthCheckSummaryContext] = React.useContext(APHealthCheckSummaryContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [sessionContext, dispatchSessionContextAction] = React.useContext(SessionContext);
  const history = useHistory();
  const userOverlayPanel = React.useRef<any>(null);
  const organizationOverlayPanel = React.useRef<any>(null);

  const [showAbout, setShowAbout] = React.useState<boolean>(false);
  const [showBusinessGroupsSideBar, setShowBusinessGroupsSideBar] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

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

  enum E_CALL_STATE_ACTIONS {
    API_USER_LOGOUT = "API_USER_LOGOUT"
  }
  
  // const apiLogout = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
  //   const funcName = 'apiLogout';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_USER_LOGOUT, `logout user: ${userEntityId.id}`);
  //   try { 
  //     await APLoginUsersDisplayService.apsLogout({
  //       userId: userEntityId.id
  //     });
  //   } catch(e: any) {
  //     APSClientOpenApi.logError(logName, e);
  //     callState = ApiCallState.addErrorToApiCallState(e, callState);
  //   }
  //   setApiCallStatus(callState);
  //   return callState;
  // }

  // const doLogout = async() => {
  //   APContextsDisplayService.clear_LoginContexts({
  //     dispatchAuthContextAction: dispatchAuthContextAction,
  //     dispatchUserContextAction: dispatchUserContextAction,
  //     dispatchOrganizationContextAction: dispatchOrganizationContextAction,
  //     dispatchSessionContextAction: dispatchSessionContextAction,
  //   });
  //   navigateTo(EUICommonResourcePaths.Home);
  //   await apiLogout(userContext.apLoginUserDisplay.apEntityId);
  // }

  // const onLogout = () => {
  //   doLogout();
  // }

  const apiSecLogout = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiSecLogout';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_USER_LOGOUT, `logout user: ${userEntityId.id}`);
    try {
      await APLoginUsersDisplayService.apsSecLogout();
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doSecLogout = async() => {
    navigateTo(EUICommonResourcePaths.Home);
    await apiSecLogout(userContext.apLoginUserDisplay.apEntityId);
    APContextsDisplayService.clear_LoginContexts({
      dispatchAuthContextAction: dispatchAuthContextAction,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction,
      dispatchSessionContextAction: dispatchSessionContextAction,
    });
  }
  const onSecLogout = () => {
    doSecLogout();
  }
  const renderSecLogout = () => {
    if(Config.getUseSecMode()) return (
      <React.Fragment>
        <Button className="p-button-text p-button-plain" icon="pi pi-sign-out" label="Logout" onClick={() => onSecLogout()} />
      </React.Fragment>
    );   
  }

  const onHideUserOverlayPanel = () => {
    organizationOverlayPanel.current.hide();
  }

  const doSetupOrganization = async (organizationEntityId: TAPEntityId) => {
    // const funcName = 'doSetupOrganization';
    // const logName = `${ComponentName}.${funcName}()`;
    setIsLoading(true);
    await APContextsDisplayService.setup_LoginContexts({
      apLoginUserDisplay: userContext.apLoginUserDisplay,
      apSessionContext: sessionContext,
      organizationEntityId: organizationEntityId,
      isConnectorAvailable: configContext.connector !== undefined && healthCheckSummaryContext.connectorHealthCheckSuccess !== EAPHealthCheckSuccess.FAIL,
      dispatchAuthContextAction: dispatchAuthContextAction,
      userContextCurrentAppState: userContext.currentAppState,
      userContextOriginAppState: userContext.originAppState,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction,
      dispatchSessionContextAction: dispatchSessionContextAction,
      navigateTo: navigateToCurrentHome,
      // onLoadingChange: setIsLoading
    });
    setIsLoading(false);
  }

  const onSelectOrganizationSuccess = (organizationEntityId: TAPEntityId) => {
    organizationOverlayPanel.current.hide();
    userOverlayPanel.current.hide();
    doSetupOrganization(organizationEntityId);
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
        },
        {
          label: 'Test Business Groups',
          disabled: false,
          command: () => { navigateTo(EUIDeveloperToolsResourcePaths.TestBusinessGroups); }
        },
        {
          label: 'Test Sec Response',
          disabled: false,
          command: () => { navigateTo(EUIDeveloperToolsResourcePaths.TestSec); }
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
    const logName = `${ComponentName}.${funcName}()`;
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
        <p>{userContext.apLoginUserDisplay.apUserProfileDisplay.email}</p>
      </React.Fragment>
    );   
  }
  const renderOpOrganization = () => {

    const availableOrganizationEntityIdList: TAPEntityIdList = APMemberOfService.get_ApMemberOfOrganizationEntityIdList({
      apMemberOfOrganizationDisplayList: userContext.apLoginUserDisplay.apMemberOfOrganizationDisplayList,
    });

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


  const renderUserComponents = () => {
    return (
      <React.Fragment>
        {/* user button */}
        <Button 
          className="p-button-text p-button-plain" 
          icon="pi pi-fw pi-user" 
          // label={APLoginUsersDisplayService.create_UserDisplayName(userContext.apLoginUserDisplay.apUserProfileDisplay)}
          aria-haspopup={true}
          aria-controls="user_overlay_panel"
          onClick={(e) => userOverlayPanel.current.toggle(e) } 
        />

        {/* user overlay panel */}
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
          {/* <Button className="p-button-text p-button-plain" icon="pi pi-sign-out" label="Logout" onClick={() => onLogout()} /> */}
          { renderSecLogout() }
        </OverlayPanel>
        
        {/* organization select */}
        <OverlayPanel   
          className="ap-navbar organnization-overlay-panel" 
          ref={organizationOverlayPanel} 
          id="organization_overlay_panel" 
          style={{width: '450px'}}
          dismissable={true}
          showCloseIcon={false}
        >
          <APSelectOrganization
            apMemberOfOrganizationEntityIdList={APMemberOfService.get_ApMemberOfOrganizationEntityIdList({
              apMemberOfOrganizationDisplayList: userContext.apLoginUserDisplay.apMemberOfOrganizationDisplayList,
            })}
            onSuccess={onSelectOrganizationSuccess} 
          />
        </OverlayPanel>
    </React.Fragment>
    );
  }

  const onBusinessGroupSelectSuccess = () => {
    setShowBusinessGroupsSideBar(false);
  }
  const renderBusinessGroupComponents = () => {
    // const funcName = 'renderBusinessGroupComponents';
    // const logName = `${ComponentName}.${funcName}()`;

    // not a member of any org ==> return empty
    if(userContext.runtimeSettings.currentOrganizationEntityId === undefined) return (<></>);
    // context may not be set up fully yet, wait for next re-render
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) return (<></>);
    
    // no selection if only access of 1 business group
     // const isSelectDisabled: boolean = userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList.length < 2;

    // probably no need to disable the button.
    const isSelectDisabled: boolean = false;

    const businessGroupButtonLabel: string = userContext.runtimeSettings.currentBusinessGroupEntityId.displayName;

    return (
      <React.Fragment>
        {/* business group button */}
        <Button 
          className="p-button-text p-button-plain" 
          icon="pi pi-fw pi-list" 
          label={businessGroupButtonLabel}
          disabled={isSelectDisabled}
          onClick={() => setShowBusinessGroupsSideBar(true)}
        />
        {/* the side bar */}
        { showBusinessGroupsSideBar && 
          <Sidebar
            visible={showBusinessGroupsSideBar}
            position="right"
            onHide={() => setShowBusinessGroupsSideBar(false)}
            style={{width:'60em'}}
            // className="p-sidebar-lg"
          >
            <ManageBusinessGroupSelect
              apLoginUserDisplay={userContext.apLoginUserDisplay}
              apMemberOfBusinessGroupDisplayTreeNodeList={userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList}
              currentBusinessGroupEntityId={userContext.runtimeSettings.currentBusinessGroupEntityId}
              onSuccess={onBusinessGroupSelectSuccess}
              onLoadingChange={setIsLoading}
            />
          </Sidebar>
        }
      </React.Fragment>
    );
  }

  const getLoginButton = (): JSX.Element => {
    if(Config.getUseSecMode()) {
      return (
        <Button className="p-button-text p-button-plain" icon="pi pi-sign-in" label="Login" onClick={() => navigateTo(EUICommonResourcePaths.GetLogin)} />
      );
    }
    return(
      <Button className="p-button-text p-button-plain" icon="pi pi-sign-in" label="old-Login" onClick={() => navigateTo(EUICommonResourcePaths.deleteme_Login)} />
    );
  }

  const menubarEndTemplate = () => {
    if(!isSystemAvailable()) return (
      <React.Fragment>
        <DisplaySystemHealthCheck />
      </React.Fragment>
    );
    return (
      <React.Fragment>
        {!authContext.isLoggedIn && 
          getLoginButton()
        }
        {authContext.isLoggedIn &&
          <React.Fragment>
            {renderBusinessGroupComponents()}
            {renderUserComponents()}
          </React.Fragment>
        }
        <span className="p-ml-2">
          <DisplaySystemHealthCheck />
        </span>
      </React.Fragment>
    );
  }
  
  return (
    <React.Fragment>

      <Loading show={isLoading} />

      <div className="card" >
        <Menubar model={getMenuItems()} start={menubarStartTemplate} end={menubarEndTemplate} />
      </div>
      {showAbout && renderAbout()}
    </React.Fragment>
  );
}

