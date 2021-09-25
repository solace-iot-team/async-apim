
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { 
  ApsConfigService
} from '@solace-iot-team/apim-server-openapi-browser';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageConnectorsCommon";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";

export interface ISetConnectorActiveProps {
  connectorId: TManagedObjectId;
  connectorDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SetConnectorActive: React.FC<ISetConnectorActiveProps> = (props: ISetConnectorActiveProps) => {
  const componentName = 'SetConnectorActive';

  const SetConnectorActiveConfirmDialogHeader = "Confirm Setting Connector Active";

  const [showManagedObjectDialog, setShowManagedObjectDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiSetConnectorActive = async(): Promise<TApiCallState> => {
    const funcName = 'apiSetConnectorActive';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_SET_CONNECTOR_ACTIVE, `set connector active: ${props.connectorDisplayName}`);
    try { 
      await ApsConfigService.setApsConnectorActive(props.connectorId);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else props.onSuccess(apiCallStatus);
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

  const renderManagedObjectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <p>Are you sure you want to set connector to active?</p>
        <p> <b>{props.connectorDisplayName} ({props.connectorId}) </b></p>
        <p><b>Note:</b>You will have to login again.</p>
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
            <p><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></p>
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
