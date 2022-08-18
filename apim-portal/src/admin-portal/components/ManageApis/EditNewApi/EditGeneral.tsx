
import React from "react";

import { Button } from 'primereact/button'; 
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { EditNewGeneralForm } from "./EditNewGeneralForm";
import APApisDisplayService, { IAPApiDisplay, TAPApiDisplay_General } from "../../../../displayServices/APApisDisplayService";
import { ButtonLabel_Cancel, ButtonLabel_Save, EAction, E_CALL_STATE_ACTIONS } from "../ManageApisCommon";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface IEditGeneralProps {
  organizationId: string;
  apApiDisplay: IAPApiDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean, loadingHeader?: string) => void;
}

export const EditGeneral: React.FC<IEditGeneralProps> = (props: IEditGeneralProps) => {
  const ComponentName = 'EditGeneral';

  type TManagedObject = TAPApiDisplay_General;

  const FormId = `ManageApis_EditNewApi_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_API, `update api: ${mo.apEntityId.id}`);
    try {
      await APApisDisplayService.apiUpdate_ApApiDisplay_General({
        organizationId: props.organizationId,
        apApiDisplay: props.apApiDisplay,
        apApiDisplay_General: mo
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(APApisDisplayService.get_ApApiDisplay_General({ apApiDisplay: props.apApiDisplay }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    // alert(`${ComponentName}.React.useEffect([]): ${JSON.stringify(props.apAdminPortalApiProductDisplay.apVersionInfo, null, 2)}`)
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        props.onSaveSuccess(apiCallStatus);
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

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button type="button" label={ButtonLabel_Cancel} className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button key={ComponentName+ButtonLabel_Save} form={FormId} type="submit" label={ButtonLabel_Save} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <EditNewGeneralForm
            formId={FormId}
            organizationId={props.organizationId}
            action={EAction.EDIT}
            apApiDisplay_General={mo}
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
    <div className="manage-apis">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
