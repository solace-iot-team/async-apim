
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { TAPAppDisplay_Credentials } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface IEditExternalCredentialsFormProps {
  organizationId: string;
  apAppDisplay_Credentials: TAPAppDisplay_Credentials;
  formId: string;
  onSubmit: (apAppDisplay_Credentials: TAPAppDisplay_Credentials) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditExternalCredentialsForm: React.FC<IEditExternalCredentialsFormProps> = (props: IEditExternalCredentialsFormProps) => {
  // const ComponentName = 'EditExternalCredentialsForm';

  type TManagedObject = TAPAppDisplay_Credentials;
  type TManagedObjectFormData = {
    consumerKey: string;
    consumerSecret: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      consumerKey: mo.apAppCredentials.secret.consumerKey,
      consumerSecret: mo.apAppCredentials.secret.consumerSecret ? mo.apAppCredentials.secret.consumerSecret : '',
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apAppDisplay_Credentials;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apAppCredentials.secret.consumerKey = fd.consumerKey;
    mo.apAppCredentials.secret.consumerSecret = fd.consumerSecret;
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apAppDisplay_Credentials);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
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

  // React.useEffect(() => {
  //   if (apiCallStatus !== null) {
  //     if(!apiCallStatus.success) props.onError(apiCallStatus);
  //   }
  // }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
            {/* consumerKey */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.consumerKey"
                  rules={APConnectorFormValidationRules.ConsumerKey()}
                  render={( { field, fieldState }) => {
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus={true}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.consumerKey })}>Consumer Key*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.consumerKey)}
            </div>
            {/* consumerSecret */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.consumerSecret"
                  rules={APConnectorFormValidationRules.ConsumerSecret()}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={false}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.consumerSecret })}>Consumer Secret*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.consumerSecret)}
            </div>
          </form>  
        </div>
      </div>
    );
  }

  
  return (
    <div className="ap-manage-apps">

      { renderManagedObjectForm() }

    </div>
  );
}
