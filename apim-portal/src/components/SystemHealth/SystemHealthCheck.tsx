
import React from "react";
import { useInterval } from 'react-use';
import { useHistory } from 'react-router-dom';

import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";

import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { UserContext } from "../UserContextProvider/UserContextProvider";
import { APHealthCheckContext } from "../APHealthCheckContextProvider";
import { APHealthCheckSummaryContext } from "../APHealthCheckSummaryContextProvider";
import { 
  APConnectorHealthCheck, 
  APPortalAppHealthCheck, 
  TAPPortalAppHealthCheckResult, 
  APServerHealthCheck, 
  EAPHealthCheckSuccess, 
  TAPConnectorHealthCheckResult, 
  TAPHealthCheckSummary, 
  TAPServerHealthCheckResult 
} from "../../utils/APHealthCheck";
import { 
  EUIAdminPortalResourcePaths, 
  EUICommonResourcePaths,
  Globals, 
} from "../../utils/Globals";
import { RenderWithRbac } from "../../auth/RenderWithRbac";
import { APLogger } from "../../utils/APLogger";
import { SystemHealthCommon } from "./SystemHealthCommon";
import { DisplaySystemHealthInfo } from "./DisplaySystemHealthInfo";
import { ConfigHelper } from "../ConfigContextProvider/ConfigHelper";

import "../APComponents.css";
import "./SystemHealth.css";

export interface ISystemHealthCheckProps {}

export const SystemHealthCheck: React.FC<ISystemHealthCheckProps> = (props: ISystemHealthCheckProps) => {
  const componentName = 'SystemHealthCheck';

  const HealthCheckInterval_ms: number = 60000; // every minute
  // const HealthCheckInterval_ms: number = 10000;

  const connectorHealthCheckResultNotPerformed: TAPConnectorHealthCheckResult = APConnectorHealthCheck.getInitializedHealthCheckResult_NotPerformed();
  const serverHealthCheckResultNotPerformed: TAPServerHealthCheckResult = APServerHealthCheck.getInitializedHealthCheckResult_NotPerformed();
  const portalAppHealthCheckResultNotPerformed: TAPPortalAppHealthCheckResult = APPortalAppHealthCheck.getInitializedHealthCheckResult_NotPerformed();
  const initialHealthCheckSummary: TAPHealthCheckSummary = {
    performed: false,
    success: EAPHealthCheckSuccess.UNDEFINED,
    timestamp: Date.now(),
  }

  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [userContext] = React.useContext(UserContext);
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  const [healthCheckSummaryContext, dispatchHealthCheckSummaryContextAction] = React.useContext(APHealthCheckSummaryContext);
  const history = useHistory();
  const op = React.useRef<any>(null);
  const [delay] = React.useState<number>(HealthCheckInterval_ms); 
  const [count, setCount] = React.useState<number>(0);
  const [serverHealthCheckResult, setServerHealthCheckResult] = React.useState<TAPServerHealthCheckResult>(serverHealthCheckResultNotPerformed);
  const [connectorHealthCheckResult, setConnectorHealthCheckResult] = React.useState<TAPConnectorHealthCheckResult>(connectorHealthCheckResultNotPerformed);
  const [portalAppHealthCheckResult, setPortalAppHealthCheckResult] = React.useState<TAPPortalAppHealthCheckResult>(portalAppHealthCheckResultNotPerformed);
  const [systemHealthCheckSummary, setSystemHealthCheckSummary] = React.useState<TAPHealthCheckSummary>(initialHealthCheckSummary);
  const [reinitializeConfigContextCount, setReinitializeConfigContextCount] = React.useState<number>(0);

  const navigateTo = (path: string): void => {
    history.push(path);
  }

  React.useEffect(() => {
    doSystemHealthCheck();
  }, [configContext]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(serverHealthCheckResult.summary.performed) {
      dispatchHealthCheckContextAction({ type: 'SET_SERVER_HEALTHCHECK_RESULT', serverHealthCheckResult: serverHealthCheckResult});
      if(serverHealthCheckResult.summary.success !== healthCheckSummaryContext.serverHealthCheckSuccess) {
        dispatchHealthCheckSummaryContextAction({ type: 'SET_SERVER_HEALTHCHECK_SUCCESS', serverHealthCheckSuccess: serverHealthCheckResult.summary.success});
      }
      if(serverHealthCheckResult.summary.performed && serverHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL) {
        navigateTo(EUICommonResourcePaths.HealthCheckView);
      }
    }
  }, [serverHealthCheckResult]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(connectorHealthCheckResult.summary.performed) {
      dispatchHealthCheckContextAction({ type: 'SET_CONNECTOR_HEALTHCHECK_RESULT', connectorHealthCheckResult: connectorHealthCheckResult});
      if(connectorHealthCheckResult.summary.success !== healthCheckSummaryContext.connectorHealthCheckSuccess) {
        dispatchHealthCheckSummaryContextAction({ type: 'SET_CONNECTOR_HEALTHCHECK_SUCCESS', connectorHealthCheckSuccess: connectorHealthCheckResult.summary.success});
      }
    }
  }, [connectorHealthCheckResult]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(portalAppHealthCheckResult.summary.performed) {
      dispatchHealthCheckContextAction({ type: 'SET_PORTAL_APP_HEALTHCHECK_RESULT', portalAppHealthCheckResult: portalAppHealthCheckResult});
    }
  }, [portalAppHealthCheckResult]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    dispatchHealthCheckContextAction({ type: 'SET_SYSTEM_HEALTHCHECK_SUMMARY', systemHealthCheckSummary: systemHealthCheckSummary});
  }, [systemHealthCheckSummary]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if(reinitializeConfigContextCount > 0) ConfigHelper.doInitialize(dispatchConfigContextAction);
  }, [reinitializeConfigContextCount]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useInterval( () => 
    {
      doSystemHealthCheck();
    },
    delay
  );

  const doPortalAppHealthCheck = async (): Promise<TAPPortalAppHealthCheckResult> => {
    const funcName = 'doPortalAppHealthCheck';
    const logName = `${componentName}.${funcName}()`;
    let _portalAppHealthCheckResult: TAPPortalAppHealthCheckResult = APPortalAppHealthCheck.getInitializedHealthCheckResult_NotPerformed();
    try {
      _portalAppHealthCheckResult = await APPortalAppHealthCheck.doHealthCheck(configContext, userContext);
    } catch(e) {
      // should never get here
      APLogger.error(APLogger.createLogEntry(logName, e));
      throw e;
    }        
    return _portalAppHealthCheckResult;
  }

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

    const portalAppHealthCheckResult: TAPPortalAppHealthCheckResult = await doPortalAppHealthCheck();
    // if portal healthcheck fail, reload app
    if(portalAppHealthCheckResult.summary.success !== EAPHealthCheckSuccess.PASS) {
      Globals.reloadApp();
    } 

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
    setPortalAppHealthCheckResult(portalAppHealthCheckResult);

    // re-initialize config context if server status has changed 
    if(serverHealthCheckResult.summary.success !== healthCheckContext.serverHealthCheckResult?.summary.success) setReinitializeConfigContextCount(reinitializeConfigContextCount + 1);
  }

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
