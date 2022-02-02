
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { 
  CommonDisplayName, CommonName, 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageOrganizationsCommon";
import { APOrganizationsService } from "../../../utils/APOrganizationsService";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IDeleteOrganizationProps {
  organizationId: CommonName;
  organizationDisplayName: CommonDisplayName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeleteOrganization: React.FC<IDeleteOrganizationProps> = (props: IDeleteOrganizationProps) => {
  const componentName = 'DeleteOrganization';

  const DeleteManagedObjectConfirmDialogHeader = "Confirm Deleting Organization";

  const [showManagedObjectDeleteDialog, setShowManagedObjectDeleteDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  // const apiGetManagedObjectAssets = async(): Promise<TApiCallState> => {
  //   const funcName = 'apiGetManagedObjectAssets';
  //   const logName = `${componentName}.${funcName}()`;
  //   let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION_ASSETS, `get assets for organization: ${props.organizationDisplayName}`);
  //   try { 
  //     const apOrganizationAssets: TAPOrganizationAssets = await APOrganizationsService.getOrganizationAssets({
  //       organizationId: props.organizationId
  //     });
  //   } catch(e) {
  //     APClientConnectorOpenApi.logError(logName, e);
  //     callState = ApiCallState.addErrorToApiCallState(e, callState);
  //   }
  //   setApiCallStatus(callState);
  //   return callState;
  // }
  const apiDeleteManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_DELETE_ORGANIZATION, `delete organization: ${props.organizationDisplayName}`);
    try { 
      await APOrganizationsService.deleteOrganization({
        organizationId: props.organizationId
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

  const renderDeleteManagedObjectConfirmDialogHeader = () => {
    return (<span style={{ color: 'red' }}>{DeleteManagedObjectConfirmDialogHeader}</span>);
  }

  const renderDeleteManagedObjectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <p>Deleting organization <b>{props.organizationDisplayName}</b> will also delete all it's content!</p>
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
        header={renderDeleteManagedObjectConfirmDialogHeader()}
        modal
        closable={false}
        footer={renderDeleteManagedObjectDialogFooter()}
        onHide={()=> {}}
        contentClassName="manage-organizations-delete-confirmation-content"
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
    <div className="manage-organizations">
      {renderManagedObjectDeleteDialog()}
    </div>
  );
}
