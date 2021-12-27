
import React from "react";
import { useHistory } from 'react-router-dom';

import { UserContext } from "../UserContextProvider/UserContextProvider";
import { APHealthCheckSummaryContext } from "../APHealthCheckSummaryContextProvider";
import { 
  EAPHealthCheckSuccess, 
} from "../../utils/APHealthCheck";
import { 
  EAppState,
  EUIAdminPortalResourcePaths, 
  EUIDeveloperPortalResourcePaths, 
} from "../../utils/Globals";

import "../APComponents.css";
import "./SystemHealth.css";

export interface ICheckConnectorHealthProps {}

export const CheckConnectorHealth: React.FC<ICheckConnectorHealthProps> = (props: ICheckConnectorHealthProps) => {
  // const componentName = 'CheckConnectorHealth';

  const [userContext] = React.useContext(UserContext);
  const [healthCheckSummaryState] = React.useContext(APHealthCheckSummaryContext);
  const history = useHistory();

  const navigateTo = (path: string): void => {
    history.push(path);
  }

  React.useEffect(() => {
    if(healthCheckSummaryState.connectorHealthCheckSuccess === EAPHealthCheckSuccess.UNDEFINED) return;
    if(healthCheckSummaryState.connectorHealthCheckSuccess === EAPHealthCheckSuccess.FAIL) {
      if(userContext.currentAppState === EAppState.DEVELOPER_PORTAL) navigateTo(EUIDeveloperPortalResourcePaths.DeveloperPortalConnectorUnavailable);
      else if(userContext.currentAppState === EAppState.ADMIN_PORTAL) navigateTo(EUIAdminPortalResourcePaths.AdminPortalConnectorUnavailable);
    }
  }, [healthCheckSummaryState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (<></>);
}
