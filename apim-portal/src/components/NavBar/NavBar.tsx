import React from "react";
import { useHistory } from 'react-router-dom';

import { Menubar } from 'primereact/menubar';
import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Divider } from 'primereact/divider';

import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import { UserContext } from "../UserContextProvider/UserContextProvider";
import { RenderWithRbac } from "../../auth/RenderWithRbac";
import { EUIResourcePaths } from "../../utils/Globals";
import { SystemHealthDisplay } from "../SystemHealth/SystemHealthDisplay";
import { TAPOrganizationIdList } from "../APComponentsCommon";
import { SelectOrganization } from "../SelectOrganization/SelectOrganization";
import { TApiCallState } from "../../utils/ApiCallState";

import '../APComponents.css';
import './NavBar.css';

export interface INavBarProps {}

export const NavBar: React.FC<INavBarProps> = (props: INavBarProps) => {
  
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const history = useHistory();
  const userOverlayPanel = React.useRef<any>(null);
  const organizationOverlayPanel = React.useRef<any>(null);

  const navigateTo = (path: string): void => { history.push(path); }

  const onLogout = () => {
    dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT' });
    dispatchUserContextAction({ type: 'CLEAR_USER_CONTEXT' });
    navigateTo(EUIResourcePaths.Home);
  }

  const onHideUserOverlayPanel = () => {
    organizationOverlayPanel.current.hide();
  }

  const onSelectOrganizationSuccess = () => {
    organizationOverlayPanel.current.hide();
    userOverlayPanel.current.hide();
    navigateTo(EUIResourcePaths.UserHome);
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

  const items: Array<MenuItem> = [
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      command: () => { navigateTo(EUIResourcePaths.Home); }
    },
    {
      label: 'Resources',
      icon: 'pi pi-fw pi-file',
      items: [
        {
          label: 'Reference Designs',
          icon: 'pi pi-fw pi-github',
          url: 'https://github.com/solace-iot-team/solace-apim-reference-designs',
          target: '_blank'
        }
      ]
    },
    { 
      label: 'Notifications',
      icon: 'pi pi-fw pi-bell',
      command: () => { navigateTo('/notifications'); }
    }
  ]

  const menubarStartTemplate = () => {
    return (
      <img alt="logo" src="/images/logo.png" height="40" className="p-mr-2"></img>
    )
  }
  const renderUserOpInfo = () => {
    return (
      <React.Fragment>
        <p>{userContext.user.profile?.email}</p>
      </React.Fragment>
    );   
  }
  const renderOpOrganization = () => {
    const availableOrganizationList: TAPOrganizationIdList = userContext.runtimeSettings.availableOrganizationNameList || [];
    if(userContext.runtimeSettings.currentOrganizationName) {
      const label: string = 'Organization: ' + userContext.runtimeSettings.currentOrganizationName;
      if(availableOrganizationList.length < 2) {
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
              style={{width: '450px'}}
              onHide={onHideUserOverlayPanel}
              >
              {renderUserOpInfo()}
              {renderOpOrganization()}
              <RenderWithRbac resourcePath={EUIResourcePaths.ManageUserAccount} >
                <Divider />
                <Button className="p-button-text p-button-plain" icon="pi pi-fw pi-user" label="Account" onClick={() => { navigateTo(EUIResourcePaths.ManageUserAccount); userOverlayPanel.current.hide(); }} />
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
        <SystemHealthDisplay />
      </React.Fragment>
    );
  }
  
  return (
    <React.Fragment>
      <div className="card" >
        <Menubar model={items} start={menubarStartTemplate} end={menubarEndTemplate} />
      </div>
    </React.Fragment>
  );
}

