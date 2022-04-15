
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { AppPatch, AppsService, AppStatus } from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { 
  APManagedWebhook, 
  TAPManagedAppWebhooks, 
  TAPManagedWebhook, 
  TAPManagedWebhookList, 
  TAPOrganizationId 
} from "../../../../components/deleteme.APComponentsCommon";
import { 
  APSUserId 
} from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  E_CALL_STATE_ACTIONS, 
} from "./deleteme.DeveloperPortalManageUserAppWebhooksCommon";

import '../../../../components/APComponents.css';
import "../deleteme.DeveloperPortalManageUserApps.css";
import { Globals } from "../../../../utils/Globals";

export interface IDeveloperPortalDeleteUserAppWebhookProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  managedAppWebhooks: TAPManagedAppWebhooks;
  deleteManagedWebhook: TAPManagedWebhook;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalDeleteUserAppWebhook: React.FC<IDeveloperPortalDeleteUserAppWebhookProps> = (props: IDeveloperPortalDeleteUserAppWebhookProps) => {
  const componentName = 'DeveloperPortalDeleteUserAppWebhook';

  // type TUpdateApiObject = AppPatch;
  // type TManagedObject = TAPManagedWebhook;

  const DeleteManagedObjectConfirmDialogHeader = `Confirm Deleting Webhook`;

  const [showManagedObjectDeleteDialog, setShowManagedObjectDeleteDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiUpdateManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;

    // inputs
    // console.log(`${logName}: props.deleteManagedWebhook.apiWebHook = ${JSON.stringify(props.deleteManagedWebhook.apiWebHook, null, 2)}`);
    // console.log(`${logName}: props.deleteManagedWebhook.webhookApiEnvironmentResponseList = ${JSON.stringify(props.deleteManagedWebhook.webhookApiEnvironmentResponseList.map( (x) => { return x.name }), null, 2)}`);
    // create existing managed webhook list
    // console.log(`${logName}: props.viewManagedAppWebhookList.apiAppResponse.webHooks = ${JSON.stringify(props.viewManagedAppWebhookList.apiAppResponse.webHooks, null, 2)}`);
    // console.log(`${logName}: props.viewManagedAppWebhookList.apiAppEnvironmentResponseList = ${JSON.stringify(props.viewManagedAppWebhookList.apiAppEnvironmentResponseList.map((x) => { return x.name }) , null, 2)}`);
    // if(!props.existingManagedWebhookList.apiAppResponse.webHooks) throw new Error(`${logName}: props.viewManagedAppWebhookList.apiAppResponse.webHooks is undefined`);
    // if(props.viewManagedAppWebhookList.apiAppResponse.webHooks.length === 0) throw new Error(`${logName}: props.viewManagedAppWebhookList.apiAppResponse.webHooks is empty`);
    // const existigManagedWebhookList: TAPManagedWebhookList = APManagedWebhook.createAPManagedWebhookListFromApiWebhookList(props.viewManagedAppWebhookList.apiAppResponse.webHooks, props.viewManagedAppWebhookList.apiAppEnvironmentResponseList);

    const existigManagedWebhookList: TAPManagedWebhookList = props.managedAppWebhooks.apManagedWebhookList;
    // console.log(`${logName}: existigManagedWebhookList = ${JSON.stringify(existigManagedWebhookList, null, 2)}`);

    // create delete webhook list
    // const deleteManagedWebhookList: TAPManagedWebhookList = APManagedWebhook.createAPManagedWebhookListFromApiWebhook(props.deleteManagedWebhook.apiWebHook, props.deleteManagedWebhook.webhookApiEnvironmentResponseList);
    // console.log(`${logName}: deleteManagedWebhookList = ${JSON.stringify(deleteManagedWebhookList, null, 2)}`);

    const deleteManagedWebhookList: TAPManagedWebhookList = [props.deleteManagedWebhook];
    // console.log(`${logName}: deleteManagedWebhookList = ${JSON.stringify(deleteManagedWebhookList, null, 2)}`);


    // if(deleteManagedWebhookList.length !== 1) throw new Error(`${logName}: deleteManagedWebhookList.length !== 1`);
    
    // create new webhook list
    const webhookIndexToDelete: number = existigManagedWebhookList.findIndex( (mwh: TAPManagedWebhook) => {
      return (mwh.webhookEnvironmentReference.entityRef.name === deleteManagedWebhookList[0].webhookEnvironmentReference.entityRef.name);
    });
    if(webhookIndexToDelete === -1) throw new Error(`${logName}: webhookIndexToDelete === -1`);
    const newManagedWebhookList = existigManagedWebhookList;
    // NOTE: this modifies the props.managedAppWebhooks.apManagedWebhookList
    newManagedWebhookList.splice(webhookIndexToDelete,1);
    // console.log(`${logName}: newManagedWebhookList = ${JSON.stringify(newManagedWebhookList, null, 2)}`);
    const apiAppPatch: AppPatch = APManagedWebhook.createApiAppWebhookUpdateRequestBodyFromAPManagedAppWebhooks(props.managedAppWebhooks, newManagedWebhookList);
    // console.log(`${logName}: apiAppPatch = ${JSON.stringify(apiAppPatch, null, 2)}`);

    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP, `update webhooks for app: ${props.managedAppWebhooks.appDisplayName}`);
    try { 
      await AppsService.updateDeveloperApp({
        organizationName: props.organizationId, 
        developerUsername: props.userId, 
        appName: props.managedAppWebhooks.appId, 
        requestBody: apiAppPatch
      });
    } catch(e: any) {
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
      else props.onSuccess(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *
  const doDeleteManagedObject = async () => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject();
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
    const funcName = 'renderDeleteManagedObjectDialogContent';
    const logName = `${componentName}.${funcName}()`;
    const appStatus: AppStatus | undefined = props.managedAppWebhooks.apiAppResponse.status;
    if(!appStatus) throw new Error(`${logName}: appStatus is undefined`);
    let question: string = '';
    switch(appStatus) {
      case AppStatus.APPROVED:
        question = 'Are you sure you want to de-provision it?';
        break;
      case AppStatus.PENDING:
        question = 'Are you sure you want to delete it?';
        break;
      case AppStatus.REVOKED:
        question = 'Are you sure you want to delete it?';
        break;
      default:
        Globals.assertNever(logName, appStatus);
    }
    return (
      <React.Fragment>
        <p>App: <b>{props.managedAppWebhooks.appDisplayName}</b>.</p>
        <p>App Status: <b>{appStatus}</b>.</p>
        <p>Environment: <b>{props.deleteManagedWebhook.webhookEnvironmentReference.entityRef.displayName}</b>.</p>
        <p className="p-mt-2">{question}</p>
      </React.Fragment>  
    );
  }

  const renderDeleteManagedObjectDialogFooter = (): JSX.Element => {

    const getYesButton = (): JSX.Element => {
      const funcName = 'getYesButton';
      const logName = `${componentName}.${funcName}()`;
      const appStatus: AppStatus | undefined = props.managedAppWebhooks.apiAppResponse.status;
      if(!appStatus) throw new Error(`${logName}: appStatus is undefined`);
      switch(appStatus) {
        case AppStatus.PENDING:
          return (
            <Button label="Delete" icon="pi pi-trash" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject}/>
          );
        case AppStatus.APPROVED:
          return (
            <Button label="De-Provision" icon="pi pi-fast-forward" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject}/>
          );
        case AppStatus.REVOKED:
          return (
            <Button label="De-Provision" icon="pi pi-fast-forward" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject}/>
          );
        default:
          Globals.assertNever(logName, appStatus);
      }
      return (<></>);
    }

    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onDeleteManagedObjectCancel} />
          {getYesButton()}
          {/* <Button label="Delete" icon="pi pi-trash" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject}/> */}
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
    <div className="apd-manage-user-apps">
      {renderManagedObjectDeleteDialog()}
    </div>
  );
}
