
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { 
  ApsUsersService, 
} from '@solace-iot-team/apim-server-openapi-browser';
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageUsersCommon";

import '../../../components/APComponents.css';
import "./ManageUsers.css";

export interface IDeleteUserProps {
  userId: TManagedObjectId;
  userDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeleteUser: React.FC<IDeleteUserProps> = (props: IDeleteUserProps) => {
  const componentName = 'DeleteUser';

  const DeleteManagedObjectConfirmDialogHeader = "Confirm Deleting User";

  const [showManagedObjectDeleteDialog, setShowManagedObjectDeleteDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiDeleteManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_DELETE_USER, `delete user: ${props.userId}`);
    try { 
      await ApsUsersService.deleteApsUser(props.userId);
    } catch(e) {
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
    // const funcName = 'renderDeleteManagedObjectDialogContent';
    // const logName = `${componentName}.${funcName}()`;
    return (
      <React.Fragment>
        <p>Deleting user <b>{props.userId}</b>.</p>
        <p>Alternatively you could de-activate the user.</p>
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
    <div className="manage-users">
      {renderManagedObjectDeleteDialog()}
    </div>
  );
}
