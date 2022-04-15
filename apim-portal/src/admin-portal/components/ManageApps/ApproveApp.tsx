
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { AppListItem, AppsService, AppStatus } from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { Globals } from "../../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPOrganizationId } from "../../../components/deleteme.APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IApproveAppProps {
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

export const ApproveApp: React.FC<IApproveAppProps> = (props: IApproveAppProps) => {
  const componentName = 'ApproveApp';

  const ApproveManagedObjectConfirmDialogHeader = "Confirm Approving APP";

  const [showManagedObjectApproveDialog, setShowManagedObjectApproveDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiApproveManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiApproveManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_APPROVE_APP, `approve app: ${props.appDisplayName}`);
    try { 
      switch(props.appType) {
        case AppListItem.appType.DEVELOPER: 
          await AppsService.updateDeveloperApp({
            organizationName: props.organizationId, 
            developerUsername: props.appOwnerId, 
            appName: props.appId,
            requestBody: {
              status: AppStatus.APPROVED
            }    
          });
        break;
        case AppListItem.appType.TEAM: 
          await AppsService.updateTeamApp({
            organizationName: props.organizationId, 
            teamName: props.appOwnerId, 
            appName: props.appId,
            requestBody: {
              status: AppStatus.APPROVED
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
  const doApproveManagedObject = async () => {
    props.onLoadingChange(true);
    await apiApproveManagedObject();
    props.onLoadingChange(false);
  }

  const onApproveManagedObject = () => {
    doApproveManagedObject();
  }

  const onApproveManagedObjectCancel = () => {
    setShowManagedObjectApproveDialog(false);
    props.onCancel();
  }

  const renderApproveManagedObjectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <p>Approving APP: <b>{props.appDisplayName}</b>.</p>
        <p>Are you sure you want to approve it?</p>
      </React.Fragment>  
    );
  }

  const renderApproveManagedObjectDialogFooter = (): JSX.Element =>{
    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onApproveManagedObjectCancel} />
          <Button label="Approve" icon="pi pi-check" className="p-button-text p-button-plain p-button-outlined" onClick={onApproveManagedObject}/>
      </React.Fragment>
    );
  } 

  const renderManagedObjectApproveDialog = (): JSX.Element => {
    return (
      <Dialog
        className="p-fluid"
        visible={showManagedObjectApproveDialog} 
        style={{ width: '450px' }} 
        header={ApproveManagedObjectConfirmDialogHeader}
        modal
        closable={false}
        footer={renderApproveManagedObjectDialogFooter}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
            <p><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></p>
            {renderApproveManagedObjectDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <div className="ap-manage-apps">

      {renderManagedObjectApproveDialog()}

    </div>
  );
}
