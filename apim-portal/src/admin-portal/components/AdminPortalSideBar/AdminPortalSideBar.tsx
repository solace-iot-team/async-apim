import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { PanelMenu } from 'primereact/panelmenu';

import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { UserContext } from "../../../components/UserContextProvider/UserContextProvider";
import { APHealthCheckSummaryContext } from "../../../components/APHealthCheckSummaryContextProvider";
import { EAPHealthCheckSuccess } from "../../../utils/APHealthCheck";
import { AuthHelper } from "../../../auth/AuthHelper";
import { EUIAdminPortalResourcePaths, EUICombinedResourcePaths, EUIDeveloperPortalResourcePaths } from '../../../utils/Globals';

import '../../../components/APComponents.css';

export interface IAdminPortalSideBarProps {
  onSwitchToDeveloperPortal: () => void;
}

export const AdminPortalSideBar: React.FC<IAdminPortalSideBarProps> = (props: IAdminPortalSideBarProps) => {
  // const componentName = 'AdminPortalSideBar';

  const history = useHistory();
  const [authContext] = React.useContext(AuthContext);
  const [userContext] = React.useContext(UserContext);
  const [healthCheckSummaryContext] = React.useContext(APHealthCheckSummaryContext);

  const navigateTo = (path: string): void => { history.push(path); }

  const isDisabled = (resourcePath: EUICombinedResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath)
    );
  } 
  const isDisabledWithOrg = (resourcePath: EUICombinedResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath) ||
      !userContext.runtimeSettings.currentOrganizationName
    );
  }
  const isDisabledWithConnectorUnavailable = (isDisabledFunc: (resourcePath: EUICombinedResourcePaths) => boolean, resourcePath: EUICombinedResourcePaths): boolean => {
    if(isDisabledFunc(resourcePath)) return true;
    if( healthCheckSummaryContext.connectorHealthCheckSuccess === EAPHealthCheckSuccess.FAIL ) return true;    
    return false;
  }
  
  const getMenuItems = (): Array<MenuItem> => {
    if(!authContext.isLoggedIn) return [];
    let items: Array<MenuItem> = [];
    if(!isDisabledWithOrg(EUIDeveloperPortalResourcePaths.Home)) {
      items.push(
        { 
          label: 'Switch to Developer Portal',
          disabled: isDisabledWithConnectorUnavailable(isDisabledWithOrg,EUIDeveloperPortalResourcePaths.Home),
          command: () => { props.onSwitchToDeveloperPortal(); }
        }  
      );
    }
    let _items: Array<MenuItem> = [
      {
        label: 'APPs',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithOrg, EUIAdminPortalResourcePaths.ManageOrganizationApps),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApps); }
      },
      {
        label: 'API Products',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithOrg, EUIAdminPortalResourcePaths.ManageOrganizationApiProducts),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApiProducts); }
      },
      {
        label: 'APIs',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithOrg, EUIAdminPortalResourcePaths.ManageOrganizationApis),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApis); }
      },
      {
        label: 'Environments',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithOrg, EUIAdminPortalResourcePaths.ManageOrganizationEnvironments),         
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationEnvironments); }
      },
      { 
        label: "System",
        items: [
          {
            label: 'Users',
            disabled: isDisabled(EUIAdminPortalResourcePaths.ManageSystemUsers),
            command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemUsers); }
          },
          // {
          //   label: 'Teams',
          //   disabled: isDisabled(EUIAdminPortalResourcePaths.ManageSystemTeams),
          //   command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemTeams); }
          // },
          {
            label: 'Organizations',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithOrg, EUIAdminPortalResourcePaths.ManageSystemOrganizations),
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
              // {
              //   label: 'Settings',
              //   disabled: isDisabled(EUIAdminPortalResourcePaths.ManageSystemConfigSettings),
              //   command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemConfigSettings); }
              // }        
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
    items.push(..._items);
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

