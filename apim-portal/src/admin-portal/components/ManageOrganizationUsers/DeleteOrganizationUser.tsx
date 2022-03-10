
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageOrganizationUsersCommon";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from "../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";

import '../../../components/APComponents.css';
import "./ManageOrganizationUsers.css";

export interface IDeleteOrganizationUserProps {
  organizationEntityId: TAPEntityId;
  userEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeleteOrganizationUser: React.FC<IDeleteOrganizationUserProps> = (props: IDeleteOrganizationUserProps) => {
  const componentName = 'DeleteOrganizationUser';

  type TManagedObject = TAPOrganizationUserDisplay;

  const DeleteManagedObjectConfirmDialogHeader = "Confirm Deleting User";
  const DeleteManagedObjectNotPossibleDialogHeader = "User Cannot be Deleted";

  const [showManagedObjectDeleteDialog, setShowManagedObjectDeleteDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${props.userEntityId.displayName}`);
    try { 
      const apUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.apsGet_ApOrganizationUserDisplay({
        organizationEntityId: props.organizationEntityId,
        userId: props.userEntityId.id,
        fetch_ApOrganizationAssetInfoDisplayList: true
      });
      setManagedObject(apUserDisplay);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiDeleteManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_DELETE_USER_FROM_ORG, `remove user ${props.userEntityId.displayName} from org ${props.organizationEntityId.displayName}`);
    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);
    try { 
      await APOrganizationUsersDisplayService.apsDelete_ApOrganizationUserDisplay({
        apOrganizationUserDisplay: managedObject,
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_DELETE_USER_FROM_ORG) props.onSuccess(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *
  const doDeleteManagedObject = async () => {
    // const funcName = 'doDeleteManagedObject';
    // const logName = `${componentName}.${funcName}()`;
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

  const renderDeleteNotPossibleDialog = (numAssets: number): JSX.Element => {
    const renderFooter = (): JSX.Element => {
      return (
        <React.Fragment>
          <Button label="Ok" className="p-button-text p-button-plain" onClick={onDeleteManagedObjectCancel} />
        </React.Fragment>
      );
    } 
    return (
      <Dialog
        className="p-fluid"
        visible={showManagedObjectDeleteDialog} 
        style={{ width: '450px' }} 
        header={DeleteManagedObjectNotPossibleDialogHeader}
        modal
        closable={false}
        footer={renderFooter()}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
          <p><i className="pi pi-exclamation-circle p-mr-3" style={{ fontSize: '2rem'}} />
            User has {numAssets} asset(s).
          </p>
          <p>Delete all the assets first.</p>
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  }

  const renderDeleteManagedObjectDialogContent = (): JSX.Element => {
    // const funcName = 'renderDeleteManagedObjectDialogContent';
    // const logName = `${componentName}.${funcName}()`;
    return (
      <React.Fragment>
        <p>Delete user <b>{props.userEntityId.displayName}</b> from organization <b>{props.organizationEntityId.displayName}</b>.</p>
        <p>Are you sure you want to delete them?</p>
      </React.Fragment>  
    );
  }

  const renderDeleteManagedObjectDialogFooter = (): JSX.Element => {
    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onDeleteManagedObjectCancel} />
          <Button label="Delete" icon="pi pi-trash" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject}/>
      </React.Fragment>
    );
  } 

  const renderManagedObjectDeleteDialog = (mo: TManagedObject): JSX.Element => {
    const funcName = 'renderManagedObjectDeleteDialog';
    const logName = `${componentName}.${funcName}()`;
    if(mo.organizationAssetInfoDisplayList === undefined) throw new Error(`${logName}: mo.organizationAssetInfoDisplayList === undefined`);

    if(mo.organizationAssetInfoDisplayList.length > 0) renderDeleteNotPossibleDialog(mo.organizationAssetInfoDisplayList.length);

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
    <React.Fragment>
      <div className="manage-users">
        {managedObject && 
          renderManagedObjectDeleteDialog(managedObject)
        }
      </div>

      {/* DEBUG */}
      {/* <pre style={ { fontSize: '12px' }} >
        managedObject={JSON.stringify(managedObject, null, 2)}
      </pre> */}
    </React.Fragment>
  );
}
