
import React from "react";
import { useInterval } from 'react-use';
import { useHistory } from 'react-router-dom';

import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";

import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { APHealthCheckContext } from "../APHealthCheckContextProvider";
import { 
  APConnectorHealthCheck, 
  APServerHealthCheck, 
  EAPHealthCheckSuccess, 
  TAPConnectorHealthCheckResult, 
  TAPHealthCheckSummary, 
  TAPServerHealthCheckResult 
} from "../../utils/APHealthCheck";
import { 
  EUIAdminPortalResourcePaths, EUICommonResourcePaths, 
} from "../../utils/Globals";
import { RenderWithRbac } from "../../auth/RenderWithRbac";
import { APLogger } from "../../utils/APLogger";
import { SystemHealthCommon } from "./SystemHealthCommon";
import { DisplaySystemHealthInfo } from "./DisplaySystemHealthInfo";

import "../APComponents.css";
import "./SystemHealth.css";
import { ConfigHelper } from "../ConfigContextProvider/ConfigHelper";

export interface ISystemHealthCheckProps {}

export const SystemHealthCheck: React.FC<ISystemHealthCheckProps> = (props: ISystemHealthCheckProps) => {
  const componentName = 'SystemHealthCheck';

  // const HealthCheckInterval_ms: number = 60000;
  const HealthCheckInterval_ms: number = 10000;

  const connectorHealthCheckResultNotPerformed: TAPConnectorHealthCheckResult = APConnectorHealthCheck.getInitializedHealthCheckResult_NotPerformed();
  const serverHealthCheckResultNotPerformed: TAPServerHealthCheckResult = APServerHealthCheck.getInitializedHealthCheckResult_NotPerformed();
  const initialHealthCheckSummary: TAPHealthCheckSummary = {
    performed: false,
    success: EAPHealthCheckSuccess.UNDEFINED,
    timestamp: Date.now(),
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  const history = useHistory();
  const op = React.useRef<any>(null);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [delay, setDelay] = React.useState<number>(HealthCheckInterval_ms); 
  const [count, setCount] = React.useState<number>(0);
  const [serverHealthCheckResult, setServerHealthCheckResult] = React.useState<TAPServerHealthCheckResult>(serverHealthCheckResultNotPerformed);
  const [connectorHealthCheckResult, setConnectorHealthCheckResult] = React.useState<TAPConnectorHealthCheckResult>(connectorHealthCheckResultNotPerformed);
  const [systemHealthCheckSummary, setSystemHealthCheckSummary] = React.useState<TAPHealthCheckSummary>(initialHealthCheckSummary);
  const [reinitializeConfigContextCount, setReinitializeConfigContextCount] = React.useState<number>(0);

  React.useEffect(() => {
    doSystemHealthCheck();
  }, [configContext]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    dispatchHealthCheckContextAction({ type: 'SET_SERVER_HEALTHCHECK_RESULT', serverHealthCheckResult: serverHealthCheckResult});
    if(serverHealthCheckResult.summary.performed && serverHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL) {
      navigateTo(EUICommonResourcePaths.HealthCheckView);
    }
  }, [serverHealthCheckResult]);

  React.useEffect(() => {
    dispatchHealthCheckContextAction({ type: 'SET_CONNECTOR_HEALTHCHECK_RESULT', connectorHealthCheckResult: connectorHealthCheckResult});
  }, [connectorHealthCheckResult]);

  React.useEffect(() => {
    dispatchHealthCheckContextAction({ type: 'SET_SYSTEM_HEALTHCHECK_SUMMARY', systemHealthCheckSummary: systemHealthCheckSummary});
  }, [systemHealthCheckSummary]);
  
  React.useEffect(() => {
    if(reinitializeConfigContextCount > 0) ConfigHelper.doInitialize(dispatchConfigContextAction);
  }, [reinitializeConfigContextCount]);

  useInterval( () => 
    {
      doSystemHealthCheck();
    },
    delay
  );

  const doServerHealthCheck = async (): Promise<TAPServerHealthCheckResult> => {
    const funcName = 'doServerHealthCheck';
    const logName = `${componentName}.${funcName}()`;
    let _serverHealthCheckResult: TAPServerHealthCheckResult = serverHealthCheckResultNotPerformed;
    try {
      _serverHealthCheckResult = await APServerHealthCheck.doHealthCheck(configContext);
    } catch(e) {
      // should never get here
      APLogger.error(APLogger.createLogEntry(logName, e));
      throw e;
    }        
    return _serverHealthCheckResult;
  }
  const doConnectorHealthCheck = async (serverHealthCheckResult: TAPServerHealthCheckResult): Promise<TAPConnectorHealthCheckResult> => {
    const funcName = 'doConnectorHealthCheck';
    const logName = `${componentName}.${funcName}()`;
    if(serverHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL) {
      return connectorHealthCheckResultNotPerformed;
    }
    let _connectorHealthCheckResult: TAPConnectorHealthCheckResult = connectorHealthCheckResultNotPerformed;
    if(configContext.connector) {
      try {
        _connectorHealthCheckResult = await APConnectorHealthCheck.doHealthCheck(configContext, configContext.connector.connectorClientConfig);
      } catch(e) {
        // should never get here
        APLogger.error(APLogger.createLogEntry(logName, e));
        throw e;
      }        
    }
    return _connectorHealthCheckResult;
  }
  const doSystemHealthCheck = async () => {  

    setCount(count + 1);

    const serverHealthCheckResult: TAPServerHealthCheckResult = await doServerHealthCheck();
    const connectorHealthCheckResult: TAPConnectorHealthCheckResult = await doConnectorHealthCheck(serverHealthCheckResult);

    const summary: TAPHealthCheckSummary = {
      performed: serverHealthCheckResult.summary.performed || connectorHealthCheckResult.summary.performed,
      success: EAPHealthCheckSuccess.UNDEFINED,
      timestamp: Date.now()
    };
    if(serverHealthCheckResult.summary.success === EAPHealthCheckSuccess.PASS && connectorHealthCheckResult.summary.success === EAPHealthCheckSuccess.PASS) summary.success = EAPHealthCheckSuccess.PASS;
    if(serverHealthCheckResult.summary.success === EAPHealthCheckSuccess.PASS && connectorHealthCheckResult.summary.success === EAPHealthCheckSuccess.UNDEFINED) summary.success = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
    if(serverHealthCheckResult.summary.success === EAPHealthCheckSuccess.PASS_WITH_ISSUES || connectorHealthCheckResult.summary.success === EAPHealthCheckSuccess.PASS_WITH_ISSUES) summary.success = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
    if(serverHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL || connectorHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL) summary.success = EAPHealthCheckSuccess.FAIL;

    setSystemHealthCheckSummary(summary);
    setServerHealthCheckResult(serverHealthCheckResult);
    setConnectorHealthCheckResult(connectorHealthCheckResult);

    // re-initialize config context if server status has changed 
    if(serverHealthCheckResult.summary.success !== healthCheckContext.serverHealthCheckResult?.summary.success) setReinitializeConfigContextCount(reinitializeConfigContextCount + 1);
  }

  const renderSystemHealthInfo = () => {
    return (
      <React.Fragment>
        {/* <p>count={count}, reinitializeConfigContextCount={reinitializeConfigContextCount}</p> */}
        <DisplaySystemHealthInfo />
      </React.Fragment>
    );   
  }

  const navigateTo = (path: string): void => {
    history.push(path);
  }

  return (
    <React.Fragment>
      <Button 
        icon={SystemHealthCommon.getSystemHealthIcon(systemHealthCheckSummary)}
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
