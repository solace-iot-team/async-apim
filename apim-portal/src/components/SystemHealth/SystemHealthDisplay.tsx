
import React from "react";
import { useInterval } from 'react-use';
import { useHistory } from 'react-router-dom';

import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Divider } from "primereact/divider";

import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { APHealthCheckContext } from "../APHealthCheckContextProvider";
import { APConnectorHealthCheck } from "../../utils/APConnectorHealthCheck";
import { APClientConnectorRaw } from "../../utils/APClientConnectorRaw";
import { 
  EUIAdminPortalResourcePaths, 
  Globals, 
  TAPConfigIssueList, 
  THealthCheckResult, 
  THealthCheckSummary 
} from "../../utils/Globals";
import { RenderWithRbac } from "../../auth/RenderWithRbac";

import "../APComponents.css";
import "./SystemHealth.css";

export interface ISystemHealthProps {
}

export const SystemHealthDisplay: React.FC<ISystemHealthProps> = (props: ISystemHealthProps) => {
  // const componentName = 'SystemHealthDisplay';

  const healthCheckInterval_ms: number = 30000;
  // const healthCheckInterval_ms: number = 5000;
  // const healthCheckInterval_ms: number = 300000;
  
  const connectorHealthCheckResultNotPerformed: THealthCheckResult = {
    healthCheckLog: [{action: 'check connector', success: false, details: {} }],
    summary: { 
      performed: false, 
      success: false,
      timestamp: Date.now()
    }
  }
  const systemHealthCheckSummaryNotPerformed: THealthCheckSummary = {
    performed: false, 
    success: false,
    timestamp: Date.now()
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  const history = useHistory();
  const op = React.useRef<any>(null);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [delay, setDelay] = React.useState<number>(healthCheckInterval_ms); 
  const [count, setCount] = React.useState<number>(0);
  const [connectorHealthCheckResult, setConnectorHealthCheckResult] = React.useState<THealthCheckResult>(connectorHealthCheckResultNotPerformed);
  const [systemHealthCheckSummary, setSystemHealthCheckSummary] = React.useState<THealthCheckSummary>(systemHealthCheckSummaryNotPerformed);
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
    // const funcName = 'doSystemHealthCheck';
    // const logName = `${componentName}.${funcName}()`;
    let _connectorHealthCheckResult: THealthCheckResult = connectorHealthCheckResultNotPerformed;
    if(configContext.connector) {
      try {
        _connectorHealthCheckResult = await APConnectorHealthCheck.doHealthCheck(configContext, configContext.connector.connectorClientConfig);
      } catch(e) {
        APClientConnectorRaw.logError(e);
        throw e;
      }        
    }
    setConnectorHealthCheckResult(_connectorHealthCheckResult);
    setSystemHealthCheckSummary({
      performed: _connectorHealthCheckResult.summary.performed,
      success: _connectorHealthCheckResult.summary.success,
      timestamp: Date.now()
    });
    setConfigIssueList(Globals.crossCheckConfiguration(configContext));
  }

  const renderConnectorHealthInfo = () => {
    // const funcName = 'renderConnectorHealthInfo';
    // const logName = `${componentName}.${funcName}()`;

    let connectorName: string = 'unknown';
    let success: boolean | undefined = undefined;
    if(configContext.connector) {
      connectorName = configContext.connector.displayName;
    }
    if(connectorHealthCheckResult.summary.performed) {
      success = connectorHealthCheckResult.summary.success;
    }
    return (
      <React.Fragment>
        {success !== undefined && 
          <div style={{color: success ? 'green' : 'red' }}>
            connector: {connectorName}: {success ? 'ok' : 'fail'}
          </div>
        }
        {success === undefined && 
          <div>
            no active connector
          </div>
        }
      </React.Fragment>
    );
  }
  const renderSystemHealthInfo = () => {
    // let org = userContext.organizationId?userContext.organizationId:null;
    // let connnectorInstance = userContext.connectorInstance?userContext.connectorInstance:null;
    return (
      <React.Fragment>
        <p>count={count}</p>
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

  const getSystemHealthButtonClassName = () => {
    if(systemHealthCheckSummary.performed) {
      if(systemHealthCheckSummary.success) return "p-button-rounded p-button-success";
      else return "p-button-rounded p-button-danger";
    } else return 'p-button-rounded p-button-secondary p-button-outlined';
  }

  const navigateTo = (path: string): void => {
    history.push(path);
  }

  return (
    <React.Fragment>
      <Button 
        icon={getSystemHealthIcon()}
        className={getSystemHealthButtonClassName()}
        onClick={(e) => op.current.toggle(e) } />
      <OverlayPanel className="ap-navbar system-health-overlay-panel" ref={op} id="system_health_overlay_panel" style={{width: '450px'}} >
        {renderSystemHealthInfo()}
        <RenderWithRbac resourcePath={EUIAdminPortalResourcePaths.MonitorSystemHealth} >
          <Divider />
          <Button className="p-button-text p-button-plain" icon="pi pi-fw pi-heart" label="System Health Details" onClick={() => { navigateTo(EUIAdminPortalResourcePaths.MonitorSystemHealth); op.current.hide(); }} />
        </RenderWithRbac>
      </OverlayPanel>
    </React.Fragment>
  );
}
