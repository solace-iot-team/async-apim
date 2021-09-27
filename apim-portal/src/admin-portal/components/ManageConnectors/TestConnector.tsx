
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { 
  ApsConfigService, 
  APSConnector
} from '@solace-iot-team/apim-server-openapi-browser';

import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";
import { THealthCheckResult } from "../../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APConnectorHealthCheck } from "../../../utils/APConnectorHealthCheck";
import { APClientConnectorRaw } from "../../../utils/APClientConnectorRaw";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageConnectorsCommon";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";

export interface ITestConnectorProps {
  connectorId: TManagedObjectId;
  connectorDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const TestConnector: React.FC<ITestConnectorProps> = (props: ITestConnectorProps) => {
  const componentName = 'TestConnector';

  const TestingDialogHeader = "Performing health check ...";
  const ResultDialogHeader = "Heath check details:";

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */  
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [apsConnector, setApsConnector] = React.useState<APSConnector>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showTestDialog, setShowTestDialog] = React.useState<boolean>(true);
  const [healthCheckResult, setHealthCheckResult] = React.useState<THealthCheckResult>();

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_CONNECTOR, `retrieve details for connector: ${props.connectorDisplayName}`);
    try { 
      const apsConnector: APSConnector = await ApsConfigService.getApsConnector({
        connectorId: props.connectorId
      });
      // console.log(`${logName}: apsConnector = ${JSON.stringify(apsConnector, null, 2)}`);
      setApsConnector(apsConnector);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * Test *
  const doTestConnector = async() => {  
    const funcName = 'doTestConnector';
    const logName = `${componentName}.${funcName}()`;
    if(!apsConnector) throw new Error(`${logName}: apsConnector is undefined`);
    setApiCallStatus(null);
    props.onLoadingChange(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(logName, `test configuration for ${apsConnector.displayName}`);
    try {
      const _healthCheckResult: THealthCheckResult = await APConnectorHealthCheck.doHealthCheck(configContext, apsConnector.connectorClientConfig);    
      callState.success = _healthCheckResult.summary.success;
      setHealthCheckResult(_healthCheckResult);
      // console.log(`${logName}: healthCheckResult=${JSON.stringify(_healthCheckResult, null, 2)}`);
    } catch(e) {
      APClientConnectorRaw.logError(e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    props.onLoadingChange(false);
    return callState;
  }

  const onTestConnector = () => {
    // const funcName = 'onTestConnector';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: apsConnector = ${JSON.stringify(apsConnector, null, 2)}`);
    setHealthCheckResult(undefined);
    setShowTestDialog(true);
    doTestConnector();
  }

  // * useEffect Hooks *

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
 
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apsConnector) {
      onTestConnector();
    }
  }, [apsConnector]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *
  const onTestDialogClose = () => {
    const funcName = 'onTestDialogClose';
    const logName = `${componentName}.${funcName}()`;
    setShowTestDialog(false);
    if(!apiCallStatus) throw new Error(`${logName}: apiCallStatus is null`);
    props.onSuccess(apiCallStatus);
  }

  const renderTestDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <h3>{apsConnector?.displayName}:</h3>
        {healthCheckResult &&
          <div>
            <p>{ResultDialogHeader}</p>
            <pre style={ { fontSize: '10px' }} >
              {JSON.stringify(healthCheckResult?.healthCheckLog, null, 2)}
            </pre>  
            <p style={{color: healthCheckResult?.summary.success ? 'green' : 'red' }}>Summary: {healthCheckResult?.summary.success ? 'ok' : 'fail'}</p>
          </div>            
        }
        {!healthCheckResult &&
          <div>
            <p>{TestingDialogHeader}</p>
            <div style={{ height: '200px' }}></div>
          </div>
        }
      </React.Fragment>
    )
  }

  const renderTestDialogFooter = (): JSX.Element => {
    return (
      <React.Fragment>
          <Button label="Close" icon="pi pi-times" className="p-button-text p-button-plain p-button-outlined" onClick={onTestDialogClose}/>
      </React.Fragment>
    );
  } 

  const renderTestDialog = (): JSX.Element => {
    return (
      <Dialog
        className="p-fluid"
        visible={showTestDialog} 
        style={{ width: '550px' }} 
        header={`Testing Connector Configuration`}
        modal
        closable={false}
        footer={renderTestDialogFooter()}
        onHide={()=> {}}
      >
        <div className="test-log">
          {renderTestDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-connectors">
      {renderTestDialog()}
    </div>
  );
}
