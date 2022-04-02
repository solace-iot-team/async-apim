
import React from "react";
import { Controller, UseFormReturn } from 'react-hook-form';

import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { classNames } from 'primereact/utils';

import { TManagedObjectFormDataEnvelope } from "./EditNewPoliciesForm";
import APAdminPortalApiProductsDisplayService from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";

export interface IEditNewGuaranteedMessagingFormFieldsProps {
  managedObjectUseForm: UseFormReturn<TManagedObjectFormDataEnvelope>;
}

export const EditNewGuaranteedMessagingFormFields: React.FC<IEditNewGuaranteedMessagingFormFieldsProps> = (props: IEditNewGuaranteedMessagingFormFieldsProps) => {
  // const ComponentName = 'EditNewGuaranteedMessagingFormFields';

  const managedObjectUseForm = props.managedObjectUseForm;

  const renderContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <div className="p-text-bold">Guaranteed Messaging:</div>
        <div className="p-ml-3 p-mt-3">
        {/* requireQueue */}
        <div className="p-field p-field-checkbox">
          <Controller
            control={managedObjectUseForm.control}
            name="formData.guaranteedMessaging.requireQueue"
            render={( { field, fieldState }) => {
              return(
                <Checkbox
                  inputId={field.name}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.checked)}                                  
                  className={classNames({ 'p-invalid': fieldState.invalid })}                                       
                />
            )}}
          />
          <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.guaranteedMessaging?.requireQueue })}> Enabled</label>
        </div>
        {/* Access Type */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.guaranteedMessaging.accessType"
              rules={{
                required: "Select access type.",
              }}
              render={( { field, fieldState }) => {
                return(
                  <Dropdown
                    id={field.name}
                    {...field}
                    options={APAdminPortalApiProductsDisplayService.get_SelectList_For_QueueAccessType()} 
                    onChange={(e) => field.onChange(e.value)}
                    className={classNames({ 'p-invalid': fieldState.invalid })}     
                  />                        
                )}}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.guaranteedMessaging?.accessType})}>Access Type*</label>
            <small id="clientOptionsGuaranteedMessaging.accessType-help">
              Queue access type.
            </small>              
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.guaranteedMessaging?.accessType)}
        </div>
        {/* Max TTL */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.guaranteedMessaging.maxTtl"
              rules={APConnectorFormValidationRules.ClientOptionsGuaranteedMessaging_MaxTTL()}
              render={( { field, fieldState }) => {
                return(
                  <InputNumber
                    id={field.name}
                    {...field}
                    onChange={(e) => field.onChange(e.value)}
                    mode="decimal" 
                    useGrouping={false}
                    className={classNames({ 'p-invalid': fieldState.invalid })}      
                  />
              )}}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.guaranteedMessaging?.maxTtl })}>Max TTL (seconds) *</label>
            <small id="clientOptionsGuaranteedMessaging.maxTtl-help">Max Time-to-Live. Retention policy for message on the queue in seconds. Set to 0 if messages are to be kept indefinitely.</small>              
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.guaranteedMessaging?.maxTtl)}
        </div>
        {/* Max Spool Usage */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.guaranteedMessaging.maxMsgSpoolUsage"
              rules={APConnectorFormValidationRules.ClientOptionsGuaranteedMessaging_MaxSpoolUsage()}
              render={( { field, fieldState }) => {
                return(
                  <InputNumber
                    id={field.name}
                    {...field}
                    onChange={(e) => field.onChange(e.value)}
                    mode="decimal" 
                    useGrouping={false}
                    className={classNames({ 'p-invalid': fieldState.invalid })}      
                  />
              )}}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.guaranteedMessaging?.maxMsgSpoolUsage })}>Max Spool Usage (MB) *</label>
            <small id="clientOptionsGuaranteedMessaging.maxMsgSpoolUsage-help">
              Maximum message spool usage allowed by the Queue, in megabytes (MB). 
              A value of 0 only allows spooling of the last message received and disables quota checking.
            </small>              
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.guaranteedMessaging?.maxMsgSpoolUsage)}
        </div>
        </div>
      </React.Fragment>        
    );
  }

  return (
    <div className='card'>
      {renderContent()}
    </div> 
  );

}