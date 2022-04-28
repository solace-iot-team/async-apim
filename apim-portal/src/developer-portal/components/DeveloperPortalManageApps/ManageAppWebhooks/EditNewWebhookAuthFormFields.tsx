
import React from "react";
import { Controller, UseFormReturn } from 'react-hook-form';

import { classNames } from 'primereact/utils';
import { InputText } from "primereact/inputtext";

import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { TManagedObjectFormDataEnvelope } from "./EditNewAppWebhookForm";
import { WebHookBasicAuth, WebHookHeaderAuth } from "@solace-iot-team/apim-connector-openapi-browser";
import { TAPWebhookAuthMethodSelectId } from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";

export interface IEditNewWebhookAuthFormFieldsProps {
  managedObjectUseForm: UseFormReturn<TManagedObjectFormDataEnvelope>;
  webhookAuthMethodSelectId: TAPWebhookAuthMethodSelectId;
}

export const EditNewWebhookAuthFormFields: React.FC<IEditNewWebhookAuthFormFieldsProps> = (props: IEditNewWebhookAuthFormFieldsProps) => {
  // const ComponentName = 'EditNewWebhookAuthFormFields';

  const managedObjectUseForm = props.managedObjectUseForm;

  const renderManagedObjectFormWebhookBasicAuth = (webhookAuthMethodSelectId: TAPWebhookAuthMethodSelectId) => {
    const isActive: boolean = (webhookAuthMethodSelectId === WebHookBasicAuth.authMethod.BASIC);
    return (
      <div className="p-ml-4" hidden={!isActive}>
      {/* <div className="p-ml-4"> */}
        {/* username */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.webhookBasicAuth.username"
              rules={APConnectorFormValidationRules.WebhookBasicAuth_Username(isActive)}
              render={( { field, fieldState }) => {
                // console.log(`renderManagedObjectFormWebhookBasicAuth: field = ${JSON.stringify(field)}`);
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                    disabled={!isActive}               
                  />
              )}}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.webhookBasicAuth?.username})}>Username*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.webhookBasicAuth?.username)}
        </div>
        {/* password */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.webhookBasicAuth.password"
              rules={APConnectorFormValidationRules.WebhookBasicAuth_Password(isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}           
                    disabled={!isActive}               
                  />
                  // <Password
                  //   id={field.name}
                  //   toggleMask={true}
                  //   feedback={false}        
                  //   {...field}
                  //   className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  // />
              )}}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.webhookBasicAuth?.password })}>Password*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.webhookBasicAuth?.password)}
        </div>
      </div>
    );
  }

  const renderManagedObjectFormWebhookHeaderAuth = (webhookAuthMethodSelectId: TAPWebhookAuthMethodSelectId) => {
    const isActive: boolean = (webhookAuthMethodSelectId === WebHookHeaderAuth.authMethod.HEADER);
    return (
      <div className="p-ml-4" hidden={!isActive}>
      {/* <div className="p-ml-4"> */}
        {/* header name */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.webhookHeaderAuth.headerName"
              rules={APConnectorFormValidationRules.WebhookHeaderAuth_HeaderName(isActive)}
              render={( { field, fieldState }) => {
                // console.log(`${logName}: field = ${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                    disabled={!isActive}               
                  />
              )}}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.webhookHeaderAuth?.headerName})}>Header Name*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.webhookHeaderAuth?.headerName)}
        </div>
        {/* headerValue */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.webhookHeaderAuth.headerValue"
              rules={APConnectorFormValidationRules.WebhookHeaderAuth_HeaderValue(isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}        
                    disabled={!isActive}               
                  />
              )}}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.webhookHeaderAuth?.headerValue })}>Header Value*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.webhookHeaderAuth?.headerValue)}
        </div>
      </div>
    );
  }

  const renderContent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderManagedObjectFormWebhookBasicAuth(props.webhookAuthMethodSelectId)}
        {renderManagedObjectFormWebhookHeaderAuth(props.webhookAuthMethodSelectId)}
      </React.Fragment>
    );
  }

  return (
    <div className='card'>
      {renderContent()}
    </div> 
  );

}