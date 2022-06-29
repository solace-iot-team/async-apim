
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from 'primereact/utils';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { EAction } from "../ManageApiProductsCommon";
import { TAPApiProductDisplay_Documentation } from "../../../../displayServices/APApiProductsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewDocumentationFormProps {
  action: EAction;
  organizationId: string;
  apApiProductDisplay_Documentation: TAPApiProductDisplay_Documentation;
  formId: string;
  onSubmit: (apAdminPortalApiProductDisplay_Documentation: TAPApiProductDisplay_Documentation) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewDocumentationForm: React.FC<IEditNewDocumentationFormProps> = (props: IEditNewDocumentationFormProps) => {
  const ComponentName = 'EditNewDocumentationForm';

  type TManagedObject = TAPApiProductDisplay_Documentation;
  type TManagedObjectFormData = {
    referenceDoc?: string;
    supportDoc?: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      referenceDoc: mo.apApiProductDocumentationDisplay.apReferenceDocumentation,
      supportDoc: mo.apApiProductDocumentationDisplay.apSupportDocumentation,
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apApiProductDisplay_Documentation;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apApiProductDocumentationDisplay.apReferenceDocumentation = fd.referenceDoc;
    mo.apApiProductDocumentationDisplay.apSupportDocumentation = fd.supportDoc;
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apApiProductDisplay_Documentation);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  const doInitialize = async () => {
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    // alert(`${ComponentName}: mounting ...`);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) {
      managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
    }
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    }));
    setManagedObjectFormDataEnvelope(newMofde);
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectForm = () => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">     
            {/* reference doc */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.referenceDoc"
                  rules={{
                    required: 'Enter reference documentation.'
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <InputTextarea
                        id={field.name}
                        {...field}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.referenceDoc })}>Reference Documentation*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.referenceDoc)}
            </div>
            {/* support doc */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.supportDoc"
                  rules={{
                    required: "Enter support documentation.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <InputTextarea
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                      )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.supportDoc })}>Support Documentation*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.supportDoc)}
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
