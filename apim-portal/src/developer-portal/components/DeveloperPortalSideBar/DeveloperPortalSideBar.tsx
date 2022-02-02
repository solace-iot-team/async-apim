import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { PanelMenu } from 'primereact/panelmenu';

import { AuthHelper } from "../../../auth//AuthHelper";
import { EUIAdminPortalResourcePaths, EUICombinedResourcePaths, EUIDeveloperPortalResourcePaths } from "../../../utils/Globals";
import { AuthContext } from '../../../components/AuthContextProvider/AuthContextProvider';
import { UserContext } from "../../../components/UserContextProvider/UserContextProvider";
import { APHealthCheckSummaryContext } from "../../../components/APHealthCheckSummaryContextProvider";
import { EAPHealthCheckSuccess } from "../../../utils/APHealthCheck";

import '../../../components/APComponents.css';

export interface IDeveloperPortalSideBarProps {
  onSwitchToAdminPortal: () => void;
}

export const DeveloperPortalSideBar: React.FC<IDeveloperPortalSideBarProps> = (props: IDeveloperPortalSideBarProps) => {

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

  const isDisabledWithOrg = (resourcePath: EUIDeveloperPortalResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath) ||
      !userContext.runtimeSettings.currentOrganizationName
    );
  }

  const isDisabledWithConnectorUnavailable = (isDisabledFunc: (resourcePath: EUIDeveloperPortalResourcePaths) => boolean, resourcePath: EUIDeveloperPortalResourcePaths): boolean => {
    if(isDisabledFunc(resourcePath)) return true;
    if( healthCheckSummaryContext.connectorHealthCheckSuccess === EAPHealthCheckSuccess.FAIL ) return true;    
    return false;
  }

  const getApimMenuItems = (): Array<MenuItem> => {
    if(
      isDisabled(EUIDeveloperPortalResourcePaths.ManageUserApplications) && 
      isDisabled(EUIDeveloperPortalResourcePaths.ExploreApis) &&
      isDisabled(EUIDeveloperPortalResourcePaths.ExploreApiProducts)
      ) return [];

      let _items: Array<MenuItem> = [
        {
          label: 'My Apps',
          // disabled: isDisabledWithOrgAndConnectorUnavailable(EUIDeveloperPortalResourcePaths.ManageUserApplications),
          disabled: isDisabledWithConnectorUnavailable(isDisabledWithOrg, EUIDeveloperPortalResourcePaths.ManageUserApplications),
          command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ManageUserApplications); }
        },
        {
          label: 'Explore APIs',
          // disabled: isDisabledWithOrgAndConnectorUnavailable(EUIDeveloperPortalResourcePaths.ExploreApis),
          disabled: isDisabledWithConnectorUnavailable(isDisabledWithOrg, EUIDeveloperPortalResourcePaths.ExploreApis),
          command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ExploreApis); }
        },
        {
          label: 'Explore API Products',
          // disabled: isDisabledWithOrgAndConnectorUnavailable(EUIDeveloperPortalResourcePaths.ExploreApiProducts),
          disabled: isDisabledWithConnectorUnavailable(isDisabledWithOrg, EUIDeveloperPortalResourcePaths.ExploreApiProducts),
          command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ExploreApiProducts); }
        },
        // {
        //   label: 'Team Applications',
        //   disabled: isDisabledWithOrg(EUIDeveloperPortalResourcePaths.ManageTeamApplications),
        //   command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ManageTeamApplications); }
        // },
      ];
      return _items;
  }

  const getMenuItems = (): Array<MenuItem> => {
    if(!authContext.isLoggedIn) return [];
    let items: Array<MenuItem> = [];
    if(!isDisabled(EUIAdminPortalResourcePaths.Home)) {
      items.push(
        { 
          label: 'Switch to Admin Portal',
          disabled: isDisabled(EUIAdminPortalResourcePaths.Home),
          command: () => { props.onSwitchToAdminPortal(); }
        }  
      );
    }
    items.push(...getApimMenuItems())
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
