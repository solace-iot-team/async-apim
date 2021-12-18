
import React from "react";
import { useInterval } from 'react-use';
import { useHistory } from 'react-router-dom';

import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";

import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { APHealthCheckContext } from "../APHealthCheckContextProvider";
import { APConnectorHealthCheck, EAPHealthCheckSuccess, TAPConnectorHealthCheckResult, TAPHealthCheckSummary } from "../../utils/APHealthCheck";
import { 
  EUIAdminPortalResourcePaths, 
  Globals, 
  TAPConfigIssueList, 
} from "../../utils/Globals";
import { RenderWithRbac } from "../../auth/RenderWithRbac";
import { APLogger } from "../../utils/APLogger";
import { SystemHealthCommon } from "./SystemHealthCommon";

import "../APComponents.css";
import "./SystemHealth.css";

export interface ISystemHealthProps {
}

export const SystemHealthDisplay: React.FC<ISystemHealthProps> = (props: ISystemHealthProps) => {
  const componentName = 'SystemHealthDisplay';

  const healthCheckInterval_ms: number = 300000;
  // const healthCheckInterval_ms: number = 5000;

  const connectorHealthCheckResultNotPerformed: TAPConnectorHealthCheckResult = APConnectorHealthCheck.getInitializedHealthCheckResult_NotPerformed();

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  const history = useHistory();
  const op = React.useRef<any>(null);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [delay, setDelay] = React.useState<number>(healthCheckInterval_ms); 
  const [count, setCount] = React.useState<number>(0);
  const [connectorHealthCheckResult, setConnectorHealthCheckResult] = React.useState<TAPConnectorHealthCheckResult>(connectorHealthCheckResultNotPerformed);
  const [systemHealthCheckSummary, setSystemHealthCheckSummary] = React.useState<TAPHealthCheckSummary>(connectorHealthCheckResultNotPerformed.summary);
  const [configIssueList, setConfigIssueList] = React.useState<TAPConfigIssueList>([]);

  React.useEffect(() => {
    setCount(count + 1);
    doSystemHealthCheck();
  }, [configContext]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    dispatchHealthCheckContextAction({ type: 'SET_CONNECTOR_HEALTHCHECK_RESULT', connectorHealthCheckResult: connectorHealthCheckResult});
  }, [connectorHealthCheckResult])

  React.useEffect(() => {
    dispatchHealthCheckContextAction({ type: 'SET_CONFIG_ISSUE_LIST', configIssueList: configIssueList});
  }, [configIssueList])

  useInterval( () => 
    {
      setCount(count + 1);
      doSystemHealthCheck();
    },
    delay
  );

  const doSystemHealthCheck = async () => {  
    const funcName = 'doSystemHealthCheck';
    const logName = `${componentName}.${funcName}()`;
    let _connectorHealthCheckResult: TAPConnectorHealthCheckResult = connectorHealthCheckResultNotPerformed;
    if(configContext.connector) {
      try {
        _connectorHealthCheckResult = await APConnectorHealthCheck.doHealthCheck(configContext, configContext.connector.connectorClientConfig);
      } catch(e) {
        APLogger.error(APLogger.createLogEntry(logName, e));
        throw e;
      }        
    }
    setConnectorHealthCheckResult(_connectorHealthCheckResult);
    setSystemHealthCheckSummary(_connectorHealthCheckResult.summary);
    setConfigIssueList(Globals.crossCheckConfiguration(configContext));
  }

  const renderConnectorHealthInfo = () => {
    let connectorName: string = 'unknown';
    let success: EAPHealthCheckSuccess = EAPHealthCheckSuccess.UNDEFINED;

    if(configContext.connector) {
      connectorName = configContext.connector.displayName;
    }
    if(connectorHealthCheckResult.summary.performed) {
      success = connectorHealthCheckResult.summary.success;
    }
    return (
      <React.Fragment>
        {success !== EAPHealthCheckSuccess.UNDEFINED && 
          <div style={{color: SystemHealthCommon.getColor(success) }}>
            connector: {connectorName}: {success} ({connectorHealthCheckResult.summary.timestampStr})
          </div>
        }
        {success === EAPHealthCheckSuccess.UNDEFINED && 
          <div>
            no active connector
          </div>
        }
      </React.Fragment>
    );
  }
  const renderSystemHealthInfo = () => {
    return (
      <React.Fragment>
        {renderConnectorHealthInfo()}
      </React.Fragment>
    );   
  }

  const getSystemHealthIcon = () => {
    if(systemHealthCheckSummary.performed) {
      if(systemHealthCheckSummary.success) return 'pi pi-check';
      else return 'pi pi-times';
    } else return 'pi pi-question';
  }

  const navigateTo = (path: string): void => {
    history.push(path);
  }

  return (
    <React.Fragment>
      <Button 
        icon={getSystemHealthIcon()}
        className={SystemHealthCommon.getButtonClassName(systemHealthCheckSummary)}
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
