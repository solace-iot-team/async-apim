
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
  APSLocationConfig,
  APSLocationConfigExternal,
  APSLocationConfigInternalProxy,
  EAPSClientProtocol,
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APSOpenApiFormValidationRules } from "../../../utils/APSOpenApiFormValidationRules";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageConnectorsCommon";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";
import { Globals } from "../../../utils/Globals";

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
  type TLocationConfigTypeSelectId = 
    APSLocationConfigInternalProxy.configType.INTERNAL_PROXY
    | APSLocationConfigExternal.configType.EXTERNAL;
  const ELocationConfigTypeSelectId = {
    ...APSLocationConfigInternalProxy.configType,
    ...APSLocationConfigExternal.configType
  }
  type TManagedObjectFormData = {
    managedObject: TManagedObject;
    selectedLocationConfigTypeId: TLocationConfigTypeSelectId;
    locationConfigInternalProxy: APSLocationConfigInternalProxy;
    locationConfigExternal: APSLocationConfigExternal;
  }
  type TManagedObjectFormDataProtocolSelectItems = Array<{ label: string, value: EAPSClientProtocol }>;

  const managedObjectFormDataProtocolSelectItems:TManagedObjectFormDataProtocolSelectItems = [
    { label: 'http', value: EAPSClientProtocol.HTTP },
    { label: 'https', value: EAPSClientProtocol.HTTPS }
  ];

  const emptyLocationConfigInternalProxy: APSLocationConfigInternalProxy = {
    configType: APSLocationConfigInternalProxy.configType.INTERNAL_PROXY
  };
  const emptyLocationConfigExternal: APSLocationConfigExternal = {
    configType: APSLocationConfigExternal.configType.EXTERNAL,
    protocol: EAPSClientProtocol.HTTP,
    host: '',
    port: 3000
  };
  
  const emptyManagedObject: TManagedObject = {
    connectorId: '',
    displayName: '',
    description: '',
    isActive: false,
    connectorClientConfig: {
      locationConfig: emptyLocationConfigInternalProxy,
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
    const funcName = 'transformManagedObjectToFormData';
    const logName = `${componentName}.${funcName}()`;

    const _selectedLocationConfigTypeId: TLocationConfigTypeSelectId = mo.connectorClientConfig.locationConfig.configType;
    let _locationConfigInternalProxy: APSLocationConfigInternalProxy = emptyLocationConfigInternalProxy;
    let _locationConfigExternal: APSLocationConfigExternal = emptyLocationConfigExternal;
    switch (_selectedLocationConfigTypeId) {
      case ELocationConfigTypeSelectId.INTERNAL_PROXY:
        // nothing to set
        break;
      case ELocationConfigTypeSelectId.EXTERNAL:
        _locationConfigExternal = mo.connectorClientConfig.locationConfig as APSLocationConfigExternal;
        break;
      default:
        Globals.assertNever(logName, _selectedLocationConfigTypeId);
    }
    const mofd: TManagedObjectFormData = {
      managedObject: mo,
      selectedLocationConfigTypeId: _selectedLocationConfigTypeId,
      locationConfigInternalProxy: _locationConfigInternalProxy,
      locationConfigExternal: _locationConfigExternal
    };
    return mofd;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const transformLocationConfig = (formData: TManagedObjectFormData): APSLocationConfig => {
      const funcName = 'transformLocationConfig';
      const logName = `${componentName}.${funcName}()`;  
      switch(formData.selectedLocationConfigTypeId) {
        case ELocationConfigTypeSelectId.INTERNAL_PROXY:
          return formData.locationConfigInternalProxy;
        case ELocationConfigTypeSelectId.EXTERNAL:
          return formData.locationConfigExternal;
        default:
          Globals.assertNever(logName, formData.selectedLocationConfigTypeId);
      }
      // never gets here
      return emptyLocationConfigInternalProxy;
    }
    const new_mo: TManagedObject = {
      ...formData.managedObject,
      connectorClientConfig: {
        ...formData.managedObject.connectorClientConfig,
        locationConfig: transformLocationConfig(formData)
      }
    }
    return new_mo;
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
    managedObjectUseForm.setValue('managedObject.connectorId', mofd.managedObject.connectorId);
    managedObjectUseForm.setValue('managedObject.displayName', mofd.managedObject.displayName);
    managedObjectUseForm.setValue('managedObject.description', mofd.managedObject.description);

    managedObjectUseForm.setValue('managedObject.connectorClientConfig.apiVersion', mofd.managedObject.connectorClientConfig.apiVersion);
    managedObjectUseForm.setValue('managedObject.connectorClientConfig.serviceUser', mofd.managedObject.connectorClientConfig.serviceUser);
    managedObjectUseForm.setValue('managedObject.connectorClientConfig.serviceUserPwd', mofd.managedObject.connectorClientConfig.serviceUserPwd);

    managedObjectUseForm.setValue('selectedLocationConfigTypeId', mofd.selectedLocationConfigTypeId);
    managedObjectUseForm.setValue('locationConfigExternal', mofd.locationConfigExternal);
    managedObjectUseForm.setValue('locationConfigInternalProxy', mofd.locationConfigInternalProxy);
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

  const renderManagedObjectFormConfigExternal = (selectedLocationConfigTypeId: TLocationConfigTypeSelectId) => {
    const isActive: boolean = (selectedLocationConfigTypeId === ELocationConfigTypeSelectId.EXTERNAL);
    return (
      <div className="p-ml-2"
        hidden={!isActive}
      >
        {/* Protocol */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="locationConfigExternal.protocol"
              control={managedObjectUseForm.control}
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
            <label htmlFor="locationConfigExternal.protocol" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.locationConfigExternal?.protocol })}>Protocol*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.locationConfigExternal?.protocol)}
        </div>
        {/* Host */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="locationConfigExternal.host"
              control={managedObjectUseForm.control}
              rules={APSOpenApiFormValidationRules.APSHost('Enter a host or IP address.', isActive)}
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
            <label htmlFor="locationConfigExternal.host" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.locationConfigExternal?.host })}>Host*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.locationConfigExternal?.host)}
        </div>
        {/* Port */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="locationConfigExternal.port"
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
            <label htmlFor="locationConfigExternal.port" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.locationConfigExternal?.port })}>Port*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.locationConfigExternal?.port)}
        </div>
      </div>
    );
  }

  const renderManagedObjectFormConfigDetails = (selectedLocationConfigTypeId: TLocationConfigTypeSelectId) => {
    return (
      <React.Fragment>
        {renderManagedObjectFormConfigExternal(selectedLocationConfigTypeId)}
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    const isNewObject: boolean = (props.action === EAction.NEW);
    const selectedLocationConfigTypeId: TLocationConfigTypeSelectId = managedObjectUseForm.watch('selectedLocationConfigTypeId');

    return (
      <div className="card">
        <div className="p-fluid">
          <form onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">            
            {/* connectorId */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="managedObject.connectorId"
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
                <label htmlFor="managedObject.connectorId" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.managedObject?.connectorId })}>Id*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.managedObject?.connectorId)}
            </div>
            {/* displayName */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <Controller
                  name="managedObject.displayName"
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
                <label htmlFor="managedObject.displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.managedObject?.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.managedObject?.displayName)}
            </div>
            {/* description */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="managedObject.description"
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
                <label htmlFor="managedObject.description" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.managedObject?.description })}>Description*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.managedObject?.description)}
            </div>
            {/* serviceUser */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="managedObject.connectorClientConfig.serviceUser"
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
                <label htmlFor="managedObject.connectorClientConfig.serviceUser" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.managedObject?.connectorClientConfig?.serviceUser })}>Service User*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.managedObject?.connectorClientConfig?.serviceUser)}
            </div>
            {/* serviceUserPwd */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="managedObject.connectorClientConfig.serviceUserPwd"
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
                <label htmlFor="managedObject.connectorClientConfig.serviceUserPwd" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.managedObject?.connectorClientConfig?.serviceUserPwd })}>Service User Password*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.managedObject?.connectorClientConfig?.serviceUserPwd)}
            </div>

            {/* config Type */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="selectedLocationConfigTypeId"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select Config Type.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={Object.values(ELocationConfigTypeSelectId)} 
                          onChange={(e) => {                           
                            field.onChange(e.value);
                            managedObjectUseForm.clearErrors();
                          }}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                  )}}
                />
                <label htmlFor="selectedLocationConfigTypeId" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.selectedLocationConfigTypeId })}>Configuration Type*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.selectedLocationConfigTypeId)}
            </div>

            { renderManagedObjectFormConfigDetails(selectedLocationConfigTypeId)}

            {/* basePath */}
            {/* <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="managedObject.connectorClientConfig.basePath"
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
                <label htmlFor="managedObject.connectorClientConfig.basePath" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.managedObject?.connectorClientConfig?.basePath })}>Base Path</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.managedObject?.connectorClientConfig?.basePath)}
            </div> */}

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
