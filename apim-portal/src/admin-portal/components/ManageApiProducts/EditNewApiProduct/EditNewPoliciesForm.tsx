
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import APAdminPortalApiProductsDisplayService, { 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { APIProduct } from "@solace-iot-team/apim-connector-openapi-browser";
import { EAction} from "../ManageApiProductsCommon";
import { TAPApiProductDisplay_Policies, TAPClientOptionsGuaranteedMessagingDisplay } from "../../../../displayServices/APApiProductsDisplayService";
import { EditNewGuaranteedMessagingFormFields } from "./EditNewGuaranteedMessagingFormFields";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewPoliciesFormProps {
  action: EAction;
  formId: string;
  apApiProductDisplay_Policies: TAPApiProductDisplay_Policies;
  onSubmit: (apApiProductDisplay_Policies: TAPApiProductDisplay_Policies) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export type TManagedObjectFormData = {
  approvalType: APIProduct.approvalType;
  guaranteedMessaging: TAPClientOptionsGuaranteedMessagingDisplay;
};
export type TManagedObjectFormDataEnvelope = {
  formData: TManagedObjectFormData;
}

export const EditNewPoliciesForm: React.FC<IEditNewPoliciesFormProps> = (props: IEditNewPoliciesFormProps) => {
  // const ComponentName = 'EditNewPoliciesForm';

  type TManagedObject = TAPApiProductDisplay_Policies;

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      approvalType: mo.apApprovalType,
      guaranteedMessaging: mo.apClientOptionsDisplay.apGuaranteedMessaging
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apApiProductDisplay_Policies;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apApprovalType = fd.approvalType;
    mo.apClientOptionsDisplay.apGuaranteedMessaging = fd.guaranteedMessaging;
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apApiProductDisplay_Policies);
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
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
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
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      

            {/* approvalType */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.approvalType"
                  rules={{
                    required: "Select approval type.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={APAdminPortalApiProductsDisplayService.get_SelectList_For_ApprovalType()} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                      )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.approvalType })}>Approval Type*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.approvalType)}
            </div>

            <EditNewGuaranteedMessagingFormFields
              managedObjectUseForm={managedObjectUseForm}
            />

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
