
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { TAPDeveloperPortalTeamAppDisplay } from "../../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "./ManageAppWebhooksCommon";
import APAppWebhooksDisplayService from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface IDeleteAppWebhookProps {
  organizationId: string;
  apDeveloperPortalAppDisplay: TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;
  apAppWebhookDisplayEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onDeleteSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean, isLoadingHeader?: JSX.Element) => void;
}

export const DeleteAppWebhook: React.FC<IDeleteAppWebhookProps> = (props: IDeleteAppWebhookProps) => {
  const ComponentName = 'DeleteAppWebhook';

  const LoadingHeader: JSX.Element = (<div>De-Provisioning Webhook on Environment(s)</div>);
  const DeleteManagedObjectConfirmDialogHeader = "Confirm Deleting Webhook";

  const [showManagedObjectDeleteDialog, setShowManagedObjectDeleteDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiDeleteManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_DELETE_APP_WEBHOOK, `delete webhook: ${props.apAppWebhookDisplayEntityId.displayName}`);
    try { 
      await APAppWebhooksDisplayService.apiDelete_ApAppWebhookDisplay({
        organizationId: props.organizationId,
        appId: props.apDeveloperPortalAppDisplay.apEntityId.id,
        apAppMeta: props.apDeveloperPortalAppDisplay.apAppMeta,
        webhookId: props.apAppWebhookDisplayEntityId.id
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
    props.onLoadingChange(true, LoadingHeader);
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
        <p>Deleting Webhook: <b>{props.apAppWebhookDisplayEntityId.displayName}</b>.</p>
        <p>Are you sure you want to delete it?</p>
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
    <div className="apd-manage-user-apps">
  
      {renderManagedObjectDeleteDialog()}
  
    </div>
  );
}
