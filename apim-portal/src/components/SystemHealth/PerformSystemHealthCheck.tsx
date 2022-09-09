
import React from "react";
import { useInterval } from 'react-use';

import { ConfigContext } from "../APContextProviders/ConfigContextProvider/ConfigContextProvider";
import { UserContext } from "../APContextProviders/APUserContextProvider";
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
  Globals, 
} from "../../utils/Globals";
import { APLogger } from "../../utils/APLogger";
import { ConfigHelper } from "../APContextProviders/ConfigContextProvider/ConfigHelper";

import "../APComponents.css";
import "./SystemHealth.css";

export interface IPerformSystemHealthCheckProps {}

export const PerformSystemHealthCheck: React.FC<IPerformSystemHealthCheckProps> = (props: IPerformSystemHealthCheckProps) => {
  const componentName = 'PerformSystemHealthCheck';

  const HealthCheckInterval_ms: number = 60000; // every minute
  // const HealthCheckInterval_ms: number = 10000;

  const ConnectorHealthCheckResultNotPerformed: TAPConnectorHealthCheckResult = APConnectorHealthCheck.getInitializedHealthCheckResult_NotPerformed();
  const ServerHealthCheckResultNotPerformed: TAPServerHealthCheckResult = APServerHealthCheck.getInitializedHealthCheckResult_NotPerformed();
  const PortalAppHealthCheckResultNotPerformed: TAPPortalAppHealthCheckResult = APPortalAppHealthCheck.getInitializedHealthCheckResult_NotPerformed();
  const InitialHealthCheckSummary: TAPHealthCheckSummary = {
    performed: false,
    success: EAPHealthCheckSuccess.UNDEFINED,
    timestamp: Date.now(),
  }

  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [userContext] = React.useContext(UserContext);
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  const [healthCheckSummaryContext, dispatchHealthCheckSummaryContextAction] = React.useContext(APHealthCheckSummaryContext);
  const [delay] = React.useState<number>(HealthCheckInterval_ms); 
  const [count, setCount] = React.useState<number>(0);
  const [serverHealthCheckResult, setServerHealthCheckResult] = React.useState<TAPServerHealthCheckResult>(ServerHealthCheckResultNotPerformed);
  const [connectorHealthCheckResult, setConnectorHealthCheckResult] = React.useState<TAPConnectorHealthCheckResult>(ConnectorHealthCheckResultNotPerformed);
  const [portalAppHealthCheckResult, setPortalAppHealthCheckResult] = React.useState<TAPPortalAppHealthCheckResult>(PortalAppHealthCheckResultNotPerformed);
  const [systemHealthCheckSummary, setSystemHealthCheckSummary] = React.useState<TAPHealthCheckSummary>(InitialHealthCheckSummary);
  const [reinitializeConfigContextCount, setReinitializeConfigContextCount] = React.useState<number>(0);

  React.useEffect(() => {
    doSystemHealthCheck();
  }, [configContext]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(serverHealthCheckResult.summary.performed) {
      dispatchHealthCheckContextAction({ type: 'SET_SERVER_HEALTHCHECK_RESULT', serverHealthCheckResult: serverHealthCheckResult});
      if(serverHealthCheckResult.summary.success !== healthCheckSummaryContext.serverHealthCheckSuccess) {
        dispatchHealthCheckSummaryContextAction({ type: 'SET_SERVER_HEALTHCHECK_SUCCESS', serverHealthCheckSuccess: serverHealthCheckResult.summary.success});
      }
    }
  }, [serverHealthCheckResult]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    dispatchHealthCheckContextAction({ type: 'SET_CONNECTOR_HEALTHCHECK_RESULT', connectorHealthCheckResult: connectorHealthCheckResult});
    if(connectorHealthCheckResult.summary.success !== healthCheckSummaryContext.connectorHealthCheckSuccess) {
      dispatchHealthCheckSummaryContextAction({ type: 'SET_CONNECTOR_HEALTHCHECK_SUCCESS', connectorHealthCheckSuccess: connectorHealthCheckResult.summary.success});
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
    let _serverHealthCheckResult: TAPServerHealthCheckResult = ServerHealthCheckResultNotPerformed;
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
      return ConnectorHealthCheckResultNotPerformed;
    }
    let _connectorHealthCheckResult: TAPConnectorHealthCheckResult = ConnectorHealthCheckResultNotPerformed;
    if(configContext.connector) {
      try {
        _connectorHealthCheckResult = await APConnectorHealthCheck.doHealthCheck({
          configContext: configContext, 
          connectorId: undefined
        });
      } catch(e) {
        // should never get here
        APLogger.error(APLogger.createLogEntry(logName, e));
        throw e;
      }        
    }
    return _connectorHealthCheckResult;
  }
  const doSystemHealthCheck = async () => {  
    // const funcName = 'doSystemHealthCheck';
    // const logName = `${componentName}.${funcName}()`;

    setCount(count + 1);
    // alert(`${logName}: delay=${delay}, count=${count}`);

    if(configContext.isInitialized) {
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

  }

  return (<></>);
}
