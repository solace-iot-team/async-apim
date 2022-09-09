import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { PanelMenu } from 'primereact/panelmenu';

import { AuthContext } from "../../../components/APContextProviders/AuthContextProvider";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { APHealthCheckSummaryContext } from "../../../components/APHealthCheckSummaryContextProvider";
import { OrganizationContext } from "../../../components/APContextProviders/APOrganizationContextProvider";
import { EAPHealthCheckSuccess } from "../../../utils/APHealthCheck";
import { AuthHelper } from "../../../auth/AuthHelper";
import { EUIAdminPortalResourcePaths, EUICombinedResourcePaths, EUIDeveloperPortalResourcePaths, Globals } from '../../../utils/Globals';
import { EAPOrganizationConfigStatus } from "../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";
import { ConfigHelper } from "../../../components/APContextProviders/ConfigContextProvider/ConfigHelper";
import { ConfigContext } from "../../../components/APContextProviders/ConfigContextProvider/ConfigContextProvider";
import { E_AP_OPS_MODE, APOperationMode } from "../../../utils/APOperationMode";

import '../../../components/APComponents.css';

export interface IAdminPortalSideBarProps {
  onSwitchToDeveloperPortal: () => void;
}

export const AdminPortalSideBar: React.FC<IAdminPortalSideBarProps> = (props: IAdminPortalSideBarProps) => {
  const ComponentName = 'AdminPortalSideBar';

  const history = useHistory();
  const [configContext] = React.useContext(ConfigContext);
  const [authContext] = React.useContext(AuthContext);
  const [userContext] = React.useContext(UserContext);
  const [healthCheckSummaryContext] = React.useContext(APHealthCheckSummaryContext);
  const [organizationContext] = React.useContext(OrganizationContext);

  const navigateTo = (path: string): void => { history.push(path); }

  const isDisabled = (resourcePath: EUICombinedResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath)
    );
  } 
  const isDisabledWithoutOrg = (resourcePath: EUICombinedResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath) ||
      !userContext.runtimeSettings.currentOrganizationEntityId ||
      organizationContext.apOrganizationConfigStatus !== EAPOrganizationConfigStatus.OPERATIONAL
    );
  }
  const isDisabledWithConnectorUnavailable = (isDisabledFunc: (resourcePath: EUICombinedResourcePaths) => boolean, resourcePath: EUICombinedResourcePaths): boolean => {
    if(isDisabledFunc(resourcePath)) return true;
    if( healthCheckSummaryContext.connectorHealthCheckSuccess === EAPHealthCheckSuccess.FAIL ) return true;    
    return false;
  }
  
  const showApisMenuItem = (): boolean => {
    const funcName = 'showApisMenuItem';
    const logName = `${ComponentName}.${funcName}()`;

    switch(APOperationMode.AP_OPERATIONS_MODE) {
      case E_AP_OPS_MODE.FULL_OPS_MODE:
        return true;
      case E_AP_OPS_MODE.EP2_OPS_MODE:
        if(ConfigHelper.isEventPortal20(configContext)) return false;
        return true;
      default:
        Globals.assertNever(logName, APOperationMode.AP_OPERATIONS_MODE);
    }
    return false;
  }

  const getApimMenuItems = (): Array<MenuItem> => {
    if(
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganizationApps) && 
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganizationApiProducts) &&
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganizationApis)
      ) return [];

    let _items: Array<MenuItem> = [];
    _items.push(
      {
        label: 'Manage Apps',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationApps),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApps); }
      },
    );
    _items.push(
      {
        label: 'API Products',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationApiProducts),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApiProducts); }
      },
    );
    if(showApisMenuItem()) {
      _items.push(
        {
          label: 'APIs',
          disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationApis),
          command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApis); }
        },
      );  
    }
    return _items;
  }

  const getOrganizationIntegrationMenuItems = (): Array<MenuItem> => {
    if(
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganization) ||
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganizationIntegration) 
      ) return [];
    let _items: Array<MenuItem> = [
      {
        label: 'External Systems',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems),         
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems); }
      },
    ];
    return _items;
  }

  const getOrganizationAssetMaintenanceMenuItems = (): Array<MenuItem> => {
    if(
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganization) ||
      isDisabled(EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenance) 
      ) return [];
    const _items: Array<MenuItem> = [
      {
        label: 'API Products',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApiProducts),         
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApiProducts); }
      },
      {
        label: 'APIs',
        disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApis),         
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApis); }
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
            label: 'Jobs',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.MonitorOrganizationJobs),
            command: () => { navigateTo(EUIAdminPortalResourcePaths.MonitorOrganizationJobs); }
          },
          {
            label: 'Integration',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationIntegration),
            items: getOrganizationIntegrationMenuItems()
          },
          {
            label: 'Asset Maintenance',
            disabled: isDisabledWithConnectorUnavailable(isDisabledWithoutOrg, EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenance),
            items: getOrganizationAssetMaintenanceMenuItems()
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

