
import React from "react";
import { useHistory } from 'react-router-dom';

import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";

import { ConfigContext } from "../APContextProviders/ConfigContextProvider/ConfigContextProvider";
import { APHealthCheckContext } from "../APHealthCheckContextProvider";
import { 
  EAPHealthCheckSuccess, 
} from "../../utils/APHealthCheck";
import { 
  EUIAdminPortalResourcePaths, 
  EUICommonResourcePaths,
} from "../../utils/Globals";
import { RenderWithRbac } from "../../auth/RenderWithRbac";
import { SystemHealthCommon } from "../SystemHealth/SystemHealthCommon";
import { DisplaySystemHealthInfo } from "../SystemHealth/DisplaySystemHealthInfo";

import "../APComponents.css";
import "./NavBar.css";

export interface IDisplaySystemHealthCheckProps {}

export const DisplaySystemHealthCheck: React.FC<IDisplaySystemHealthCheckProps> = (props: IDisplaySystemHealthCheckProps) => {
  // const componentName = 'DisplaySystemHealthCheck';

  const [configContext] = React.useContext(ConfigContext);
  const [healthCheckContext] = React.useContext(APHealthCheckContext);
  const history = useHistory();
  const op = React.useRef<any>(null);

  const navigateTo = (path: string): void => {
    history.push(path);
  }

  // React.useEffect(() => {
  //   const funcName = 'useEffect[]';
  //   const logName = `${componentName}.${funcName}()`;
  //   // alert(`${logName}: mounting ...`)
  // }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(healthCheckContext.serverHealthCheckResult) {
      if(healthCheckContext.serverHealthCheckResult.summary.performed && healthCheckContext.serverHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL) {
        navigateTo(EUICommonResourcePaths.HealthCheckView);
      }
    }
  }, [healthCheckContext.serverHealthCheckResult]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  const renderSystemHealthInfo = () => {
    return (
      <React.Fragment>
        {/* <p>count={count}, reinitializeConfigContextCount={reinitializeConfigContextCount}</p> */}
        <DisplaySystemHealthInfo 
          healthCheckContext={healthCheckContext}
          connectorDisplayName={configContext.connector ? configContext.connector.displayName : 'unknown'}
        />
      </React.Fragment>
    );   
  }

  return (
    <React.Fragment>
      <Button 
        icon={SystemHealthCommon.getSystemHealthIcon(healthCheckContext.systemHealthCheckSummary)}
        className={SystemHealthCommon.getButtonClassName(healthCheckContext.systemHealthCheckSummary)}
        onClick={(e) => op.current.toggle(e) } />
      <OverlayPanel className="ap-navbar system-health-overlay-panel" ref={op} id="system_health_overlay_panel" style={{width: '700px'}} >
        {renderSystemHealthInfo()}
        <RenderWithRbac resourcePath={EUIAdminPortalResourcePaths.MonitorSystemHealth} >
          <Divider />
          <Button className="p-button-text p-button-plain" icon="pi pi-fw pi-heart" label="System Health Details" onClick={() => { navigateTo(EUIAdminPortalResourcePaths.MonitorSystemHealth); op.current.hide(); }} />
        </RenderWithRbac>
      </OverlayPanel>
    </React.Fragment>
  );
}
