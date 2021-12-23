
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { ApiError, APIImport, ApisService } from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageApisCommon";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IEventPortalImportApiDialogProps {
  organizationId: TAPOrganizationId,
  connectorApiId: TManagedObjectId,
  eventPortalApiId: TManagedObjectId;
  eventPortalApiDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EventPortalImportApiDialog: React.FC<IEventPortalImportApiDialogProps> = (props: IEventPortalImportApiDialogProps) => {
  const componentName = 'EventPortalImportApiDialog';

  const ImportManagedObjectConfirmDialogHeader = "Import Event API Product";
  const ManagedObjectDisplayName = "Event API Product";

  const [showManagedObjectImportDialog, setShowManagedObjectImportDialog] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [existsApi, setExistsApi] = React.useState<boolean>();

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve ${ManagedObjectDisplayName}: ${props.eventPortalApiDisplayName}`);
    let anyError: any = undefined;
    try { 
      await ApisService.getApi({
        organizationName: props.organizationId, 
        apiName: props.connectorApiId
      });
      // throw new Error(`${logName}: testing error`);
      setExistsApi(true);
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) setExistsApi(false);
        else anyError = e;
      } else anyError = e;
    }
    if(anyError) {
      APClientConnectorOpenApi.logError(logName, anyError);
      callState = ApiCallState.addErrorToApiCallState(anyError, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiImportManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiImportManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(existsApi === undefined) throw new Error(`${logName}: existsApi is undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_IMPORT_API, `import ${ManagedObjectDisplayName}: ${props.eventPortalApiDisplayName}`);
    try {
      const apiImportRequest: APIImport = {
        source: APIImport.source.EVENT_APIPRODUCT,
        overwrite: existsApi,
        id: props.eventPortalApiId
      }
      await ApisService.importApi({
        organizationName: props.organizationId, 
        requestBody: apiImportRequest
      });
      // throw new Error(`${logName}: testing error`);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async() => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
    setShowManagedObjectImportDialog(true);
  }

  const doImportManagedObject = async () => {
    props.onLoadingChange(true);
    await apiImportManagedObject();
    props.onLoadingChange(false);
    setShowManagedObjectImportDialog(false);
  }

  // * useEffect Hooks *

  React.useEffect( () => {
    doInitialize()
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if (apiCallStatus.success && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_IMPORT_API) {
        props.onSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *

  const onImportManagedObject = () => {
    doImportManagedObject();
  }

  const onImportaManagedObjectCancel = () => {
    setShowManagedObjectImportDialog(false);
    props.onCancel();
  }

  const renderImportManagedObjectDialogContent = (): JSX.Element => {
    const funcName = 'renderImportManagedObjectDialogContent';
    const logName = `${componentName}.${funcName}()`;
    if(existsApi === undefined) throw new Error(`${logName}: existsApi is undefined`);
    return (
      <React.Fragment>
        {/* <p>id:<b>{props.eventPortalApiId}</b></p> */}
        <p><b>{props.eventPortalApiDisplayName}</b></p>
        {existsApi &&
          <>
            <br/>
            <span><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></span>
            <p>{ManagedObjectDisplayName} already exists.</p>
            <p>Do you want to import again?</p>
          </>
        }
      </React.Fragment>  
    );
  }

  const renderImportManagedObjectDialogFooter = (): JSX.Element =>{
    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onImportaManagedObjectCancel} />
          <Button label="Import" icon="pi pi-cloud-download" className="p-button-text p-button-plain p-button-outlined" onClick={onImportManagedObject}/>
      </React.Fragment>
    );
  } 

  const renderManagedObjectImportDialog = (): JSX.Element => {

    return (
      <Dialog
        className="p-fluid"
        visible={showManagedObjectImportDialog} 
        style={{ width: '450px' }} 
        header={ImportManagedObjectConfirmDialogHeader}
        modal
        closable={false}
        footer={renderImportManagedObjectDialogFooter()}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
            {renderImportManagedObjectDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-apis">
      { showManagedObjectImportDialog && (existsApi !== undefined) &&
        renderManagedObjectImportDialog() 
      }
    </div>
  );
}
