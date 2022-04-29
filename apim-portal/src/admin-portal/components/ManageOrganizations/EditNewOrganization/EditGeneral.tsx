
import React, { Props } from "react";
// import { useForm, Controller } from 'react-hook-form';

import { Button } from 'primereact/button'; 
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APSingleOrganizationDisplayService, { 
  IAPSingleOrganizationDisplay, 
  IAPSingleOrganizationDisplay_General 
} from "../../../../displayServices/APOrganizationsDisplayService/APSingleOrganizationDisplayService";
import APSystemOrganizationsDisplayService, { 
  IAPSystemOrganizationDisplay, 
  IAPSystemOrganizationDisplay_General 
} from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { 
  EAction,
  E_CALL_STATE_ACTIONS, 
  E_ManageOrganizations_Scope, 
  TManageOrganizationsScope 
} from "../ManageOrganizationsCommon";
import { Globals } from "../../../../utils/Globals";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";
import { EditNewGeneralForm } from "./EditNewGeneralForm";

export interface IEditGeneralProps {
  scope: TManageOrganizationsScope;
  apOrganizationDisplay: IAPSystemOrganizationDisplay | IAPSingleOrganizationDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditGeneral: React.FC<IEditGeneralProps> = (props: IEditGeneralProps) => {
  const ComponentName = 'EditGeneral';

  type TManagedObject = IAPSingleOrganizationDisplay_General | IAPSystemOrganizationDisplay_General;

  const FormId = `ManageOrganizations_EditNewOrganization_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);


  // * Api Calls *

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION, `update organization: ${mo.apEntityId.displayName}`);
    const type: E_ManageOrganizations_Scope = props.scope.type;
    try {
      switch(type) {
        case E_ManageOrganizations_Scope.SYSTEM_ORGS:
          await APSystemOrganizationsDisplayService.apiUpdate_ApOrganizationDisplay_General({ 
            apOrganizationDisplay_General: mo
          });
          break;
        case E_ManageOrganizations_Scope.ORG_SETTINGS:
          await APSingleOrganizationDisplayService.apiUpdate_ApOrganizationDisplay_General({ 
            apOrganizationDisplay_General: mo
          });
          break;
        case E_ManageOrganizations_Scope.ORG_STATUS:
          throw new Error(`${logName}: unsupported props.scope.type=${props.scope.type}`);  
        default:
          Globals.assertNever(logName, type);
      }
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${ComponentName}.${funcName}()`;
    const type: E_ManageOrganizations_Scope = props.scope.type;
    switch(type) {
      case E_ManageOrganizations_Scope.SYSTEM_ORGS:
        setManagedObject(APSystemOrganizationsDisplayService.get_ApOrganizationDisplay_General<IAPSystemOrganizationDisplay>({ 
          apOrganizationDisplay: props.apOrganizationDisplay 
        }));
        break;
      case E_ManageOrganizations_Scope.ORG_SETTINGS:
        setManagedObject(APSystemOrganizationsDisplayService.get_ApOrganizationDisplay_General<IAPSingleOrganizationDisplay>({ 
          apOrganizationDisplay: props.apOrganizationDisplay 
        }));
        break;
      case E_ManageOrganizations_Scope.ORG_STATUS:
        throw new Error(`${logName}: unsupported props.scope.type=${props.scope.type}`);  
      default:
        Globals.assertNever(logName, type);
    }
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // const funcName = 'useEffect[apiCallStatus';
    // const logName = `${ComponentName}.${funcName}()`;

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
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button key={ComponentName+'Save'} form={FormId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
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
            action={EAction.EDIT}
            apOrganizationDisplay_General={mo}
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
    <div className="manage-organizations">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
