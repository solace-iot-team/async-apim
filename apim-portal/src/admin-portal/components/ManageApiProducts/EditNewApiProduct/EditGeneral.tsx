
import React from "react";
// import { useForm, Controller } from 'react-hook-form';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay, TAPAdminPortalApiProductDisplay_General } from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageApiProductsCommon";
import { EditNewGeneralForm } from "./EditNewGeneralForm";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditGeneralProps {
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState, updatedDisplayName: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditGeneral: React.FC<IEditGeneralProps> = (props: IEditGeneralProps) => {
  const ComponentName = 'EditGeneral';

  type TManagedObject = TAPAdminPortalApiProductDisplay_General;
  // type TManagedObjectFormData = {
  //   id: string;
  //   displayName: string;
  //   description: string;
  // };
  // type TManagedObjectFormDataEnvelope = {
  //   formData: TManagedObjectFormData;
  // }

  // const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
  //   const fd: TManagedObjectFormData = {
  //     id: mo.apEntityId.id,
  //     displayName: mo.apEntityId.displayName,
  //     description: mo.description,
  //   };
  //   return {
  //     formData: fd
  //   };
  // }

  // const create_ManagedObject_From_FormEntities = ({orginalManagedObject, formDataEnvelope}: {
  //   orginalManagedObject: TManagedObject;
  //   formDataEnvelope: TManagedObjectFormDataEnvelope;
  // }): TManagedObject => {
  //   const mo: TManagedObject = orginalManagedObject;
  //   const fd: TManagedObjectFormData = formDataEnvelope.formData;
  //   // mo.apEntityId.id = fd.id;
  //   mo.apEntityId.displayName = fd.displayName;
  //   mo.description = fd.description;
  //   return mo;
  // }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [updatedManagedObject, setUpdatedManagedObject] = React.useState<TManagedObject>();
  // const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = `ManageApiProducts_EditNewApiProduct_${ComponentName}`;


  // * Api Calls *

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_API_PRODUCT, `update api product: ${mo.apEntityId.displayName}`);
    try {
      await APAdminPortalApiProductsDisplayService.apiUpdate_ApAdminPortalApiProductDisplay_General({
        organizationId: props.organizationId,
        apAdminPortalApiProductDisplay_General: mo,
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
    setManagedObject(APAdminPortalApiProductsDisplayService.get_ApAdminPortalApiProductDisplay_General({
      apAdminPortalApiProductDisplay: props.apAdminPortalApiProductDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(managedObject) {
  //     setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  //   }
  // }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  // }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus';
    const logName = `${ComponentName}.${funcName}()`;

    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(updatedManagedObject === undefined) throw new Error(`${logName}: updatedManagedObject === undefined`);
        props.onSaveSuccess(apiCallStatus, updatedManagedObject.apEntityId.displayName);
      }
    }
  }, [apiCallStatus, updatedManagedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmit = (apAdminPortalApiProductDisplay_General: TAPAdminPortalApiProductDisplay_General) => {
    doSubmitManagedObject(apAdminPortalApiProductDisplay_General);
  }
  // const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
  //   const funcName = 'onSubmitManagedObjectForm';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
  //   doSubmitManagedObject(create_ManagedObject_From_FormEntities({
  //     orginalManagedObject: managedObject,
  //     formDataEnvelope: newMofde,
  //   }));
  // }

  // const onInvalidSubmitManagedObjectForm = () => {
  //   // placeholder
  // }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button key={ComponentName+'Save'} form={formId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
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
            action={EAction.EDIT}
            apAdminPortalApiProductDisplay_General={mo}
            formId={formId}
            // onCancel={props.onCancel}
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
    <div className="manage-api-products">

      {managedObject && 
        renderManagedObjectForm(managedObject)
      }
    </div>
  );
}
