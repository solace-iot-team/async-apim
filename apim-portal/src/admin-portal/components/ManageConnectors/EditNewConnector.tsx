
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { Dropdown } from "primereact/dropdown";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from "primereact/inputnumber";
import { Password } from "primereact/password";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { 
  ApsConfigService, 
  APSConnector,
  APSConnectorCreate,
  APSConnectorReplace,
  APSId,
  EAPSClientProtocol,
  EAPSConnectorClientConfigType
} from '@solace-iot-team/apim-server-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APSOpenApiFormValidationRules } from "../../../utils/APSOpenApiFormValidationRules";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageConnectorsCommon";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewConnectorProps {
  action: EAction,
  connectorId?: APSId;
  connectorDisplayName?: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newId: APSId, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewConnector: React.FC<IEditNewConnectorProps> = (props: IEditNewConnectorProps) => {
  const componentName = 'EditNewConnector';

  type TApiCreateObject = APSConnectorCreate;
  type TApiReplaceObject = APSConnectorReplace;
  type TManagedObject = APSConnector;
  type TManagedObjectFormData = TManagedObject;
  type TManagedObjectFormDataProtocolSelectItems = Array<{ label: string, value: EAPSClientProtocol }>;

  const managedObjectFormDataProtocolSelectItems:TManagedObjectFormDataProtocolSelectItems = [
    { label: 'http', value: EAPSClientProtocol.HTTP },
    { label: 'https', value: EAPSClientProtocol.HTTPS }
  ];

  const emptyManagedObject: TManagedObject = {
    connectorId: '',
    displayName: '',
    description: '',
    isActive: false,
    connectorClientConfig: {
      configType: EAPSConnectorClientConfigType.INTERNAL_PROXY,
      apiVersion: 'v1',
      serviceUser: '',
      serviceUserPwd: ''
    }    
  };
  
  const transformManagedObjectToCreateApiObject = (mo: TManagedObject): TApiCreateObject => {
    return mo;
  }

  const transformManagedObjectToReplaceApiObject = (mo: TManagedObject): TApiReplaceObject => {
    return mo;
  }

  const transformManagedObjectToFormData = (mo: TManagedObject): TManagedObjectFormData => {
    return mo;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    return formData;
  }

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<APSId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  
  const managedObjectUseForm = useForm<TManagedObjectFormData>();

  // * Api Calls *
  const apiGetManagedObject = async(moId: APSId, moDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_CONNECTOR, `retrieve details for connector: ${moDisplayName}`);
    try { 
      const apsConnector: APSConnector = await ApsConfigService.getApsConnector({
        connectorId: moId
      });
      setManagedObject(apsConnector);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;

    console.log(`${logName}: mo = ${JSON.stringify(mo, null, 2)}`);
    console.log(`${logName}: transformManagedObjectToCreateApiObject(mo) = ${JSON.stringify(transformManagedObjectToCreateApiObject(mo), null, 2)}`);

    // throw new Error(`${logName}: continue here`);

    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_CONNECTOR, `create connector: ${mo.displayName}`);
    try { 
      const createdApiObject: APSConnector = await ApsConfigService.createApsConnector({
        requestBody: transformManagedObjectToCreateApiObject(mo)
      });
      setCreatedManagedObjectId(createdApiObject.connectorId);
      setCreatedManagedObjectDisplayName(createdApiObject.displayName);      
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiReplaceManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiReplaceManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_REPLACE_CONNECTOR, `update connector: ${mo.displayName}`);
    try { 
      await ApsConfigService.replaceApsConnector({
        connectorId: mo.connectorId, 
        requestBody: transformManagedObjectToReplaceApiObject(mo)
      });
      setUpdatedManagedObjectDisplayName(mo.displayName);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.EDIT) {
      if(!props.connectorId) throw new Error(`${logName}: props.action=${props.action}: props.connectorId is undefined`);
      if(!props.connectorDisplayName) throw new Error(`${logName}: props.action=${props.action}: props.connectorDisplayName is undefined`);
      await apiGetManagedObject(props.connectorId, props.connectorDisplayName);
    } else {
      setManagedObject(emptyManagedObject);
    }
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormData(transformManagedObjectToFormData(managedObject));
    }
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormData) doPopulateManagedObjectFormDataValues(managedObjectFormData);
  }, [managedObjectFormData]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_CONNECTOR) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_REPLACE_CONNECTOR) {
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }

  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (mofd: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('connectorId', mofd.connectorId);
    managedObjectUseForm.setValue('displayName', mofd.displayName);
    managedObjectUseForm.setValue('description', mofd.description);

    managedObjectUseForm.setValue('connectorClientConfig.location', mofd.connectorClientConfig.location);
    // managedObjectUseForm.setValue('connectorClientConfig.host', managedObjectFormData.connectorClientConfig.host);
    // managedObjectUseForm.setValue('connectorClientConfig.port', managedObjectFormData.connectorClientConfig.port);
    managedObjectUseForm.setValue('connectorClientConfig.configType', mofd.connectorClientConfig.configType);
    managedObjectUseForm.setValue('connectorClientConfig.apiVersion', mofd.connectorClientConfig.apiVersion);
    managedObjectUseForm.setValue('connectorClientConfig.serviceUser', mofd.connectorClientConfig.serviceUser);
    managedObjectUseForm.setValue('connectorClientConfig.serviceUserPwd', mofd.connectorClientConfig.serviceUserPwd);
  }

  const doSubmitManagedObject = async(mo: TManagedObject) => {
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(mo);
    else await apiReplaceManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (formData: TManagedObjectFormData) => {
    doSubmitManagedObject(transformFormDataToManagedObject(formData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // setIsFormSubmitted(true);
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

  const renderManagedObjectFormConfigExternal = (configType: EAPSConnectorClientConfigType) => {
    const isActive: boolean = (configType === EAPSConnectorClientConfigType.EXTERNAL);
    return (
      <div className="p-ml-2"
        // hidden={!isActive}
      >
        {/* Protocol */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="connectorClientConfig.location.protocol"
              control={managedObjectUseForm.control}
              // rules={{
              //   required: "Choose the protocol."
              // }}
              rules={APSOpenApiFormValidationRules.APSClientProtocol('Choose the protocol.', isActive)}
              render={( { field, fieldState }) => {
                  return(
                    <Dropdown 
                      id={field.name}
                      {...field}
                      options={managedObjectFormDataProtocolSelectItems} 
                      onChange={(e) => field.onChange(e.value)}
                      className={classNames({ 'p-invalid': fieldState.invalid })}       
                      disabled={!isActive}                                  
                    />
              )}}
            />
            <label htmlFor="connectorClientConfig.location.protocol" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.location?.protocol })}>Protocol*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.location?.protocol)}
        </div>
        {/* Host */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="connectorClientConfig.location.host"
              control={managedObjectUseForm.control}
              rules={APSOpenApiFormValidationRules.APSHost('Enter a host or IP address.',isActive)}
              render={( { field, fieldState }) => {
                  // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                  return(
                    <InputText
                      id={field.name}
                      {...field}
                      className={classNames({ 'p-invalid': fieldState.invalid })}
                      disabled={!isActive}                                  
                    />
              )}}
            />
            <label htmlFor="connectorClientConfig.location.host" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.location?.host })}>Host*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.location?.host)}
        </div>
        {/* Port */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="connectorClientConfig.location.port"
              control={managedObjectUseForm.control}
              rules={APSOpenApiFormValidationRules.APSPort('Enter Port Number.', isActive)}
              render={( { field, fieldState }) => {
                  return(
                    <InputNumber
                      id={field.name}
                      {...field}
                      onChange={(e) => field.onChange(e.value)}
                      mode="decimal" 
                      useGrouping={false}
                      className={classNames({ 'p-invalid': fieldState.invalid })}
                      disabled={!isActive}                                  
                    />
              )}}
            />
            <label htmlFor="connectorClientConfig.location.port" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.location?.port })}>Port*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.location?.port)}
        </div>
      </div>
    );
  }

  const renderManagedObjectFormConfigDetails = (configType: EAPSConnectorClientConfigType) => {
    return (
      <React.Fragment>
        {renderManagedObjectFormConfigExternal(configType)}
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    const isNewObject: boolean = (props.action === EAction.NEW);
    const configType: EAPSConnectorClientConfigType = managedObjectUseForm.watch('connectorClientConfig.configType');

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
                  rules={APSOpenApiFormValidationRules.APSId("Enter unique Id.", true)}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={isNewObject}
                          disabled={!isNewObject}
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
                          autoFocus={!isNewObject}
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

            {/* config Type */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorClientConfig.configType"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select Config Type.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={Object.values(EAPSConnectorClientConfigType)} 
                          onChange={(e) => {                           
                            field.onChange(e.value);
                            managedObjectUseForm.clearErrors();
                          }}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                  )}}
                />
                <label htmlFor="connectorClientConfig.configType" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.configType })}>Configuration Type*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.configType)}
            </div>

            { renderManagedObjectFormConfigDetails(configType)}

            {/* basePath */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorClientConfig.basePath"
                  control={managedObjectUseForm.control}
                  // rules={APSOpenApiFormValidationRules.APSHost_ValidationRules()}
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
                <label htmlFor="connectorClientConfig.basePath" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorClientConfig?.basePath })}>Base Path</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorClientConfig?.basePath)}
            </div>

            {renderManagedObjectFormFooter()}
          </form>  
        </div>
      </div>
    );
  }
  
  return (
    <div className="manage-connectors">

      {managedObject && props.action === EAction.NEW && 
        <APComponentHeader header='Create Connector:' />
      }

      {managedObject && props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit Connector: ${props.connectorDisplayName}`} />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject &&
        renderManagedObjectForm()
      }
    </div>
  );
}
