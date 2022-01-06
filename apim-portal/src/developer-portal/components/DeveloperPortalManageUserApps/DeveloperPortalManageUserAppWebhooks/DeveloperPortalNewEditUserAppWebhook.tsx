
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";

import { 
  AppsService, 
  AppPatch,
  WebHook,
  WebHookAuth,
  WebHookBasicAuth,
  WebHookHeaderAuth,
  AppStatus
} from '@solace-iot-team/apim-connector-openapi-browser';

import { 
  APSUserId
} from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import { Globals } from "../../../../utils/Globals";
import { APSOpenApiFormValidationRules } from "../../../../utils/APSOpenApiFormValidationRules";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  APManagedWebhook,
  TAPManagedAppWebhooks,
  TAPManagedWebhook,
  TAPManagedWebhookList,
  TAPOrganizationId,
  TAPTrustedCNList,
} from "../../../../components/APComponentsCommon";
import { 
  EWebhookAuthMethodSelectIdNone,
  E_CALL_STATE_ACTIONS, 
} from "./DeveloperPortalManageUserAppWebhooksCommon";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { APManageTrustedCNs } from "../../../../components/APManageTrustedCNs/APManageTrustedCNs";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IDeveloperPortalNewEditUserAppWebhookProps {
  action: EAction;
  organizationId: TAPOrganizationId;
  userId: APSUserId;
  managedAppWebhooks: TAPManagedAppWebhooks;
  managedWebhook: TAPManagedWebhook;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newManagedWebhook: TAPManagedWebhook) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedManagedWebhook: TAPManagedWebhook) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalNewEditUserAppWebhook: React.FC<IDeveloperPortalNewEditUserAppWebhookProps> = (props: IDeveloperPortalNewEditUserAppWebhookProps) => {
  const componentName = 'DeveloperPortalNewEditUserAppWebhook';

  type TUpdateApiObject = AppPatch;
  type TManagedObject = TAPManagedWebhook;

  enum EProtocolSelect {
    HTTP = "http",
    HTTPS = 'https'
  }
  type TWebhookAuthMethodSelectId = 
    EWebhookAuthMethodSelectIdNone 
    | WebHookBasicAuth.authMethod.BASIC 
    | WebHookHeaderAuth.authMethod.HEADER;
  const EWebhookAuthMethodSelectId = { 
    ...EWebhookAuthMethodSelectIdNone, 
    ...WebHookBasicAuth.authMethod, 
    ...WebHookHeaderAuth.authMethod 
  }

  type TManagedObjectFormData = {
    protocol: EProtocolSelect;
    host: string;
    port: number;
    resource: string;
    httpMethod: WebHook.method;
    deliveryMode: WebHook.mode;
    selectedWebhookAuthMethodId: TWebhookAuthMethodSelectId;
    webhookBasicAuth: WebHookBasicAuth;
    webhookHeaderAuth: WebHookHeaderAuth;
    // environmentSelectItemList: TApiEntitySelectItemList;
    // selectedEnvironmentName: CommonName;
    apTrustedCNList: TAPTrustedCNList;
  };

  const emptyManagedObject: TManagedObject = {
    references: props.managedWebhook.references,
    webhookEnvironmentReference: props.managedWebhook.webhookEnvironmentReference,
    webhookWithoutEnvs: {
      method: WebHook.method.POST,
      mode: WebHook.mode.SERIAL,
      uri: ''
    }
  }
  const emptyWebhookBasicAuth: WebHookBasicAuth = {
    authMethod: WebHookBasicAuth.authMethod.BASIC,
    username: '',
    password: ''
  }
  const emptyWebhookHeaderAuth: WebHookHeaderAuth = {
    authMethod: WebHookHeaderAuth.authMethod.HEADER,
    headerName: '',
    headerValue: ''
  }

  const transformManagedObjectToUpdateApiObject = (mo: TManagedObject): TUpdateApiObject => {
    // const funcName = 'transformManagedObjectToUpdateApiObject';
    // const logName = `${componentName}.${funcName}()`;
    const newManagedWebhookList: TAPManagedWebhookList = APManagedWebhook.createNewManagedWebhookList(props.managedAppWebhooks, mo);
    const _appPatch: AppPatch = APManagedWebhook.createApiAppWebhookUpdateRequestBodyFromAPManagedAppWebhooks(props.managedAppWebhooks, newManagedWebhookList);
    // console.log(`${logName}: _appPatch=${JSON.stringify(_appPatch, null, 2)}`);
    return _appPatch;
  }

  const transformManagedObjectToFormData = (mo: TManagedObject): TManagedObjectFormData => {
    const funcName = 'transformManagedObjectToFormData';
    const logName = `${componentName}.${funcName}()`;
    if(!mo.webhookWithoutEnvs) throw new Error(`${logName}: mo.webhookWithoutEnvs is undefined`);
    let protocol: EProtocolSelect = EProtocolSelect.HTTP;
    let host: string = '';
    let port: number = 80;
    let resource: string = '';
    if(mo.webhookWithoutEnvs.uri !== '') {
      const url: URL = new URL(mo.webhookWithoutEnvs.uri);
      protocol = url.protocol === 'http:' ? EProtocolSelect.HTTP : EProtocolSelect.HTTPS;
      host = url.hostname;
      if(url.port) port = parseInt(url.port);  
      resource = `${url.pathname}${url.search}`; 
    }
    // authentication
    let selectedWebhookAuthMethodId: TWebhookAuthMethodSelectId;
    let webhookBasicAuth: WebHookBasicAuth = emptyWebhookBasicAuth;
    let webhookHeaderAuth: WebHookHeaderAuth = emptyWebhookHeaderAuth;
    if(!mo.webhookWithoutEnvs.authentication) selectedWebhookAuthMethodId = EWebhookAuthMethodSelectIdNone.NONE;
    else if(mo.webhookWithoutEnvs.authentication.authMethod) selectedWebhookAuthMethodId = mo.webhookWithoutEnvs.authentication.authMethod;
    else throw new Error(`${logName}: mo.webhookWithoutEnvs.authentication.authMethod is undefined`);
    
    switch (selectedWebhookAuthMethodId) {
      case EWebhookAuthMethodSelectIdNone.NONE:
        break;
      case WebHookBasicAuth.authMethod.BASIC:
        if(!mo.webhookWithoutEnvs.authentication) throw new Error(`${logName}: mo.webhookWithoutEnvs.authentication is undefined`);
        webhookBasicAuth = mo.webhookWithoutEnvs.authentication as WebHookBasicAuth;
        break;
      case WebHookHeaderAuth.authMethod.HEADER:
        if(!mo.webhookWithoutEnvs.authentication) throw new Error(`${logName}: mo.webhookWithoutEnvs.authentication is undefined`);
        webhookHeaderAuth = mo.webhookWithoutEnvs.authentication as WebHookHeaderAuth;
        break;
      default:
        Globals.assertNever(logName, selectedWebhookAuthMethodId);
    }

    let apTrustedCNList: TAPTrustedCNList = [];
    if(mo.webhookWithoutEnvs.tlsOptions && mo.webhookWithoutEnvs.tlsOptions.tlsTrustedCommonNames) apTrustedCNList = mo.webhookWithoutEnvs.tlsOptions.tlsTrustedCommonNames;

    const mofd: TManagedObjectFormData = {
      protocol: protocol,
      host: host,
      port: port,
      resource: resource,
      selectedWebhookAuthMethodId: selectedWebhookAuthMethodId,
      webhookBasicAuth: webhookBasicAuth,
      webhookHeaderAuth: webhookHeaderAuth,
      httpMethod: mo.webhookWithoutEnvs.method,
      deliveryMode: mo.webhookWithoutEnvs.mode,
      apTrustedCNList: apTrustedCNList
    }
    return mofd;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const funcName = 'transformFormDataToManagedObject';
    const logName = `${componentName}.${funcName}()`;

    const transformAuthMethodToWebHookAuth = (formData: TManagedObjectFormData): WebHookAuth | undefined => {
      const funcName = 'transformAuthMethodToWebHookAuth';
      const logName = `${componentName}.${funcName}()`;

      switch (formData.selectedWebhookAuthMethodId) {
        case EWebhookAuthMethodSelectIdNone.NONE:
          return undefined;
        case WebHookBasicAuth.authMethod.BASIC:
          return formData.webhookBasicAuth;
        case WebHookHeaderAuth.authMethod.HEADER:
          return formData.webhookHeaderAuth;
        default:
          Globals.assertNever(logName, formData.selectedWebhookAuthMethodId);
      }
    }
    let url: URL;
    const base: string = `${formData.protocol}://${formData.host}:${formData.port}`;
    if(formData.resource !== '') url = new URL(formData.resource, base);
    else url = new URL(base);
    const apiWebHook: WebHook = {
      uri: url.toString(),
      method: formData.httpMethod,
      mode: formData.deliveryMode,
      authentication: transformAuthMethodToWebHookAuth(formData),
      // environments: [formData.selectedEnvironmentName],
      environments: [props.managedWebhook.webhookEnvironmentReference.entityRef.name],
      tlsOptions: {
        tlsTrustedCommonNames: formData.apTrustedCNList
      }
    }
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    const new_mo: TManagedObject = {
      references: managedObject.references,
      webhookEnvironmentReference: managedObject.webhookEnvironmentReference,
      webhookWithoutEnvs: apiWebHook
    }
    return new_mo;
  }

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [newManagedObject, setNewManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;
  // const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);

  // * Api Calls *
  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP, `update webhooks for app: ${props.managedAppWebhooks.appDisplayName}`);
    try { 
      await AppsService.updateDeveloperApp({
        organizationName: props.organizationId, 
        developerUsername: props.userId, 
        appName: props.managedAppWebhooks.appId, 
        requestBody: transformManagedObjectToUpdateApiObject(mo)
      });
      setNewManagedObject(mo);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    if(props.action === EAction.EDIT) {
      if(!props.managedWebhook) throw new Error(`${logName}: action=${props.action} - one or more props undefined, props=${JSON.stringify(props)}`);
      setManagedObject(props.managedWebhook);
    } else {
      setManagedObject(emptyManagedObject);
    }
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormData(transformManagedObjectToFormData(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormData) doPopulateManagedObjectFormDataValues(managedObjectFormData);
  }, [managedObjectFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
    else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP) {
      if(!newManagedObject) return;
      switch(props.action) {
        case EAction.NEW: 
          props.onNewSuccess(apiCallStatus, newManagedObject);
          break;
        case EAction.EDIT: 
          props.onEditSuccess(apiCallStatus, newManagedObject);
          break;
        default:
          Globals.assertNever(logName, props.action);
      }
    }
  }, [apiCallStatus, newManagedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (formData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('protocol', formData.protocol);
    managedObjectUseForm.setValue('host', formData.host);
    managedObjectUseForm.setValue('port', formData.port);
    managedObjectUseForm.setValue('resource', formData.resource);
    managedObjectUseForm.setValue('httpMethod', formData.httpMethod);
    managedObjectUseForm.setValue('deliveryMode', formData.deliveryMode);
    // auth
    managedObjectUseForm.setValue('selectedWebhookAuthMethodId', formData.selectedWebhookAuthMethodId);
    managedObjectUseForm.setValue('webhookBasicAuth.authMethod', formData.webhookBasicAuth.authMethod);
    managedObjectUseForm.setValue('webhookBasicAuth.username', formData.webhookBasicAuth.username);
    managedObjectUseForm.setValue('webhookBasicAuth.password', formData.webhookBasicAuth.password);
    managedObjectUseForm.setValue('webhookHeaderAuth.authMethod', formData.webhookHeaderAuth.authMethod);
    managedObjectUseForm.setValue('webhookHeaderAuth.headerName', formData.webhookHeaderAuth.headerName);
    managedObjectUseForm.setValue('webhookHeaderAuth.headerValue', formData.webhookHeaderAuth.headerValue);
    // env
    // managedObjectUseForm.setValue('selectedEnvironmentName', formData.selectedEnvironmentName);  
    // trusted CNs
    managedObjectUseForm.setValue('apTrustedCNList', formData.apTrustedCNList);
  }

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
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

  // const displayManagedObjectFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
  //   let _fieldError: any = fieldErrorList;
  //   return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  // }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    const getSubmitButton = (): JSX.Element => {
      const funcName = 'getSubmitButton';
      const logName = `${componentName}.${funcName}()`;
      const appStatus: AppStatus | undefined = props.managedAppWebhooks.apiAppResponse.status;
      if(!appStatus) throw new Error(`${logName}: appStatus is undefined`);
      switch(appStatus) {
        case AppStatus.PENDING:
          return (
            <Button form={formId} type="submit" label='Save' icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" style={{ width: '12em'}} />
          );
        case AppStatus.APPROVED:
          return (
            <Button form={formId} type="submit" label='Provision' icon="pi pi-fast-forward" className="p-button-text p-button-plain p-button-outlined" style={{ width: '12em'}} />
          );
        default:
          Globals.assertNever(logName, appStatus);
      }
      return (<></>);
    }
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        {getSubmitButton()}
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectFormWebhookBasicAuth = (webhookAuthMethodSelectId: TWebhookAuthMethodSelectId) => {
    const isActive: boolean = (webhookAuthMethodSelectId === WebHookBasicAuth.authMethod.BASIC);
    return (
      <div className="p-ml-4" hidden={!isActive}>
      {/* <div className="p-ml-4"> */}
        {/* username */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="webhookBasicAuth.username"
              control={managedObjectUseForm.control}
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
            <label htmlFor="webhookBasicAuth.username" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.webhookBasicAuth?.username})}>Username*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.webhookBasicAuth?.username)}
        </div>
        {/* password */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="webhookBasicAuth.password"
              control={managedObjectUseForm.control}
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
            <label htmlFor="webhookBasicAuth.password" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.webhookBasicAuth?.password })}>Password*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.webhookBasicAuth?.password)}
        </div>
      </div>
    );
  }

  const renderManagedObjectFormWebhookHeaderAuth = (webhookAuthMethodSelectId: TWebhookAuthMethodSelectId) => {
    const isActive: boolean = (webhookAuthMethodSelectId === WebHookHeaderAuth.authMethod.HEADER);
    return (
      <div className="p-ml-4" hidden={!isActive}>
      {/* <div className="p-ml-4"> */}
        {/* header name */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="webhookHeaderAuth.headerName"
              control={managedObjectUseForm.control}
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
            <label htmlFor="webhookHeaderAuth.headerName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.webhookHeaderAuth?.headerName})}>Header Name*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.webhookHeaderAuth?.headerName)}
        </div>
        {/* headerValue */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="webhookHeaderAuth.headerValue"
              control={managedObjectUseForm.control}
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
            <label htmlFor="webhookHeaderAuth.headerValue" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.webhookHeaderAuth?.headerValue })}>Header Value*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.webhookHeaderAuth?.headerValue)}
        </div>
      </div>
    );
  }
  const renderManagedObjectFormWebhookAuthMethodDetails = (webhookAuthMethodSelectId: TWebhookAuthMethodSelectId) => {
    // const funcName = 'renderManagedObjectFormWebhookAuthMethodDetails';
    // const logName = `${componentName}.${funcName}()`;
    return (
      <React.Fragment>
        {renderManagedObjectFormWebhookBasicAuth(webhookAuthMethodSelectId)}
        {renderManagedObjectFormWebhookHeaderAuth(webhookAuthMethodSelectId)}
      </React.Fragment>
    );
  }

  const renderManageTrustedCNs = (): JSX.Element => {
    const funcName = 'renderManageTrustedCNs';
    const logName = `${componentName}.${funcName}()`;

    const onTrustedCNListUpdate = (trustedCNList: TAPTrustedCNList) => {
      const funcName = 'onTrustedCNListUpdate';
      const logName = `${componentName}.${funcName}()`;
      // alert(`${logName}: trustedCNList=${JSON.stringify(trustedCNList, null, 2)}`);
      if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
      const newMofd: TManagedObjectFormData = {
        ...managedObjectFormData,
        apTrustedCNList: trustedCNList
      }
      // console.log(`${logName}: newMofd = ${JSON.stringify(newMofd, null, 2)}`);
      setManagedObjectFormData(newMofd);
    }
  
    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            {`Certificate Trusted Common Names (${trustedCNList.length})`}
          </span>
        </div>
      );
    }
    // main
    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    const trustedCNList: TAPTrustedCNList = managedObjectFormData.apTrustedCNList;
    return (  
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable={true}
          // collapsed={trustedCNList.length === 0}
          collapsed={true}
        >
          <React.Fragment>
            {/* <div className="p-field" style={{ width: '96%' }} >
              help text
            </div> */}
            <APManageTrustedCNs
              formId={componentName+'_APManageTrustedCNs'}
              trustedCNList={trustedCNList}
              // presetTrustedCN={what?}
              onChange={onTrustedCNListUpdate}
            />
          </React.Fragment>
        </Panel>
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    
    const validateResource = (resource: string): any => {
      if(resource === '') return "Enter resource.";
      const dummyBase = "http://wh.acme.com";
      try {
        new URL(resource, dummyBase);
        return true;
      } catch (e: any) {
        return e.message;
      }
    }

    const selectedWebhookAuthMethodId: TWebhookAuthMethodSelectId = managedObjectUseForm.watch('selectedWebhookAuthMethodId');
    return (
      <div className="card p-mt-6">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* protocol */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="protocol"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select protocol.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={Object.values(EProtocolSelect)} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                      )}}
                />
                <label htmlFor="protocol" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.protocol })}>Protocol*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.protocol)}
            </div>
            {/* host */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="host"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSHost('Enter hostname or IP address.', true)}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="host" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.host })}>Host*</label>
                {/* <small id="host-help">Example: webhooks.acme.com.</small>    */}
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.host)}
            </div>
            {/* Port */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="port"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSPort("Enter Port Number.", true)}
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
                <label htmlFor="port" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.port })}>Port*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.port)}
            </div>
            {/* resource */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="resource"
                  control={managedObjectUseForm.control}
                  rules={{
                    validate: validateResource
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
                <label htmlFor="resource" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.resource })}>Resource*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.resource)}
            </div>
            {/* httpMethod */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="httpMethod"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select HTTP method.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={Object.values(WebHook.method)} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                      )}}
                />
                <label htmlFor="httpMethod" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.httpMethod })}>HTTP Method*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.httpMethod)}
            </div>
            {/* deliveryMode */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="deliveryMode"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select Delivery Mode.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={Object.values(WebHook.mode)} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                      )}}
                />
                <label htmlFor="deliveryMode" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.deliveryMode })}>Delivery Mode*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.deliveryMode)}
            </div>

            {/* auth method */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="selectedWebhookAuthMethodId"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select Authentication Method.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={Object.values(EWebhookAuthMethodSelectId)} 
                          onChange={(e) => { 
                            field.onChange(e.value);
                            managedObjectUseForm.clearErrors();
                          }}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                  )}}
                />
                <label htmlFor="selectedWebhookAuthMethodId" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.selectedWebhookAuthMethodId })}>Authentication Method*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.selectedWebhookAuthMethodId)}
            </div>

            {/* auth details */}
            { renderManagedObjectFormWebhookAuthMethodDetails(selectedWebhookAuthMethodId) }
          </form>  
            
          {/* trusted CNs Form */}
          <div className="p-field">
            { renderManageTrustedCNs() }
          </div>
          
          {/* footer */}
          {renderManagedObjectFormFooter()}

        </div>
      </div>
    );
  }

  const renderInfo = () => {
    return (
      <React.Fragment>
        <div><b>App Status</b>: {managedObject?.references.apiAppResponse.status}</div>
        <div><b>Environment</b>: {managedObject?.webhookEnvironmentReference.entityRef.displayName}</div>
      </React.Fragment>
    );
  }

  const getComponentHeader = (): string => {
    const funcName = 'getComponentHeader';
    const logName = `${componentName}.${funcName}()`;
    const appStatus: AppStatus | undefined = props.managedAppWebhooks.apiAppResponse.status;
    if(!appStatus) throw new Error(`${logName}: appStatus is undefined`);
    switch(appStatus) {
      case AppStatus.PENDING:
        if(props.action === EAction.NEW) return `Create New Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
        else if(props.action === EAction.EDIT) return `Edit Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
        else throw new Error(`${logName}: unknown props.action = ${props.action}`);
      case AppStatus.APPROVED:
        if(props.action === EAction.NEW) return `Provision New Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
        else if(props.action === EAction.EDIT) return `Re-Provision Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
        else throw new Error(`${logName}: unknown props.action = ${props.action}`);
      default:
        Globals.assertNever(logName, appStatus);
    }
    return '';
  }

  return (
    <div className="apd-manage-user-apps">

      <APComponentHeader header={getComponentHeader()} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-4">
        {renderInfo()}
      </div>

      { managedObjectFormData && renderManagedObjectForm() }

    </div>
  );
}
