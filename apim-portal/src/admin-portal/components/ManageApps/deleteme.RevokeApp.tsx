
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { AppListItem, AppsService, AppStatus } from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { Globals } from "../../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPOrganizationId } from "../../../components/deleteme.APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./deleteme.ManageAppsCommon";

import '../../../components/APComponents.css';
import "./deleteme.ManageApps.css";

export interface IRevokeAppProps {
  organizationId: TAPOrganizationId,
  appId: string;
  appDisplayName: string;
  appType: AppListItem.appType;
  appOwnerId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const RevokeApp: React.FC<IRevokeAppProps> = (props: IRevokeAppProps) => {
  const componentName = 'RevokeApp';

  const ManagedObjectConfirmDialogHeader = "Confirm Revoking Approval for APP";

  const [showManagedObjectDialog, setShowManagedObjectDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiRevokeManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiRevokeManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_REVOKE_APP, `revoke approval for app: ${props.appDisplayName}`);
    try { 
      switch(props.appType) {
        case AppListItem.appType.DEVELOPER:
          await AppsService.updateDeveloperApp({
            organizationName: props.organizationId, 
            developerUsername: props.appOwnerId, 
            appName: props.appId,
            requestBody: {
              status: AppStatus.PENDING
            }    
          });
        break;
        case AppListItem.appType.TEAM: 
          await AppsService.updateTeamApp({
            organizationName: props.organizationId, 
            teamName: props.appOwnerId, 
            appName: props.appId,
            requestBody: {
              status: AppStatus.PENDING
            }
          });
        break;
        default:
          Globals.assertNever(logName, props.appType);
      }
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
  const doRevokeManagedObject = async () => {
    props.onLoadingChange(true);
    await apiRevokeManagedObject();
    props.onLoadingChange(false);
  }

  const onRevokeManagedObject = () => {
    doRevokeManagedObject();
  }

  const onRevokeManagedObjectCancel = () => {
    setShowManagedObjectDialog(false);
    props.onCancel();
  }

  const renderManagedObjectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <p>Revoke approval for APP: <b>{props.appDisplayName}</b>.</p>
        <p>Are you sure you want to revoke approval for it?</p>
      </React.Fragment>  
    );
  }

  const renderManagedObjectDialogFooter = (): JSX.Element =>{
    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onRevokeManagedObjectCancel} />
          <Button label="Revoke" icon="pi pi-check" className="p-button-text p-button-plain p-button-outlined" onClick={onRevokeManagedObject}/>
      </React.Fragment>
    );
  } 

  const renderManagedObjectDialog = (): JSX.Element => {
    return (
      <Dialog
        className="p-fluid"
        visible={showManagedObjectDialog} 
        style={{ width: '450px' }} 
        header={ManagedObjectConfirmDialogHeader}
        modal
        closable={false}
        footer={renderManagedObjectDialogFooter}
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
    <div className="ap-manage-apps">

      {renderManagedObjectDialog()}

    </div>
  );
}
