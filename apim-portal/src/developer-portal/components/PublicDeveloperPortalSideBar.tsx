import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { PanelMenu } from 'primereact/panelmenu';

import { EUIPublicDeveloperPortalResourcePaths } from "../../utils/Globals";
// import { AuthContext } from '../../components/AuthContextProvider/AuthContextProvider';
// import { UserContext } from "../../components/UserContextProvider/UserContextProvider";
import { APHealthCheckSummaryContext } from "../../components/APHealthCheckSummaryContextProvider";
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";

import '../../components/APComponents.css';

export interface IPublicDeveloperPortalSideBarProps {
}

// TODO: Marketplace
// - anonymous user
// - authcontext
// same as developer portal ...

export const PublicDeveloperPortalSideBar: React.FC<IPublicDeveloperPortalSideBarProps> = (props: IPublicDeveloperPortalSideBarProps) => {

  const history = useHistory();
  // const [authContext] = React.useContext(AuthContext);
  // const [userContext] = React.useContext(UserContext);
  const [healthCheckSummaryContext] = React.useContext(APHealthCheckSummaryContext);

  const navigateTo = (path: string): void => { history.push(path); }

  const isDisabledWithConnectorUnavailable = (resourcePath: EUIPublicDeveloperPortalResourcePaths): boolean => {
    if( healthCheckSummaryContext.connectorHealthCheckSuccess === EAPHealthCheckSuccess.FAIL ) return true;    
    return false;
  }

  const getApimMenuItems = (): Array<MenuItem> => {
    const _items: Array<MenuItem> = [
      {
        label: 'Explore Public API Products',
        disabled: isDisabledWithConnectorUnavailable(EUIPublicDeveloperPortalResourcePaths.ExploreApiProducts),
        command: () => { navigateTo(EUIPublicDeveloperPortalResourcePaths.ExploreApiProducts); }
      },
    ];
    return _items;
  }

  const getMenuItems = (): Array<MenuItem> => {
    const items: Array<MenuItem> = [];
    items.push(...getApimMenuItems());
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
