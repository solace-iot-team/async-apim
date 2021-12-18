
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from "primereact/divider";

import { 
  ApsConfigService, APSConnector, APSId
} from '@solace-iot-team/apim-server-openapi-browser';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageConnectorsCommon, TViewManagedObject } from "./ManageConnectorsCommon";
import { APConnectorApiCalls, TAPConnectorInfo } from "../../../utils/APConnectorApiCalls";
import { APConnectorHealthCheck, EAPHealthCheckSuccess, TAPConnectorHealthCheckResult } from "../../../utils/APHealthCheck";
import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";
import { SystemHealthCommon } from "../../../components/SystemHealth/SystemHealthCommon";

export interface ISetConnectorActiveProps {
  connectorId: APSId;
  connectorDisplayName: string;
  healthCheckResult?: boolean;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SetConnectorActive: React.FC<ISetConnectorActiveProps> = (props: ISetConnectorActiveProps) => {
  const componentName = 'SetConnectorActive';

  type TManagedObject = TViewManagedObject;

  const SetConnectorActiveConfirmDialogHeader = "Confirm Setting Connector Active";

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */  
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [showManagedObjectDialog, setShowManagedObjectDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_CONNECTOR, `retrieve details for connector: ${props.connectorDisplayName}`);
    try { 
      const apsConnector: APSConnector = await ApsConfigService.getApsConnector({
        connectorId: props.connectorId
      });
      const healthCheckResult: TAPConnectorHealthCheckResult = await APConnectorHealthCheck.doHealthCheck(configContext, apsConnector.connectorClientConfig);    
      let apConnectorInfo: TAPConnectorInfo | undefined = undefined;
      if(healthCheckResult.summary.success) {
        apConnectorInfo = await APConnectorApiCalls.getConnectorInfo(apsConnector.connectorClientConfig);
      }
      setManagedObject(ManageConnectorsCommon.createViewManagedObject(apsConnector, apConnectorInfo, healthCheckResult));
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiSetConnectorActive = async(): Promise<TApiCallState> => {
    const funcName = 'apiSetConnectorActive';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_SET_CONNECTOR_ACTIVE, `set connector active: ${props.connectorDisplayName}`);
    try { 
      await ApsConfigService.setApsConnectorActive({
        connectorId: props.connectorId
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
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
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_SET_CONNECTOR_ACTIVE) props.onSuccess(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *
  const doSetConnectorActive = async () => {
    props.onLoadingChange(true);
    await apiSetConnectorActive();
    props.onLoadingChange(false);
  }

  const onSetConnectorActive = () => {
    doSetConnectorActive();
  }

  const onSetConnectorActiveCancel = () => {
    setShowManagedObjectDialog(false);
    props.onCancel();
  }

  // const renderHealthCheckInfo = () => {
  //   return(
  //     <>
  //       <pre style={ { fontSize: '10px' }} >
  //         {JSON.stringify(managedObject?.healthCheckResult, null, 2)};
  //       </pre>
  //     </>
  //   );
  // }

  const renderManagedObjectDialogContent = (): JSX.Element => {

    const renderWarning = (success: EAPHealthCheckSuccess) => {
      if(success !== EAPHealthCheckSuccess.PASS)
        return(
          <>
            <Divider />
            <p style={{ color: SystemHealthCommon.getColor(success)}}><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />Connector health check: {success}.</p>
            <Divider />
          </>
        );
    }

    return (
      <React.Fragment>
        { managedObject && renderWarning(managedObject.healthCheckResult.summary.success) }
        <p>Are you sure you want to set connector to active?</p>
        <p> <b>{props.connectorDisplayName}</b></p>
        <p><b>Note:</b>You will have to login again.</p>
        {/* {renderHealthCheckInfo()} */}
      </React.Fragment>  
    );
  }

  const renderManagedObjectDialogFooter = (): JSX.Element =>{
    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onSetConnectorActiveCancel} />
          <Button label="Set Active" icon="pi pi-trash" className="p-button-text p-button-plain p-button-outlined" onClick={onSetConnectorActive}/>
      </React.Fragment>
    );
  } 

  const renderManagedObjectDialog = (): JSX.Element => {
    return (
      <Dialog
        className="p-fluid"
        visible={showManagedObjectDialog} 
        style={{ width: '450px' }} 
        header={SetConnectorActiveConfirmDialogHeader}
        modal
        closable={false}
        footer={renderManagedObjectDialogFooter()}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
            {renderManagedObjectDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-connectors">
      {renderManagedObjectDialog()}
    </div>
  );
}
