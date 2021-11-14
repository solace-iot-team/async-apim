
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { MultiSelect } from "primereact/multiselect";
import { Password } from "primereact/password";
import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";

import { 
  AppsService, 
  AppPatch,
  WebHook,
  CommonName,
  WebHookAuth,
  WebHookBasicAuth,
  WebHookHeaderAuth
} from '@solace-iot-team/apim-connector-openapi-browser';

import { 
  APSUserId
} from '@solace-iot-team/apim-server-openapi-browser';

import { Globals } from "../../../../utils/Globals";
import { APSOpenApiFormValidationRules } from "../../../../utils/APSOpenApiFormValidationRules";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  TApiEntitySelectItem,
  TApiEntitySelectItemList,
  TAPOrganizationId,
  TAPTrustedCNList,
  TAPViewManagedWebhook, 
} from "../../../../components/APComponentsCommon";
import { 
  createWebhookEnabledEnvironmentList,
  EWebhookAuthMethodSelectIdNone,
  E_CALL_STATE_ACTIONS, 
  TViewManagedAppWebhookList, 
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
  action: EAction,
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  // appResponse: AppResponse,
  viewManagedAppWebhookList: TViewManagedAppWebhookList,
  viewManagedWebhook?: TAPViewManagedWebhook;
  presetEnvSelectItem?: TApiEntitySelectItem;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState) => void;
  onEditSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalNewEditUserAppWebhook: React.FC<IDeveloperPortalNewEditUserAppWebhookProps> = (props: IDeveloperPortalNewEditUserAppWebhookProps) => {
  const componentName = 'DeveloperPortalNewEditUserAppWebhook';

  type TUpdateApiObject = AppPatch;
  type TManagedObject = TAPViewManagedWebhook;

  enum EProtocolSelect {
    HTTP = "http",
    HTTPS = 'https'
  }
  // enum EAuthMethodSelectId {
  //   NONE = 'None',
  //   BASIC = WebHookBasicAuth.authMethod.BASIC,
  //   HEADER = 'Header'
  // }
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
    environmentSelectItemList: TApiEntitySelectItemList;
    selectedEnvironmentName: CommonName;
    apTrustedCNList: TAPTrustedCNList;
  };

  const emptyManagedObject: TManagedObject = {
    apSynthId: 'new',
    apiWebHook: {
      method: WebHook.method.POST,
      mode: WebHook.mode.SERIAL,
      uri: ''
    },
    webhookApiEnvironmentResponseList: [],
    apiAppResponse: props.viewManagedAppWebhookList.apiAppResponse
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
    const funcName = 'transformManagedObjectToUpdateApiObject';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mo=${JSON.stringify(mo, null, 2)}`);
    // alert(`${logName}: mo=${JSON.stringify(mo, null, 2)}`);

    const newManagedWebhookList: Array<TAPViewManagedWebhook> = props.viewManagedAppWebhookList.managedWebhookList.concat([]);
    const idx: number = newManagedWebhookList.findIndex( (mwh: TAPViewManagedWebhook) => {
      return (mwh.apSynthId === mo.apSynthId);
    });
    if(idx > -1) newManagedWebhookList.splice(idx, 1, mo);
    else newManagedWebhookList.push(mo);
    const newApiWebHookList: Array<WebHook> = newManagedWebhookList.map( (mwh: TAPViewManagedWebhook) => {
      // fix when connector api ready
      let copyOfWebhook: TAPViewManagedWebhook | any = JSON.parse(JSON.stringify(mwh.apiWebHook));
      delete copyOfWebhook.trustedCNList;
      return copyOfWebhook;
      // return mwh.apiWebHook;
    });
    const updateApiObject: TUpdateApiObject = {
      webHooks: newApiWebHookList
    };
    console.log(`${logName}: updateApiObject=${JSON.stringify(updateApiObject, null, 2)}`);

    return updateApiObject;
  }

  const transformManagedObjectToFormData = (mo: TManagedObject): TManagedObjectFormData => {
    const funcName = 'transformManagedObjectToFormData';
    const logName = `${componentName}.${funcName}()`;
    let protocol: EProtocolSelect = EProtocolSelect.HTTP;
    let host: string = '';
    let port: number = 80;
    let resource: string = '';
    if(mo.apiWebHook.uri !== '') {
      const url: URL = new URL(mo.apiWebHook.uri);
      protocol = url.protocol === 'http' ? EProtocolSelect.HTTP : EProtocolSelect.HTTPS;
      host = url.hostname;
      if(url.port) port = parseInt(url.port);  
      resource = `${url.pathname}${url.search}`; 
    }
    let selectedWebhookAuthMethodId: TWebhookAuthMethodSelectId;
    let webhookBasicAuth: WebHookBasicAuth = emptyWebhookBasicAuth;
    let webhookHeaderAuth: WebHookHeaderAuth = emptyWebhookHeaderAuth;
    if(!mo.apiWebHook.authentication) selectedWebhookAuthMethodId = EWebhookAuthMethodSelectIdNone.NONE;
    else if(mo.apiWebHook.authentication.authMethod) selectedWebhookAuthMethodId = mo.apiWebHook.authentication.authMethod;
    else throw new Error(`${logName}: mo.apiWebHook.authentication.authMethod is undefined`);
    
    switch (selectedWebhookAuthMethodId) {
      case EWebhookAuthMethodSelectIdNone.NONE:
        break;
      case WebHookBasicAuth.authMethod.BASIC:
        if(!mo.apiWebHook.authentication) throw new Error(`${logName}: mo.apiWebHook.authentication is undefined`);
        webhookBasicAuth = mo.apiWebHook.authentication as WebHookBasicAuth;
        break;
      case WebHookHeaderAuth.authMethod.HEADER:
        if(!mo.apiWebHook.authentication) throw new Error(`${logName}: mo.apiWebHook.authentication is undefined`);
        webhookHeaderAuth = mo.apiWebHook.authentication as WebHookHeaderAuth;
        break;
      default:
        Globals.assertNever(logName, selectedWebhookAuthMethodId);
    }

    // environment
    let webhookEnvironmentSelectItemList: TApiEntitySelectItemList;
    if(props.presetEnvSelectItem) {
      webhookEnvironmentSelectItemList = [props.presetEnvSelectItem];
    } else {
      webhookEnvironmentSelectItemList = createWebhookEnabledEnvironmentList(mo.apiAppResponse.environments, mo.webhookApiEnvironmentResponseList);      
    }
    let webhookEnvironmentName: CommonName;
    if(props.action === EAction.EDIT) {
      if(!mo.apiWebHook.environments) throw new Error(`${logName}: mo.apiWebHook.environments is undefined`);
      if(mo.apiWebHook.environments.length !== 1) throw new Error(`${logName}: mo.apiWebHook.environments.length !== 1`);
      webhookEnvironmentName = mo.apiWebHook.environments[0];
    } else {
      webhookEnvironmentName = webhookEnvironmentSelectItemList[0].id;
    }
    let apTrustedCNList: TAPTrustedCNList = [];
    if(mo.apiWebHook.tlsOptions && mo.apiWebHook.tlsOptions.tlsTrustedCommonNames) apTrustedCNList = mo.apiWebHook.tlsOptions.tlsTrustedCommonNames;

    const mofd: TManagedObjectFormData = {
      protocol: protocol,
      host: host,
      port: port,
      resource: resource,
      selectedWebhookAuthMethodId: selectedWebhookAuthMethodId,
      webhookBasicAuth: webhookBasicAuth,
      webhookHeaderAuth: webhookHeaderAuth,
      httpMethod: mo.apiWebHook.method,
      deliveryMode: mo.apiWebHook.mode,
      environmentSelectItemList: webhookEnvironmentSelectItemList,
      selectedEnvironmentName: webhookEnvironmentName,
      apTrustedCNList: apTrustedCNList
    }
    // console.log(`${logName}: mofd=${JSON.stringify(mofd, null, 2)}`);
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
      environments: [formData.selectedEnvironmentName]
    }
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    const new_mo: TManagedObject = {
      apiWebHook: apiWebHook,
      apSynthId: 'dummy',
      webhookApiEnvironmentResponseList: [],
      apiAppResponse: managedObject.apiAppResponse
    }
    return new_mo;
  }

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);

  // * Api Calls *
  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP, `update webhooks for app: ${props.viewManagedAppWebhookList.appDisplayName}`);
    try { 
      await AppsService.updateDeveloperApp({
        organizationName: props.organizationId, 
        developerUsername: props.userId, 
        appName: props.viewManagedAppWebhookList.appId, 
        requestBody: transformManagedObjectToUpdateApiObject(mo)
      });
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
      if(!props.viewManagedWebhook) throw new Error(`${logName}: action=${props.action} - one or more props undefined, props=${JSON.stringify(props)}`);
      setManagedObject(props.viewManagedWebhook);
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
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP) {
        props.onNewSuccess(apiCallStatus);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP) {
        props.onEditSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (formData: TManagedObjectFormData) => {
    const funcName = 'doPopulateManagedObjectFormDataValues';
    const logName = `${componentName}.${funcName}()`;
    managedObjectUseForm.setValue('protocol', formData.protocol);
    managedObjectUseForm.setValue('host', formData.host);
    managedObjectUseForm.setValue('port', formData.port);
    managedObjectUseForm.setValue('resource', formData.resource);
    managedObjectUseForm.setValue('httpMethod', formData.httpMethod);
    managedObjectUseForm.setValue('deliveryMode', formData.deliveryMode);
    // auth
    managedObjectUseForm.setValue('selectedWebhookAuthMethodId', formData.selectedWebhookAuthMethodId);
    managedObjectUseForm.setValue('webhookBasicAuth', formData.webhookBasicAuth);
    managedObjectUseForm.setValue('webhookHeaderAuth', formData.webhookHeaderAuth);
    // env
    managedObjectUseForm.setValue('selectedEnvironmentName', formData.selectedEnvironmentName);  
    // trusted CNs
    // managedObjectUseForm.setValue('apTrustedCNList', formData.apTrustedCNList);
  }

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: managedObject = ${JSON.stringify(managedObject, null, 2)}`);
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (formData: TManagedObjectFormData) => {
    setIsFormSubmitted(true);
    doSubmitManagedObject(transformFormDataToManagedObject(formData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    setIsFormSubmitted(true);
  }

  const displayManagedObjectFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const displayManagedObjectFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    const getSubmitButtonLabel = (): string => {
      if (props.action === EAction.NEW) return 'Create';
      else return 'Save';
    }
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button form={formId} type="submit" label={getSubmitButtonLabel()} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectFormWebhookBasicAuth = () => {
    return (
      <div className="p-ml-4">
        {/* username */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="webhookBasicAuth.username"
              control={managedObjectUseForm.control}
              rules={APConnectorFormValidationRules.WebhookBasicAuth_Username()}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
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
              rules={APConnectorFormValidationRules.WebhookBasicAuth_Password()}
              render={( { field, fieldState }) => {
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
            <label htmlFor="webhookBasicAuth.password" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.webhookBasicAuth?.password })}>Password*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.webhookBasicAuth?.password)}
        </div>
      </div>
    );
  }

  const renderManagedObjectFormWebhookHeaderAuth = () => {
    return (
      <div className="p-ml-4">
        {/* header name */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="webhookHeaderAuth.headerName"
              control={managedObjectUseForm.control}
              rules={APConnectorFormValidationRules.WebhookHeaderAuth_HeaderName()}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
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
              rules={APConnectorFormValidationRules.WebhookHeaderAuth_HeaderValue()}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
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
    const funcName = 'renderManagedObjectFormWebhookAuthMethodDetails';
    const logName = `${componentName}.${funcName}()`;
    switch (webhookAuthMethodSelectId) {
      case EWebhookAuthMethodSelectIdNone.NONE:
        return (<></>);
      case WebHookBasicAuth.authMethod.BASIC:
        return renderManagedObjectFormWebhookBasicAuth();
      case WebHookHeaderAuth.authMethod.HEADER:
        return renderManagedObjectFormWebhookHeaderAuth(); 
      default:
        Globals.assertNever(logName, webhookAuthMethodSelectId);
    }
  }

  const renderManageTrustedCNs = (): JSX.Element => {
    const funcName = 'renderManageTrustedCNs';
    const logName = `${componentName}.${funcName}()`;

    const onTrustedCNListUpdate = (trustedCNList: TAPTrustedCNList) => {
      const funcName = 'onTrustedCNListUpdate';
      const logName = `${componentName}.${funcName}()`;
      alert(`${logName}: trustedCNList=${JSON.stringify(trustedCNList, null, 2)}`);
      if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
      managedObjectFormData.apTrustedCNList = trustedCNList;
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
    const funcName = 'renderManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    const isNew: boolean = (props.action === EAction.NEW);
    
    const validateResource = (resource: string): any => {
      if(resource === '') return "Enter resource.";
      const dummyBase = "http://wh.acme.com";
      try {
        // const dummyUrl: URL = new URL(resource, dummyBase);
        // return `dummyUrl=${dummyUrl.toString()}`;
        new URL(resource, dummyBase);
        return true;
      } catch (e: any) {
        return e.message;
      }
    }

    const selectedWebhookAuthMethodId: TWebhookAuthMethodSelectId = managedObjectUseForm.watch('selectedWebhookAuthMethodId');
     return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* environments */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="selectedEnvironmentName"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose an Environment."
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={managedObjectFormData?.environmentSelectItemList} 
                          optionLabel="displayName"
                          optionValue="id"
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}             
                          // disabled={managedObjectFormData?.environmentSelectItemList.length === 1}      
                        />                        
                  )}}
                />
                <label htmlFor="selectedEnvironmentName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.selectedEnvironmentName })}>Environment*</label>
              </span>
              { displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.selectedEnvironmentName) }
            </div>
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
                  rules={APSOpenApiFormValidationRules.APSHost_ValidationRules()}
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
              TODO: make auth method a panel?
            </div>
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
                          onChange={(e) => { field.onChange(e.value) }}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                  )}}
                />
                <label htmlFor="selectedWebhookAuthMethodId" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.selectedWebhookAuthMethodId })}>Authentication Method*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.selectedWebhookAuthMethodId)}
            </div>

            {/* auth details */}
            { selectedWebhookAuthMethodId && renderManagedObjectFormWebhookAuthMethodDetails(selectedWebhookAuthMethodId) }
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

  return (
    <div className="apd-manage-user-apps">

      { props.action === EAction.NEW && <APComponentHeader header={`Create New Webhook for App: ${props.viewManagedAppWebhookList.appDisplayName}`} /> }

      { props.action === EAction.EDIT && <APComponentHeader header={`Edit Webhook for App: ${props.viewManagedAppWebhookList.appDisplayName}`} /> }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <p>TODO: environments: only show the ones without a webhook, if only 1 ==&gt; prefill, if 2 ==&gt; leave empty (createWebhookEnabledEnvironmentList)</p>
      { managedObjectFormData && renderManagedObjectForm() }

      {/* {showSelectApiProducts &&
        <DeveloperPortalUserAppSelectApiProducts 
          organizationId={props.organizationId}
          userId={props.userId}
          currentSelectedApiProductItemList={inFormCurrentMultiSelectOptionApiProductSelectItemList}
          onSave={onManagedObjectFormSelectApiProductsSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectApiProductsCancel}
          onLoadingChange={props.onLoadingChange}
        />
      }  */}

    </div>
  );
}
