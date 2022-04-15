
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { AppListItem, AppsService } from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { Globals } from "../../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPOrganizationId } from "../../../components/deleteme.APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IDeleteAppProps {
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

export const DeleteApp: React.FC<IDeleteAppProps> = (props: IDeleteAppProps) => {
  const componentName = 'DeleteApp';

  const ManagedObjectConfirmDialogHeader = "Confirm Deleting APP";

  const [showManagedObjectDialog, setShowManagedObjectDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiDeleteManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_DELETE_APP, `deleting app: ${props.appDisplayName}`);
    try { 
      switch(props.appType) {
        case AppListItem.appType.DEVELOPER: 
          await AppsService.deleteDeveloperApp({
            organizationName: props.organizationId, 
            developerUsername: props.appOwnerId, 
            appName: props.appId
          });
        break;
        case AppListItem.appType.TEAM: 
          await AppsService.deleteTeamApp({
            organizationName: props.organizationId, 
            teamName: props.appOwnerId, 
            appName: props.appId
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
  const doDeleteManagedObject = async () => {
    props.onLoadingChange(true);
    await apiDeleteManagedObject();
    props.onLoadingChange(false);
  }

  const onDeleteManagedObject = () => {
    doDeleteManagedObject();
  }

  const onDeleteManagedObjectCancel = () => {
    setShowManagedObjectDialog(false);
    props.onCancel();
  }

  const renderManagedObjectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <p>Delete APP: <b>{props.appDisplayName}</b>.</p>
        <p>Are you sure you want to delete it?</p>
      </React.Fragment>  
    );
  }

  const renderManagedObjectDialogFooter = (): JSX.Element =>{
    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onDeleteManagedObjectCancel} />
          <Button label="Delete" icon="pi pi-trash" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject}/>
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
