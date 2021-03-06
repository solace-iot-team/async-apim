
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { TAPAppDisplay_Credentials } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APAdminPortalAppsDisplayService from "../../../displayServices/APAdminPortalAppsDisplayService";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageAppsCommon";
import { EditInternalCredentialsForm } from "./EditInternalCredentialsForm";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface IEditInternalCredentialsProps {
  organizationId: string;
  apAppDisplay_Credentials: TAPAppDisplay_Credentials;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditInternalCredentials: React.FC<IEditInternalCredentialsProps> = (props: IEditInternalCredentialsProps) => {
  const ComponentName = 'EditInternalCredentials';

  type TManagedObject = TAPAppDisplay_Credentials;

  const FormId = `ManageApps_ManageAccess_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_APP, `update app: ${mo.apEntityId.displayName}`);
    try {
      await APAdminPortalAppsDisplayService.apiUpdateInternal_ApAppDisplay_Credentials({
        organizationId: props.organizationId,
        apAppDisplay_Credentials: mo
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(props.apAppDisplay_Credentials);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // const funcName = 'useEffect[apiCallStatus]';
    // const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        // if(updatedManagedObject === undefined) throw new Error(`${logName}: updatedManagedObject === undefined`);
        props.onSaveSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
    // setRefreshCounter(refreshCounter + 1);
  }

  const onSubmit = (mo: TManagedObject) => {
    doSubmitManagedObject(mo);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+'Generate'} form={FormId} type="submit" label="Re-Generate Consumer Secret" icon="pi pi-refresh" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-6">
        <div className="p-fluid">
          <EditInternalCredentialsForm
            // key={ComponentName + '_EditNewCredentialsForm_' + refreshCounter}
            formId={FormId}
            organizationId={props.organizationId}
            action={EAction.EDIT}
            apAppDisplay_Credentials={mo}
            onError={props.onError}
            onLoadingChange={props.onLoadingChange}
            onSubmit={onSubmit}
          />
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }

  
  return (
    <div className="ap-manage-apps">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
