
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageExternalSystemsCommon";
import APExternalSystemsDisplayService from "../../../displayServices/APExternalSystemsDisplayService";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";

import '../../../components/APComponents.css';
import "./ManageExternalSystems.css";

export interface IDeleteExternalSystemProps {
  organizationId: string;
  externalSystemId: string;
  externalSystemDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeleteExternalSystem: React.FC<IDeleteExternalSystemProps> = (props: IDeleteExternalSystemProps) => {
  const componentName = 'DeleteExternalSystem';

  const DeleteManagedObjectConfirmDialogHeader = "Confirm Deleting External System";

  const [showManagedObjectDeleteDialog, setShowManagedObjectDeleteDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiDeleteManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_DELETE_EXTERNAL_SYSTEM, `delete external system: ${props.externalSystemDisplayName}`);
    try { 
      await APExternalSystemsDisplayService.apiDelete_ApExternalSystemDisplay({
        organizationId: props.organizationId,
        externalSystemId: props.externalSystemId
      });
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
  const doDeleteManagedObject = async () => {
    props.onLoadingChange(true);
    await apiDeleteManagedObject();
    props.onLoadingChange(false);
  }

  const onDeleteManagedObject = () => {
    doDeleteManagedObject();
  }

  const onDeleteManagedObjectCancel = () => {
    setShowManagedObjectDeleteDialog(false);
    props.onCancel();
  }

  const renderDeleteManagedObjectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <p>Deleting External System: <b>{props.externalSystemDisplayName}</b>.</p>
        <p>Are you sure you want to delete it?</p>
      </React.Fragment>  
    );
  }

  const renderDeleteManagedObjectDialogFooter = (): JSX.Element =>{
    return (
      <React.Fragment>
        <Button label="Cancel" className="p-button-text p-button-plain" onClick={onDeleteManagedObjectCancel} />
        <Button label="Delete" icon="pi pi-trash" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject}/>
      </React.Fragment>
    );
  } 

  const renderManagedObjectDeleteDialog = (): JSX.Element => {
    // const funcName = 'renderManagedObjectDeleteDialog';
    // const logName = `${componentName}.${funcName}()`;
    return (
      <Dialog
        className="p-fluid"
        visible={showManagedObjectDeleteDialog} 
        style={{ width: '450px' }} 
        header={DeleteManagedObjectConfirmDialogHeader}
        modal
        closable={false}
        footer={renderDeleteManagedObjectDialogFooter()}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
            <p><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></p>
            {renderDeleteManagedObjectDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <div className="ap-manage-external-system">
      {renderManagedObjectDeleteDialog()}
    </div>
  );
}
