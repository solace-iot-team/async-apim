
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";
import APAdminPortalAppsDisplayService from "../../displayServices/APAdminPortalAppsDisplayService";
import { Loading } from "../../../components/Loading/Loading";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IDeleteAppProps {
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onDeleteSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeleteApp: React.FC<IDeleteAppProps> = (props: IDeleteAppProps) => {
  const ComponentName = 'DeleteApp';

  const DeleteManagedObjectConfirmDialogHeader = "Confirm Deleting App";

  const [showManagedObjectDeleteDialog, setShowManagedObjectDeleteDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiDeleteManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_DELETE_APP, `delete app: ${props.appEntityId.displayName}`);
    try {
      await APAdminPortalAppsDisplayService.apiDelete_ApAppDisplay({
        organizationId: props.organizationId,
        appId: props.appEntityId.id
      });
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else props.onDeleteSuccess(apiCallStatus);
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

  const renderDeleteManagedObjectConfirmDialogHeader = () => {
    return (<span style={{ color: 'red' }}>{DeleteManagedObjectConfirmDialogHeader}</span>);
  }

  const renderDeleteManagedObjectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <p>Deleting App: <b>{props.appEntityId.displayName}</b>.</p>
        <p>Are you sure you want to delete it?</p>
        <p><b>This action is irreversible!</b></p>
      </React.Fragment>  
    );
  }

  const renderDeleteManagedObjectDialogFooter = (): JSX.Element =>{
    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onDeleteManagedObjectCancel} />
          <Button label="Delete" icon="pi pi-trash" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject} style={{ color: "red", borderColor: 'red'}} />
      </React.Fragment>
    );
  } 

  const renderManagedObjectDeleteDialog = (): JSX.Element => {
    return (
      <Dialog
        className="p-fluid"
        visible={showManagedObjectDeleteDialog} 
        style={{ width: '450px' }} 
        header={renderDeleteManagedObjectConfirmDialogHeader}
        modal
        closable={false}
        footer={renderDeleteManagedObjectDialogFooter()}
        onHide={()=> {}}
        contentClassName="apd-manage-user-apps-delete-confirmation-content"
      >
        <div>
          <p><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></p>
          {renderDeleteManagedObjectDialogContent()}
          <ApiCallStatusError apiCallStatus={apiCallStatus} />
        </div>
      </Dialog>
    );
  } 
  
  return (
    <div className="ap-manage-apps">
  
      {renderManagedObjectDeleteDialog()}

    </div>
  );
}
