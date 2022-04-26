
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { TAPDeveloperPortalTeamAppDisplay } from "../../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import APAppsDisplayService, { TAPAppDisplay_General } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { EditNewGeneralForm } from "./EditNewGeneralForm";
import { EAction, E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageAppsCommon";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface IEditGeneralProps {
  organizationId: string;
  apDeveloperPortalAppDisplay: TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;
  onSaveSuccess: (apiCallState: TApiCallState, apAppDisplay_General: TAPAppDisplay_General) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditGeneral: React.FC<IEditGeneralProps> = (props: IEditGeneralProps) => {
  const ComponentName = 'EditGeneral';

  type TManagedObject = TAPAppDisplay_General;

  const FormId = `DeveloperPortalManageUserApps_EditNewUserApp_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [updatedManagedObject, setUpdatedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_APP, `update app: ${mo.apEntityId.displayName}`);
    try {
      await APAppsDisplayService.apiUpdate_ApAppDisplay_General({
        organizationId: props.organizationId,
        apAppDisplay_General: mo
      });
      setUpdatedManagedObject(mo);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(APAppsDisplayService.get_ApAppDisplay_General({ 
      apAppDisplay: props.apDeveloperPortalAppDisplay 
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(updatedManagedObject === undefined) throw new Error(`${logName}: updatedManagedObject === undefined`);
        props.onSaveSuccess(apiCallStatus, updatedManagedObject);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
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
          <Button key={ComponentName+'Save'} form={FormId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
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
          <EditNewGeneralForm
            formId={FormId}
            organizationId={props.organizationId}
            action={EAction.EDIT}
            apAppDisplay_General={mo}
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
    <div className="apd-manage-user-apps">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
