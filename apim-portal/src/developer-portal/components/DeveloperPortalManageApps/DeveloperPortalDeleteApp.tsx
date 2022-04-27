
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { EAppType, E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageAppsCommon";
import APDeveloperPortalUserAppsDisplayService from "../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APDeveloperPortalTeamAppsDisplayService from "../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { Globals } from "../../../utils/Globals";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageApps.css";

export interface IDeveloperPortalDeleteAppProps {
  appType: EAppType;
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onDeleteSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalDeleteApp: React.FC<IDeveloperPortalDeleteAppProps> = (props: IDeveloperPortalDeleteAppProps) => {
  const componentName = 'DeveloperPortalDeleteApp';

  const DeleteManagedObjectConfirmDialogHeader = "Confirm Deleting App";

  const [userContext] = React.useContext(UserContext);

  const [showManagedObjectDeleteDialog, setShowManagedObjectDeleteDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiDeleteManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_DELETE_APP, `delete app: ${props.appEntityId.displayName}`);
    try {
      switch(props.appType) {
        case EAppType.USER:
          await APDeveloperPortalUserAppsDisplayService.apiDelete_ApDeveloperPortalUserAppDisplay({
            organizationId: props.organizationId,
            appId: props.appEntityId.id,
            userId: userContext.apLoginUserDisplay.apEntityId.id
          });
          break;
        case EAppType.TEAM:
          if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: props.appType === EAppType.TEAM && userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
          await APDeveloperPortalTeamAppsDisplayService.apiDelete_ApDeveloperPortalTeamAppDisplay({
            organizationId: props.organizationId,
            appId: props.appEntityId.id,
            teamId: userContext.runtimeSettings.currentBusinessGroupEntityId.id
          });
          break;
        default:
          Globals.assertNever(logName, props.appType);
      }
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
    <div className="apd-manage-user-apps">
      {renderManagedObjectDeleteDialog()}
    </div>
  );
}
