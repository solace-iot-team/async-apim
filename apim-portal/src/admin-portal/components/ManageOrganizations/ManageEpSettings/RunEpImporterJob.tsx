
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from "primereact/divider";

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import APEpSettingsDisplayService, { IAPEpSettingsDisplay } from "../../../../displayServices/APEpSettingsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageEpSettingsCommon";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { SuccessResponse } from "@solace-iot-team/apim-connector-openapi-browser";
import { DisplayRunningJobUntilFinished } from "../../../../components/APJobs/DisplayRunningJobUntilFinished";
import { TAPJobDisplayList } from "../../../../displayServices/APJobsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IRunEpImporterJobProps {
  organizationId: string;
  apEpSettingDisplayEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const RunEpImporterJob: React.FC<IRunEpImporterJobProps> = (props: IRunEpImporterJobProps) => {
  const ComponentName = 'RunEpImporterJob';

  const RunDialogHeader = "Running Import ...";

  type TManagedObject = IAPEpSettingsDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showRunDialog, setShowRunDialog] = React.useState<boolean>(true);
  const [runImportJobResult, setRunImportJobResult] = React.useState<SuccessResponse>();
  const [isImportJobFinished, setIsImportJobFinished] = React.useState<boolean>(false);
  
  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET, 'get ep setting');
    try {
      const apEpSettingsDisplay: IAPEpSettingsDisplay = await APEpSettingsDisplayService.apiGet_ApEpSettingsDisplay({
        organizationId: props.organizationId,
        id: props.apEpSettingDisplayEntityId.id
      });
      setManagedObject(apEpSettingsDisplay);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiRunImportJob = async() => {  
    const funcName = 'apiRunImportJob';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    setApiCallStatus(null);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_RUN_IMPORT_JOB, `run import job: ${managedObject.apEntityId.displayName}`);
    try {
      const result: SuccessResponse = await APEpSettingsDisplayService.apiRun_ImportJob({
        organizationId: props.organizationId,
        id: managedObject.apEntityId.id
      });
      setRunImportJobResult(result);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doRunImportJob = async() => {
    // props.onLoadingChange(true);
    await apiRunImportJob();
    // props.onLoadingChange(false);
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
    if(apiCallStatus === null) return;
    // handle in component
    if(!apiCallStatus.success) {
      if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_GET) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    doRunImportJob();
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *
  const onRunDialogClose = () => {
    const funcName = 'onRunDialogClose';
    const logName = `${ComponentName}.${funcName}()`;
    setShowRunDialog(false);
    if(!apiCallStatus) throw new Error(`${logName}: apiCallStatus is null`);
    props.onSuccess(apiCallStatus);
  }

  const onCheckJobError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setIsImportJobFinished(true);
  }

  const onJobFinished = (apJobDisplayList: TAPJobDisplayList) => {
    setIsImportJobFinished(true);
  }

  const renderRunDialogContent = (): JSX.Element => {
    const funcName = 'renderRunDialogContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(runImportJobResult === undefined) throw new Error(`${logName}: runImportJobResult === undefined`);
    if(runImportJobResult.id === undefined) throw new Error(`${logName}: runImportJobResult.id === undefined`);
    return (
      <React.Fragment>
        <pre>
          {JSON.stringify(runImportJobResult, null, 2)}
        </pre>
        <Divider/>
        <p>Job Status:</p>
        <DisplayRunningJobUntilFinished
          organizationId={props.organizationId}
          jobId={runImportJobResult.id}
          interval_millis={2000}
          onError={onCheckJobError}
          onFinished={onJobFinished}
        />
      </React.Fragment>
    )
  }

  const renderRunDialogFooter = (): JSX.Element => {
    return (
      <React.Fragment>
        <Button label="Close" icon="pi pi-times" className="p-button-text p-button-plain p-button-outlined" onClick={onRunDialogClose} disabled={!isImportJobFinished}/>
      </React.Fragment>
    );
  } 

  const renderRunDialog = (): JSX.Element => {
    return (
      <Dialog
        className="p-fluid"
        visible={showRunDialog} 
        style={{ width: '60%' }} 
        header={RunDialogHeader}
        modal
        closable={false}
        footer={renderRunDialogFooter()}
        onHide={()=> {}}
      >
        <div className="test-log">
          {runImportJobResult && renderRunDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-organizations">
      { managedObject && renderRunDialog() }
    </div>
  );
}
