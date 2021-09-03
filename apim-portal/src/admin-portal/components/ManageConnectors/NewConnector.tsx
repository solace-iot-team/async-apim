
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { Dropdown } from "primereact/dropdown";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from "primereact/inputnumber";
import { Password } from "primereact/password";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';

import { 
  ApsConfigService, 
  APSConnector,
  APSConnectorCreate,
  EAPSClientProtocol
} from '@solace-iot-team/apim-server-openapi-browser';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APSOpenApiFormValidationRules } from "../../../utils/APSOpenApiFormValidationRules";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageConnectorsCommon, TManagedObjectId } from "./ManageConnectorsCommon";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";

export interface INewConnectorProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState, newConnectorId: TManagedObjectId, newConnectorDisplayName: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewConnector: React.FC<INewConnectorProps> = (props: INewConnectorProps) => {
  const componentName = 'NewConnector';

  type TApiCreateObject = APSConnectorCreate;
  type TManagedObject = APSConnectorCreate;
  type TManagedObjectFormData = APSConnectorCreate;
  type TManagedObjectFormDataProtocolSelectItems = Array<{ label: string, value: EAPSClientProtocol }>;

  const emptyManagedObjectFormData: TManagedObjectFormData = {
    connectorId: '',
    displayName: '',
    description: '',
    connectorClientConfig: {
      protocol: EAPSClientProtocol.HTTP,
      host: '',
      port: 3000,
      apiVersion: 'v1',
      serviceUser: '',
      serviceUserPwd: ''
    }
  }
  const managedObjectFormDataProtocolSelectItems:TManagedObjectFormDataProtocolSelectItems = [
    { label: 'http', value: EAPSClientProtocol.HTTP },
    { label: 'https', value: EAPSClientProtocol.HTTPS }
  ]

  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TApiCreateObject => {
    return managedObject;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    return formData;
  }

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const managedObjectUseForm = useForm<TManagedObjectFormData>();

  // * Api Calls *
  const apiCreateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_CONNECTOR, `create connector: ${managedObject.displayName}`);
    try { 
      const createdApiObject: APSConnector = await ApsConfigService.createApsConnector(transformManagedObjectToCreateApiObject(managedObject));
      setCreatedManagedObjectId(createdApiObject.connectorId);
      setCreatedManagedObjectDisplayName(createdApiObject.displayName);      
    } catch(e) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    doPopulateManagedObjectFormDataValues(emptyManagedObjectFormData);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }
      else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *
  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('connectorId', managedObjectFormData.connectorId);
    managedObjectUseForm.setValue('displayName', managedObjectFormData.displayName);
    managedObjectUseForm.setValue('description', managedObjectFormData.description);
    managedObjectUseForm.setValue('connectorClientConfig.protocol', managedObjectFormData.connectorClientConfig.protocol);
    managedObjectUseForm.setValue('connectorClientConfig.host', managedObjectFormData.connectorClientConfig.host);
    managedObjectUseForm.setValue('connectorClientConfig.port', managedObjectFormData.connectorClientConfig.port);
    managedObjectUseForm.setValue('connectorClientConfig.apiVersion', managedObjectFormData.connectorClientConfig.apiVersion);
    managedObjectUseForm.setValue('connectorClientConfig.serviceUser', managedObjectFormData.connectorClientConfig.serviceUser);
    managedObjectUseForm.setValue('connectorClientConfig.serviceUserPwd', managedObjectFormData.connectorClientConfig.serviceUserPwd);
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    props.onLoadingChange(true);
    await apiCreateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // setIsFormSubmitted(true);
  }

  const onSubmitManagedObjectForm = (managedObjectFormData: TManagedObjectFormData) => {
    doSubmitManagedObject(transformFormDataToManagedObject(managedObjectFormData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const displayManagedObjectFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectCreateForm = () => {
    return (
      <div className="card">
        <div className="p-fluid">
          <form onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">            
            {/* connectorId */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="connectorId"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSId_ValidationRules()}
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
                <label htmlFor="connectorId" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorId })}>Id*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorId)}
            </div>
            {/* displayName */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <Controller
                  name="displayName"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter display name.",
                    validate: {
                      trim: v => v.trim().length === v.length ? true : 'Enter Display Name without leading/trailing spaces.',
                    }
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.displayName)}
            </div>
            {/* description */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="description"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter description.",
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
                <label htmlFor="description" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.description })}>Description*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.description)}
            </div>
            {/* Protocol */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorClientConfig.protocol"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose the protocol."
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown 
                          id={field.name}
                          {...field}
                          options={managedObjectFormDataProtocolSelectItems} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="connectorClientConfig.protocol" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.protocol })}>Protocol*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.protocol)}
            </div>
            {/* Host */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorClientConfig.host"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSHost_ValidationRules()}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="connectorClientConfig.host" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.host })}>Host*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.host)}
            </div>
            {/* Port */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorClientConfig.port"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSPort_ValidationRules()}
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
                <label htmlFor="connectorClientConfig.port" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.port })}>Port*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.port)}
            </div>
            {/* serviceUser */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorClientConfig.serviceUser"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter Username.",
                    validate: {
                      trim: v => v.trim().length === v.length ? true : 'Enter Username without leading/trailing spaces.',
                    }
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="connectorClientConfig.serviceUser" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.serviceUser })}>Service User*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.serviceUser)}
            </div>
            {/* serviceUserPwd */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorClientConfig.serviceUserPwd"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter Password.",
                    validate: {
                      trim: v => v.trim().length === v.length ? true : 'Enter Password without leading/trailing spaces.',
                    }
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <Password
                          id={field.name}
                          toggleMask={true}
                          feedback={false}        
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="connectorClientConfig.serviceUserPwd" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.serviceUserPwd })}>Service User Password*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.serviceUserPwd)}
            </div>
            <Divider />
            {renderManagedObjectFormFooter()}
          </form>  
        </div>
      </div>
    );
  }

  return (
    <div className="ap-environments">

      {ManageConnectorsCommon.renderSubComponentHeader('Create Connector')}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderManagedObjectCreateForm()}

    </div>
  );
}
