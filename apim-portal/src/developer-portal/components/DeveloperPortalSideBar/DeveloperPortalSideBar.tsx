import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { PanelMenu } from 'primereact/panelmenu';

import { AuthContext } from '../../../components/AuthContextProvider/AuthContextProvider';
import { UserContext } from "../../../components/UserContextProvider/UserContextProvider";
import { AuthHelper } from "../../../auth//AuthHelper";
import { EUIResourcePaths } from "../../../utils/Globals";

import '../../../components/APComponents.css';
import './DeveloperPortalSideBar.css';

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

  const isDisabled = (resourcePath: EUIResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath) ||
      !userContext.runtimeSettings.currentOrganizationName
    );
  }
  
  const items: Array<MenuItem>= [
    { 
      label: 'Switch to Admin Portal',
      disabled: isDisabled(EUIResourcePaths.AdminPortal),
      command: () => { props.onSwitchToAdminPortal(); }
    },
    {
      label: 'Product Catalog',
      disabled: isDisabled(EUIResourcePaths.DeveloperPortalViewProductCatalog),
      command: () => { navigateTo(EUIResourcePaths.DeveloperPortalViewProductCatalog); }
    },
    {
      label: 'Applications',
      disabled: isDisabled(EUIResourcePaths.DeveloperPortalManageApplications),
      command: () => { navigateTo(EUIResourcePaths.DeveloperPortalManageApplications); }
    },
  ];

  return (
    <div className="ap-side-bar">
      <div className="card">
        <PanelMenu model={items} style={{ width: '10rem' }}/>
      </div>
    </div>
  );
}

