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
  const isDisabledWithoutOrg = (resourcePath: EUICombinedResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath) ||
      !userContext.runtimeSettings.currentOrganizationEntityId
    );
  }
  const isDisabledWithConnectorUnavailable = (isDisabledFunc: (resourcePath: EUICombinedResourcePaths) => boolean, resourcePath: EUICombinedResourcePaths): boolean => {
    if(isDisabledFunc(resourcePath)) return true;
    if( healthCheckSummaryContext.connectorHealthCheckSuccess === EAPHealthCheckSuccess.FAIL ) return true;    
    return false;
  }
  
  const getApimMenuItems = (): Array<MenuItem> => {
    if(
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganizationApps) && 
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganizationApiProducts) &&
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganizationApis)
      ) return [];

    let _items: Array<MenuItem> = [
      {
        label: 'APPs',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationApps),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApps); }
      },
      {
        label: 'API Products',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationApiProducts),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApiProducts); }
      },
      {
        label: 'APIs',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationApis),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApis); }
      },
    ];
    return _items;
  }

  const getOrganizationIntegrationMenuItems = (): Array<MenuItem> => {
    if(isDisabled(EUIAdminPortalResourcePaths.ManageOrganization)) return [];
    let _items: Array<MenuItem> = [
      {
        label: 'External Systems',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems),         
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems); }
      },
    ];
    return _items;
  }

  const getOrganizationMenuItems = (): Array<MenuItem> => {
    if(isDisabled(EUIAdminPortalResourcePaths.ManageOrganization)) return [];
    let _items: Array<MenuItem> = [
      {
        label: 'Organization',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganization),        
        items: [
          {
            label: 'Environments',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationEnvironments),         
            command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationEnvironments); }
          },
          {
            label: 'Users',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationUsers),
            command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationUsers); }
          },
          {
            label: 'Business Groups',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationBusinessGroups),
            command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationBusinessGroups); }
          },
          {
            label: 'Settings',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationSettings),
            command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationSettings); }
          },
          {
            label: 'Status',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.MonitorOrganizationStatus),
            command: () => { navigateTo(EUIAdminPortalResourcePaths.MonitorOrganizationStatus); }
          },
          {
            label: 'Integration',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationIntegration),
            items: getOrganizationIntegrationMenuItems()
          },
        ] 
      },
    ];
    return _items;
  }

  const getSystemMenuItems = (): Array<MenuItem> => {
    if(isDisabled(EUIAdminPortalResourcePaths.ManageSystem)) return [];
    let _items: Array<MenuItem> = [
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
            disabled: isDisabledWithConnectorUnavailable(isDisabled, EUIAdminPortalResourcePaths.ManageSystemOrganizations),
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
    return _items;
  }

  const getMenuItems = (): Array<MenuItem> => {
    if(!authContext.isLoggedIn) return [];
    let items: Array<MenuItem> = [];
    if(!isDisabledWithoutOrg(EUIDeveloperPortalResourcePaths.Home)) {
      items.push(
        { 
          label: 'Switch to Developer Portal',
          disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg,EUIDeveloperPortalResourcePaths.Home),
          command: () => { props.onSwitchToDeveloperPortal(); }
        }  
      );
    }
    items.push(...getApimMenuItems())
    items.push(...getOrganizationMenuItems());
    items.push(...getSystemMenuItems());
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

