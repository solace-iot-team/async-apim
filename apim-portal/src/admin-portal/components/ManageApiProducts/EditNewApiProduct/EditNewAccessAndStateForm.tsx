
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APIProductAccessLevel } from "@solace-iot-team/apim-connector-openapi-browser";
import { EAction} from "../ManageApiProductsCommon";
import { TAPApiProductDisplay_AccessAndState } from "../../../../displayServices/APApiProductsDisplayService";
import APLifecycleDisplayService, { EAPLifecycleState } from "../../../../displayServices/APLifecycleDisplayService";
import APAccessLevelDisplayService from "../../../../displayServices/APAccessLevelDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewAccessAndStateFormProps {
  action: EAction;
  formId: string;
  apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState;
  onSubmit: (apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewAccessAndStateForm: React.FC<IEditNewAccessAndStateFormProps> = (props: IEditNewAccessAndStateFormProps) => {
  // const ComponentName = 'EditNewAccessAndStateForm';

  type TManagedObject = TAPApiProductDisplay_AccessAndState;
  type TManagedObjectFormData = {
    accessLevel: APIProductAccessLevel;
    lifecycleState: EAPLifecycleState;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      accessLevel: mo.apAccessLevel,
      lifecycleState: mo.apLifecycleInfo.apLifecycleState
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apApiProductDisplay_AccessAndState;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apAccessLevel = fd.accessLevel;
    mo.apLifecycleInfo.apLifecycleState = fd.lifecycleState;
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apApiProductDisplay_AccessAndState);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  const doInitialize = async () => {
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectForm = () => {
    return (
      <div className="card p-mt-4">
        <p>TBD: change biz group if role=organizationAdmin or owner is me, list biz groups where role=APITeam</p>
        <p>TBD: share with biz groups, list biz groups where role=APITeam, share as readonly=yes/no</p>
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* State */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.lifecycleState"
                  rules={{
                    required: "Enter new state.",
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <Dropdown
                        id={field.name}
                        {...field}
                        options={APLifecycleDisplayService.get_SelectList()} 
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />                        
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.lifecycleState })}>State*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.lifecycleState)}
            </div>
            {/* accessLevel */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.accessLevel"
                  rules={{
                    required: "Select access level.",
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <Dropdown
                        id={field.name}
                        {...field}
                        options={APAccessLevelDisplayService.get_SelectList()} 
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />                        
                    )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.accessLevel })}>Access Level*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.accessLevel)}
            </div>
          </form>  
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      { renderManagedObjectForm() }

    </div>
  );
}
