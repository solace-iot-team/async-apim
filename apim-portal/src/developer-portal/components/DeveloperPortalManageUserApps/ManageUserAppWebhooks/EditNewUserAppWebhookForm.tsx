

import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { MultiSelect } from "primereact/multiselect";

import { Globals } from "../../../../utils/Globals";
import { APSOpenApiFormValidationRules } from "../../../../utils/APSOpenApiFormValidationRules";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APAppWebhooksDisplayService, { E_APProtocol, IAPAppWebhookDisplay, TAPAppWebhookDisplayList, TAPDecomposedUri, TAPWebhookBasicAuth, TAPWebhookHeaderAuth } from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import { 
  WebHook, 
  WebHookAuth, 
  WebHookBasicAuth, 
  WebHookHeaderAuth 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { EWebhookAuthMethodSelectId, EWebhookAuthMethodSelectIdNone, E_CALL_STATE_ACTIONS, TWebhookAuthMethodSelectId } from "./ManageUserAppWebhooksCommon";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import APEntityIdsService from "../../../../utils/APEntityIdsService";
import { TAPAppEnvironmentDisplayList } from "../../../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import { EditNewWebhookAuthFormFields } from "./EditNewWebhookAuthFormFields";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}

export type TManagedObjectFormData = {
  id: string;
  protocol: E_APProtocol;
  host: string;
  port: number;
  resource: string;
  httpMethod: WebHook.method;
  deliveryMode: WebHook.mode;
  selectedWebhookAuthMethodId: TWebhookAuthMethodSelectId;
  webhookBasicAuth: TAPWebhookBasicAuth;
  webhookHeaderAuth: TAPWebhookHeaderAuth;

  // environmentSelectEntityIdList: TAPEntityIdList;
  selectedEnvironmentIdList: Array<string>;

//   apTrustedCNList: TAPTrustedCNList;
};
export type TManagedObjectFormDataEnvelope = {
  formData: TManagedObjectFormData;
}



export interface IEditNewUserAppWebhookFormProps {
  organizationId: string;
  apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  available_ApAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  action: EAction;
  formId: string;
  apAppWebhookDisplay: IAPAppWebhookDisplay;
  onSubmit: (apAppWebhookDisplay: IAPAppWebhookDisplay) => void;
  onError: (apiCallState: TApiCallState) => void;
  // onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewUserAppWebhookForm: React.FC<IEditNewUserAppWebhookFormProps> = (props: IEditNewUserAppWebhookFormProps) => {
  const ComponentName = 'EditNewUserAppWebhookForm';

  type TManagedObject = IAPAppWebhookDisplay;

  const isNewManagedObject = (): boolean => {
    return props.action === EAction.NEW;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const decomposedUri: TAPDecomposedUri = APAppWebhooksDisplayService.get_decomposedUri(mo.apWebhookUri);
    let authMethodId: TWebhookAuthMethodSelectId = EWebhookAuthMethodSelectIdNone.NONE;
    let webhookBasicAuth: WebHookBasicAuth = APAppWebhooksDisplayService.create_Empty_ApWebhookBasicAuth();
    let webhookHeaderAuth: WebHookHeaderAuth = APAppWebhooksDisplayService.create_Empty_ApWebhookHeaderAuth();
    if(mo.apWebhookBasicAuth !== undefined) {
      authMethodId = WebHookBasicAuth.authMethod.BASIC;
      webhookBasicAuth = mo.apWebhookBasicAuth;
    } else if(mo.apWebhookHeaderAuth !== undefined) {
      authMethodId = WebHookHeaderAuth.authMethod.HEADER;
      webhookHeaderAuth = mo.apWebhookHeaderAuth;
    }
    const fd: TManagedObjectFormData = {
      ...decomposedUri,
      id: mo.apEntityId.id,
      httpMethod: mo.apWebhookMethod,
      deliveryMode: mo.apWebhookMode,
      selectedWebhookAuthMethodId: authMethodId,
      webhookBasicAuth: webhookBasicAuth,
      webhookHeaderAuth: webhookHeaderAuth,
      selectedEnvironmentIdList: APEntityIdsService.create_IdList_From_ApDisplayObjectList(mo.apAppEnvironmentDisplayList),
    };
    return {
      formData: fd 
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const create_WebhookAuth = (formData: TManagedObjectFormData): WebHookAuth | undefined => {
      const funcName = 'create_WebhookAuth';
      const logName = `${ComponentName}.${funcName}()`;

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

    const mo: TManagedObject = props.apAppWebhookDisplay;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apEntityId = {
      id: fd.id,
      displayName: fd.id
    };
    mo.apWebhookUri = APAppWebhooksDisplayService.get_composedUri({
      protocol: fd.protocol,
      host: fd.host,
      port: fd.port,
      resource: fd.resource
    });
    mo.apWebhookMethod = fd.httpMethod;
    mo.apWebhookMode = fd.deliveryMode;
    mo.apWebhookBasicAuth = create_WebhookAuth(fd) as WebHookBasicAuth | undefined;
    mo.apWebhookHeaderAuth = create_WebhookAuth(fd) as WebHookHeaderAuth | undefined;
    mo.apAppEnvironmentDisplayList = APEntityIdsService.create_ApDisplayObjectList_FilteredBy_IdList({
      apDisplayObjectList: props.available_ApAppEnvironmentDisplayList,
      filterByIdList: fd.selectedEnvironmentIdList
    });
    return mo;
  }

  const [managedObject] = React.useState<TManagedObject>(props.apAppWebhookDisplay);  
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // * Api Calls *

  const apiCheck_WebhookIdExists = async(webhookId: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_WebhookIdExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_WEBHOOK_ID_EXISTS, `check webhook exists: ${webhookId}`);
    try { 
      const exists: boolean = await APAppWebhooksDisplayService.apiCheck_AppWebhookId_Exists({
        organizationId: props.organizationId,
        appId: props.apDeveloperPortalUserAppDisplay.apEntityId.id,
        apAppMeta: props.apDeveloperPortalUserAppDisplay.apAppMeta,
        webhookId: webhookId
      });
      // test error handling
      // throw new Error(`${logName}: test error handling`);
      return exists;
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    } 
    setApiCallStatus(callState);
    return undefined;
  }

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

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  // const renderManageTrustedCNs = (): JSX.Element => {
  //   const funcName = 'renderManageTrustedCNs';
  //   const logName = `${componentName}.${funcName}()`;

  //   const onTrustedCNListUpdate = (trustedCNList: TAPTrustedCNList) => {
  //     const funcName = 'onTrustedCNListUpdate';
  //     const logName = `${componentName}.${funcName}()`;
  //     // alert(`${logName}: trustedCNList=${JSON.stringify(trustedCNList, null, 2)}`);
  //     if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
  //     const newMofd: TManagedObjectFormData = {
  //       ...managedObjectFormData,
  //       apTrustedCNList: trustedCNList
  //     }
  //     // console.log(`${logName}: newMofd = ${JSON.stringify(newMofd, null, 2)}`);
  //     setManagedObjectFormData(newMofd);
  //   }
  
  //   const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
  //     const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
  //     const className = `${options.className} p-jc-start`;
  //     const titleClassName = `${options.titleClassName} p-pl-1`;
  //     return (
  //       <div className={className} style={{ justifyContent: 'left'}} >
  //         <button className={options.togglerClassName} onClick={options.onTogglerClick}>
  //           <span className={toggleIcon}></span>
  //         </button>
  //         <span className={titleClassName}>
  //           {`Certificate Trusted Common Names (${trustedCNList.length})`}
  //         </span>
  //       </div>
  //     );
  //   }
  //   // main
  //   if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
  //   const trustedCNList: TAPTrustedCNList = managedObjectFormData.apTrustedCNList;
  //   return (  
  //     <React.Fragment>
  //       <Panel 
  //         headerTemplate={panelHeaderTemplate} 
  //         toggleable={true}
  //         // collapsed={trustedCNList.length === 0}
  //         collapsed={true}
  //       >
  //         <React.Fragment>
  //           {/* <div className="p-field" style={{ width: '96%' }} >
  //             help text
  //           </div> */}
  //           <APManageTrustedCNs
  //             formId={componentName+'_APManageTrustedCNs'}
  //             trustedCNList={trustedCNList}
  //             // presetTrustedCN={what?}
  //             onChange={onTrustedCNListUpdate}
  //           />
  //         </React.Fragment>
  //       </Panel>
  //     </React.Fragment>
  //   );
  // }

  const renderManagedObjectForm_WebhookAuthMethodDetails = (webhookAuthMethodSelectId: TWebhookAuthMethodSelectId): JSX.Element => {
    return(
      <EditNewWebhookAuthFormFields
        managedObjectUseForm={managedObjectUseForm}
        webhookAuthMethodSelectId={webhookAuthMethodSelectId}
      />
    );
  }

  const validate_Id = async(id: string): Promise<string | boolean> => {
    if(props.action !== EAction.NEW) return true;
    // check if id exists
    const checkResult: boolean | undefined = await apiCheck_WebhookIdExists(id);
    if(checkResult === undefined) return false;
    if(checkResult) return 'Webhook Id already exists, choose a unique Id.';
    return true;
  }

  const validate_Resource = (resource: string): any => {
    if(resource === '') return "Enter resource.";
    const dummyBase = "http://wh.acme.com";
    try {
      new URL(resource, dummyBase);
      return true;
    } catch (e: any) {
      return e.message;
    }
  }

  const renderManagedObjectForm = () => {
    const isNewObject: boolean = isNewManagedObject();
    const selectedWebhookAuthMethodId: TWebhookAuthMethodSelectId = managedObjectUseForm.watch('formData.selectedWebhookAuthMethodId');
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* Name / Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.id"
                  rules={{
                    ...APConnectorFormValidationRules.CommonName(),
                    validate: validate_Id
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus={false}
                        // disabled={!isNewObject}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.id })}>Name*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.id)}
            </div>
            {/* environments */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.selectedEnvironmentIdList"
                  rules={{
                    required: "Choose at least 1 Environment."
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(props.available_ApAppEnvironmentDisplayList)} 
                          // onChange={(e) => { field.onChange(e.value); onEnvironmentsSelect(e.value); }}
                          onChange={(e) => { field.onChange(e.value); }}
                          optionLabel={APEntityIdsService.nameOf('displayName')}
                          optionValue={APEntityIdsService.nameOf('id')}
                          // style={{width: '500px'}} 
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.selectedEnvironmentIdList })}>Environment(s)*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.formData?.selectedEnvironmentIdList)}
             </div> 
            {/* protocol */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.protocol"
                  rules={{
                    required: "Select protocol.",
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <Dropdown
                        id={field.name}
                        {...field}
                        options={Object.values(E_APProtocol)} 
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />                        
                    )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.protocol })}>Protocol*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.protocol)}
            </div>
            {/* host */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.host"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.host })}>Host*</label>
                {/* <small id="host-help">Example: webhooks.acme.com.</small>    */}
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.host)}
            </div>
            {/* Port */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.port"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.port })}>Port*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.port)}
            </div>
            {/* resource */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.resource"
                  rules={{
                    validate: validate_Resource
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.resource })}>Resource*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.resource)}
            </div>
            {/* httpMethod */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.httpMethod"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.httpMethod })}>HTTP Method*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.httpMethod)}
            </div>
            {/* deliveryMode */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.deliveryMode"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.deliveryMode })}>Delivery Mode*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.deliveryMode)}
            </div>

            {/* auth method */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.selectedWebhookAuthMethodId"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.selectedWebhookAuthMethodId })}>Authentication Method*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.selectedWebhookAuthMethodId)}
            </div>
            {/* auth details */}
            { renderManagedObjectForm_WebhookAuthMethodDetails(selectedWebhookAuthMethodId) }
          </form>  
            
          {/* trusted CNs Form */}
          {/* <div className="p-field">
            { renderManageTrustedCNs() }
          </div> */}
          
        </div>
      </div>
    );
  }

  return (
    <div className="apd-manage-user-apps">

      { renderManagedObjectForm() }

    </div>
  );
}
