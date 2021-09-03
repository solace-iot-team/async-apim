import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { PanelMenu } from 'primereact/panelmenu';

import { AuthHelper } from "../../../auth//AuthHelper";
import { EUIAdminPortalResourcePaths, EUIDeveloperPortalResourcePaths } from "../../../utils/Globals";
import { AuthContext } from '../../../components/AuthContextProvider/AuthContextProvider';
import { UserContext } from "../../../components/UserContextProvider/UserContextProvider";

import '../../../components/APComponents.css';

export interface IDeveloperPortalSideBarProps {
  onSwitchToAdminPortal: () => void;
}

export const DeveloperPortalSideBar: React.FC<IDeveloperPortalSideBarProps> = (props: IDeveloperPortalSideBarProps) => {

  const history = useHistory();
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const navigateTo = (path: string): void => { history.push(path); }

  const isDisabled = (resourcePath: EUIAdminPortalResourcePaths | EUIDeveloperPortalResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath) ||
      !userContext.runtimeSettings.currentOrganizationName
    );
  }
   
  const getMenuItems = (): Array<MenuItem> => {
    if(!authContext.isLoggedIn) return [];
    let items: Array<MenuItem>= [
      { 
        label: 'Switch to Admin Portal',
        disabled: isDisabled(EUIAdminPortalResourcePaths.Home),
        command: () => { props.onSwitchToAdminPortal(); }
      },
      {
        label: 'Product Catalog',
        disabled: isDisabled(EUIDeveloperPortalResourcePaths.ViewProductCatalog),
        command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ViewProductCatalog); }
      },
      {
        label: 'My Applications',
        disabled: isDisabled(EUIDeveloperPortalResourcePaths.ManageUserApplications),
        command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ManageUserApplications); }
      },
      {
        label: 'Team Applications',
        disabled: isDisabled(EUIDeveloperPortalResourcePaths.ManageTeamApplications),
        command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ManageTeamApplications); }
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

