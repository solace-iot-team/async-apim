import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { PanelMenu } from 'primereact/panelmenu';

import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { UserContext } from "../../../components/UserContextProvider/UserContextProvider";
import { AuthHelper } from "../../../auth/AuthHelper";
import { EUIAdminPortalResourcePaths, EUIDeveloperPortalResourcePaths } from '../../../utils/Globals';

import '../../../components/APComponents.css';

export interface IAdminPortalSideBarProps {
  onSwitchToDeveloperPortal: () => void;
}

export const AdminPortalSideBar: React.FC<IAdminPortalSideBarProps> = (props: IAdminPortalSideBarProps) => {

  const history = useHistory();
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  const navigateTo = (path: string): void => { history.push(path); }

  const isDisabled = (resourcePath: EUIAdminPortalResourcePaths | EUIDeveloperPortalResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath)
    );
  } 

  const isDisabledWithOrg = (resourcePath: EUIAdminPortalResourcePaths | EUIDeveloperPortalResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath) ||
      !userContext.runtimeSettings.currentOrganizationName
    );
  }
  
  const getMenuItems = (): Array<MenuItem> => {
    if(!authContext.isLoggedIn) return [];
    let items: Array<MenuItem>= [
      { 
        label: 'Switch to Developer Portal',
        disabled: isDisabledWithOrg(EUIDeveloperPortalResourcePaths.Home),
        command: () => { props.onSwitchToDeveloperPortal(); }
      },
      {
        label: 'APPs',
        disabled: isDisabledWithOrg(EUIAdminPortalResourcePaths.ManageOrganizationApps),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApps); }
      },
      {
        label: 'API Products',
        disabled: isDisabledWithOrg(EUIAdminPortalResourcePaths.ManageOrganizationApiProducts),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApiProducts); }
      },
      {
        label: 'APIs',
        disabled: isDisabledWithOrg(EUIAdminPortalResourcePaths.ManageOrganizationApis),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApis); }
      },
      {
        label: 'Environments',
        disabled: isDisabledWithOrg(EUIAdminPortalResourcePaths.ManageOrganizationEnvironments),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationEnvironments); }
      },
      { label: "System",
        items: [
          {
            label: 'Users',
            disabled: isDisabled(EUIAdminPortalResourcePaths.ManageSystemUsers),
            command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemUsers); }
          },
          {
            label: 'Teams',
            disabled: isDisabled(EUIAdminPortalResourcePaths.ManageSystemTeams),
            command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemTeams); }
          },
          {
            label: 'Organizations',
            disabled: isDisabled(EUIAdminPortalResourcePaths.ManageSystemOrganizations),
            command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemOrganizations); }
          },
          {
            label: 'Setup',
            items: [
              {
                label: 'Connectors',
                disabled: isDisabled(EUIAdminPortalResourcePaths.ManageSystemConfigConnectors),
                command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemConfigConnectors); }
              },    
              {
                label: 'Settings',
                disabled: isDisabled(EUIAdminPortalResourcePaths.ManageSystemConfigSettings),
                command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemConfigSettings); }
              }        
            ]
          },
          {
            label: 'Monitor',
            items: [
              {
                label: 'Health',
                disabled: isDisabled(EUIAdminPortalResourcePaths.MonitorSystemHealth),
                command: () => { navigateTo(EUIAdminPortalResourcePaths.MonitorSystemHealth); }
              }        
            ]
          },
        ]
      },
    ];
    return items;
  }

  return (
    <div className="ap-side-bar">
      <div className="card">
        <PanelMenu model={getMenuItems()} style={{ width: '10rem' }}/>
      </div>
    </div>
  );
}

