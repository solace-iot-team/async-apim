
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";

import { 
  AdministrationService, 
  CommonDisplayName, 
  CommonName, 
  Organization,
} from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APConnectorFormValidationRules } from '../../../utils/APConnectorOpenApiFormValidationRules';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  EAPBrokerServiceDiscoveryProvisioningType, 
  EAPOrganizationConfigType, 
  EAPReverseProxySempV2ApiKeyLocation, 
  EAPReverseProxySempV2AuthType, 
  E_CALL_STATE_ACTIONS, 
  ManageOrganizationsCommon, 
  TAPOrganizationConfig,
} from "./ManageOrganizationsCommon";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";
import { APOrganizationsService, TAPOrganization } from "../../../utils/APOrganizationsService";
import { APSOpenApiFormValidationRules } from "../../../utils/APSOpenApiFormValidationRules";
import { Globals } from "../../../utils/Globals";


export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewOrganizationProps {
  action: EAction,
  organizationId?: CommonName;
  organizationDisplayName?: CommonDisplayName;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newId: CommonName, newDisplayName: CommonDisplayName) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName: CommonDisplayName) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewOrganziation: React.FC<IEditNewOrganizationProps> = (props: IEditNewOrganizationProps) => {
  const componentName = 'EditNewOrganziation';

  type TUpdateApiObject = TAPOrganization;
  type TCreateApiObject = TAPOrganization;
  type TGetApiObject = TAPOrganization;
  type TManagedObject = TAPOrganizationConfig;
  type TManagedObjectFormData = TManagedObject;

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<CommonName>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<CommonDisplayName>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<CommonDisplayName>();
  const [originalMaskedManagedObject, setOriginalMaskedManagedObject] = React.useState<TManagedObject>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;

  const transformGetAPObjectToManagedObject = (apObject: TGetApiObject): TManagedObject => {
    return ManageOrganizationsCommon.transformAPOrganizationToAPOrganizationConfig(apObject);
  }

  const transformManagedObjectToCreateApiObject = (mo: TManagedObject): TCreateApiObject => {
    return ManageOrganizationsCommon.transformAPOrganizationConfigToAPOrganization(mo);
  }

  const transformManagedObjectToUpdateApiObject = (mo: TManagedObject): TUpdateApiObject => {
    const apOrganization: TAPOrganization = ManageOrganizationsCommon.transformAPOrganizationConfigToAPOrganization(mo);
    if(apOrganization["cloud-token"] !== undefined) {
      if(apOrganization["cloud-token"] === '') delete apOrganization["cloud-token"];
      else if(typeof apOrganization["cloud-token"] !== 'string') {
        if(apOrganization["cloud-token"].cloud.token === '') delete apOrganization["cloud-token"].cloud.token;
        if(apOrganization["cloud-token"].eventPortal.token === '') delete apOrganization["cloud-token"].eventPortal.token;
      }
    }
    return apOrganization;
  }

  const transformManagedObjectToFormData = (mo: TManagedObject): TManagedObjectFormData => {
    const formData: TManagedObjectFormData = mo;
    return formData;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const mo: TManagedObject = formData;
    return mo;
  }

  const is_bspType_TokenRequired = (bspType: EAPBrokerServiceDiscoveryProvisioningType): boolean => {
    const funcName = 'is_bspType_TokenRequired';
    const logName = `${componentName}.${funcName}()`;
    if(props.action === EAction.NEW) return true;
    if(originalMaskedManagedObject === undefined) throw new Error(`${logName}: originalMaskedManagedObject is undefined`);
    switch(bspType) {
      case EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY:
        return originalMaskedManagedObject.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.token === undefined || originalMaskedManagedObject.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.token === '';
      case EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD:
        return originalMaskedManagedObject.configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.cloudToken === undefined || originalMaskedManagedObject.configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.cloudToken === '';
      default:
        Globals.assertNever(logName, bspType);
    }
    return true;
  }

  const is_advanced_EventPortal_TokenRequired = (): boolean => {
    const funcName = 'is_advanced_EventPortal_TokenRequired';
    const logName = `${componentName}.${funcName}()`;
    if(props.action === EAction.NEW) return true;
    if(originalMaskedManagedObject === undefined) throw new Error(`${logName}: originalMaskedManagedObject is undefined`);
    return originalMaskedManagedObject.configAdvancedEventPortal.cloudToken === undefined || originalMaskedManagedObject.configAdvancedEventPortal.cloudToken === '';
  }

  const is_simple_solace_cloud_TokenRequired = (): boolean => {
    const funcName = 'is_simple_solace_cloud_TokenRequired';
    const logName = `${componentName}.${funcName}()`;
    if(props.action === EAction.NEW) return true;
    if(originalMaskedManagedObject === undefined) throw new Error(`${logName}: originalMaskedManagedObject is undefined`);
    return originalMaskedManagedObject.configSimple.cloudToken === undefined || originalMaskedManagedObject.configSimple.cloudToken === '';
  }
  const isRequiredLabel = (isRequired: boolean, label: string): string => {
    if(isRequired) return `${label}*`;
    return label;
  }

  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: CommonName, managedObjectDisplayName: CommonDisplayName): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve details for organization: ${managedObjectDisplayName}`);
    try { 
      const maskedApOrganization: TAPOrganization = await APOrganizationsService.getOrganization(managedObjectId);
      setOriginalMaskedManagedObject(transformGetAPObjectToManagedObject(maskedApOrganization));
      const apOrganization: TAPOrganization = {
        ...APOrganizationsService.maskSecrets(maskedApOrganization, ''),
        displayName: maskedApOrganization.displayName
      }
      setManagedObject(transformGetAPObjectToManagedObject(apOrganization));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(managedObjectId: CommonName, mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION, `update organization: ${mo.name}`);
    try { 
      const apOrganization: TAPOrganization = await APOrganizationsService.updateOrganization({
        organizationId: managedObjectId,
        requestBody: transformManagedObjectToUpdateApiObject(mo)
      });
      setUpdatedManagedObjectDisplayName(apOrganization.displayName);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_ORGANIZATION, `create organization: ${mo.name}`);
    try { 
      const createdApOrganization: TAPOrganization = await APOrganizationsService.createOrganization({
        requestBody: transformManagedObjectToCreateApiObject(mo)
      });
      setCreatedManagedObjectId(createdApOrganization.name);
      setCreatedManagedObjectDisplayName(createdApOrganization.displayName);      
    } catch(e) {
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
    props.onLoadingChange(true);
    if(props.action === EAction.EDIT) {
      if(!props.organizationId) throw new Error(`${logName}: action=EDIT, props.organizationId is undefined`);
      if(!props.organizationDisplayName) throw new Error(`${logName}: action=EDIT, props.organizationDisplayName is undefined`);
      await apiGetManagedObject(props.organizationId, props.organizationDisplayName);
    } else {
      setManagedObject(ManageOrganizationsCommon.createEmptyOrganizationConfig());
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
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_ORGANIZATION) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION) {
        if(!updatedManagedObjectDisplayName) throw new Error(`${logName}: updatedManagedObjectDisplayName is undefined`);
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (mofd: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('name', mofd.name);
    managedObjectUseForm.setValue('displayName', mofd.displayName);
    managedObjectUseForm.setValue('configType', mofd.configType);
    managedObjectUseForm.setValue('configSimple', mofd.configSimple);
    managedObjectUseForm.setValue('configAdvancedServiceDiscoveryProvisioning', mofd.configAdvancedServiceDiscoveryProvisioning);
    managedObjectUseForm.setValue('configAdvancedEventPortal', mofd.configAdvancedEventPortal);
  }

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(mo);
    else if(props.action === EAction.EDIT) {
      if(!props.organizationId) throw new Error(`${logName}: props.organizationId is undefined`);
      await apiUpdateManagedObject(props.organizationId, mo);
    } else {
      throw new Error(`${logName}: unknown action: ${props.action}`);
    }
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (formData: TManagedObjectFormData) => {
    doSubmitManagedObject(transformFormDataToManagedObject(formData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
  }

  const displayManagedObjectFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
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

  const renderManagedObjectFormConfigAdvancedDetails_ReverseProxy_AuthDetails_ApiKey = (reverseProxyAuthType: EAPReverseProxySempV2AuthType) => {
    const isActive: boolean = (reverseProxyAuthType === EAPReverseProxySempV2AuthType.API_KEY);
    return (
      <div className="p-ml-2" hidden={!isActive}>
      {/* <div className="p-ml-2"> */}
        <div className="p-mb-4 ap-display-sub-component-header">
          Api Key Details:
        </div>
        {/* api key location */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey.apiKeyLocation"
              control={managedObjectUseForm.control}
              rules={{
                required: "Select Api Key Location.",
              }}
              render={( { field, fieldState }) => {
                return(
                  <Dropdown
                    id={field.name}
                    {...field}
                    options={Object.values(EAPReverseProxySempV2ApiKeyLocation)} 
                    onChange={(e) => { field.onChange(e.value) }}
                    className={classNames({ 'p-invalid': fieldState.invalid })}     
                    disabled={!isActive}                  
                  />                        
                );
              }}
            />
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey.apiKeyLocation" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.sempV2AuthType_ApiKey?.apiKeyLocation })}>Api Key Location*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.sempV2AuthType_ApiKey?.apiKeyLocation)}
        </div>
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey.apiKeyName"
              control={managedObjectUseForm.control}
              rules={APConnectorFormValidationRules.Organization_ReverseProxy_ApiKeyName(isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                    
                    disabled={!isActive}                  
                  />
                );
              }}
            />
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey.apiKeyName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.sempV2AuthType_ApiKey?.apiKeyName })}>Api Key Name*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.sempV2AuthType_ApiKey?.apiKeyName)}
        </div>
      </div>
    );
  }

  const renderManagedObjectFormConfigAdvancedDetails_ReverseProxy_AuthDetails_Basic = (reverseProxyAuthType: EAPReverseProxySempV2AuthType) => {
    // const isActive: boolean = (reverseProxyAuthType === EAPReverseProxySempV2AuthType.BASIC_AUTH);
    return ( <></> );
  }

  const renderManagedObjectFormConfigAdvancedDetails_ReverseProxy_AuthDetails = (reverseProxyAuthType: EAPReverseProxySempV2AuthType) => {
    return (
      <React.Fragment>
        {renderManagedObjectFormConfigAdvancedDetails_ReverseProxy_AuthDetails_Basic(reverseProxyAuthType)}
        {renderManagedObjectFormConfigAdvancedDetails_ReverseProxy_AuthDetails_ApiKey(reverseProxyAuthType)}
      </React.Fragment>
    );
  }

  const renderManagedObjectFormConfigAdvancedDetails_ReverseProxy = (is_active: boolean, bsdp_Type: EAPBrokerServiceDiscoveryProvisioningType) => {
    const isActive: boolean = is_active && (bsdp_Type === EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY);
    const reverseProxyAuthType: EAPReverseProxySempV2AuthType = managedObjectUseForm.watch('configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType');

    return (
      <div className="p-ml-2" hidden={!isActive}>
      {/* <div className="p-ml-2"> */}
        <div className="p-mb-4 ap-display-sub-component-header">
          Reverse Proxy:
        </div>
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.baseUrl"
              control={managedObjectUseForm.control}
              rules={APConnectorFormValidationRules.Organization_Url(isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                    
                    disabled={!isActive}                  
                  />
                );
              }}
            />
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.baseUrl" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.baseUrl })}>Reverse Proxy Base URL*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.baseUrl)}
        </div>
        {/* token */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.token"
              control={managedObjectUseForm.control}
              // rules={APConnectorFormValidationRules.Organization_Token(props.action === EAction.NEW, 'Enter Reverse Proxy Token.', isActive)}
              rules={APConnectorFormValidationRules.Organization_Token(is_bspType_TokenRequired(EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY), 'Enter Reverse Proxy Token.', isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputTextarea
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}      
                    disabled={!isActive}                  
                  />
                );
              }}
            />
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.token" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.token })}>{isRequiredLabel(is_bspType_TokenRequired(EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY), 'Reverse Proxy Token')}</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.token)}
        </div>
        {/* reverse proxy sempv2 auth type */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType"
              control={managedObjectUseForm.control}
              rules={{
                required: "Select Reverse Proxy SempV2 Auth Type.",
              }}
              render={( { field, fieldState }) => {
                return(
                  <Dropdown
                    id={field.name}
                    {...field}
                    options={Object.values(EAPReverseProxySempV2AuthType)} 
                    onChange={(e) => {                           
                      field.onChange(e.value);
                      managedObjectUseForm.clearErrors();
                    }}
                    className={classNames({ 'p-invalid': fieldState.invalid })}         
                    disabled={!isActive}                                
                  />                        
                );
              }}
            />
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.sempV2AuthType })}>Reverse Proxy Auth Type*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.sempV2AuthType)}
        </div>

        { renderManagedObjectFormConfigAdvancedDetails_ReverseProxy_AuthDetails(reverseProxyAuthType) }

      </div>
    );
  }

  const renderManagedObjectFormConfigAdvancedDetails_SolaceCloud = (is_active: boolean, bsdp_Type: EAPBrokerServiceDiscoveryProvisioningType) => {
    const isActive: boolean = is_active && (bsdp_Type === EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD);

    return (
      <div className="p-ml-2" hidden={!isActive}>
      {/* <div className="p-ml-2"> */}
        <div className="p-mb-4 ap-display-sub-component-header">
          Solace Cloud:
        </div>
        {/* Solace Cloud base url */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.baseUrl"
              control={managedObjectUseForm.control}
              rules={APConnectorFormValidationRules.Organization_Url(isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                    
                    disabled={!isActive}                  
                  />
                );
              }}
            />
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.baseUrl" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_SolaceCloud?.baseUrl })}>Solace Cloud Base URL*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_SolaceCloud?.baseUrl)}
        </div>
        {/* Solace Cloud Token */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.cloudToken"
              control={managedObjectUseForm.control}
              // rules={APConnectorFormValidationRules.Organization_Token(props.action === EAction.NEW, 'Enter Solace Cloud Token.', isActive)}
              rules={APConnectorFormValidationRules.Organization_Token(is_bspType_TokenRequired(EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD), 'Enter Solace Cloud Token.', isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputTextarea
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}      
                    disabled={!isActive}                  
                  />
                );
              }}
            />
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.cloudToken" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_SolaceCloud?.cloudToken })}>{isRequiredLabel(is_bspType_TokenRequired(EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD), 'Solace Cloud Token')}</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_SolaceCloud?.cloudToken)}
        </div>
      </div>
    );
  }

  const renderManagedObjectFormConfigAdvancedDetails_EventPortal = (isActive: boolean) => {
    return(
      <React.Fragment>
        <div className="p-mb-4 ap-display-component-header">
          Event Portal:
        </div>
        {/* event portal base url */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedEventPortal.baseUrl"
              control={managedObjectUseForm.control}
              rules={APConnectorFormValidationRules.Organization_Url(isActive, true)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                    
                    disabled={!isActive}                  
                  />
                );
              }}
            />
            <label htmlFor="configAdvancedEventPortal.baseUrl" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedEventPortal?.baseUrl })}>Event Portal Base URL*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedEventPortal?.baseUrl)}
        </div>
        {/* Event Portal Token */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedEventPortal.cloudToken"
              control={managedObjectUseForm.control}
              // rules={APConnectorFormValidationRules.Organization_Token(props.action === EAction.NEW, 'Enter Event Portal Token.', isActive)}
              rules={APConnectorFormValidationRules.Organization_Token(is_advanced_EventPortal_TokenRequired(), 'Enter Event Portal Token.', isActive)}
              
              render={( { field, fieldState }) => {
                return(
                  <InputTextarea
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}      
                    disabled={!isActive}                  
                  />
                );
              }}
            />
            <label htmlFor="configAdvancedEventPortal.cloudToken" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedEventPortal?.cloudToken })}>{isRequiredLabel(is_advanced_EventPortal_TokenRequired(), 'Event Portal Token')}</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedEventPortal?.cloudToken)}
        </div>
    </React.Fragment>    
    );
  }

  const renderManagedObjectFormConfigAdvancedDetails = (isActive: boolean, bsdp_Type: EAPBrokerServiceDiscoveryProvisioningType) => {
    return (
      <React.Fragment>
        {renderManagedObjectFormConfigAdvancedDetails_SolaceCloud(isActive, bsdp_Type)}
        {renderManagedObjectFormConfigAdvancedDetails_ReverseProxy(isActive, bsdp_Type)}
        {renderManagedObjectFormConfigAdvancedDetails_EventPortal(isActive)}
      </React.Fragment>
    );
  }

  const renderManagedObjectFormConfigAdvanced = (configType: EAPOrganizationConfigType) => {
    const isActive: boolean = (configType === EAPOrganizationConfigType.ADVANCED);
    const bsdp_Type: EAPBrokerServiceDiscoveryProvisioningType = managedObjectUseForm.watch('configAdvancedServiceDiscoveryProvisioning.bsdp_Type');
    return (
      <div className="p-ml-2" hidden={!isActive}>
      {/* <div className="p-ml-2"> */}
        <div className="p-mb-4 ap-display-component-header">
          Broker Gateway Service Discovery &amp; Provisioning:
        </div>
        {/* service discovery & provisioning type */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configAdvancedServiceDiscoveryProvisioning.bsdp_Type"
              control={managedObjectUseForm.control}
              rules={{
                required: "Select Type.",
              }}
              render={( { field, fieldState }) => {
                return(
                  <Dropdown
                    id={field.name}
                    {...field}
                    options={Object.values(EAPBrokerServiceDiscoveryProvisioningType)} 
                    onChange={(e) => {                           
                      field.onChange(e.value);
                      managedObjectUseForm.clearErrors();
                    }}
                    className={classNames({ 'p-invalid': fieldState.invalid })}         
                    disabled={!isActive}              
                  />                        
                );
              }}
            />
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_Type" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_Type })}>Type*</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_Type)}
        </div>

        { renderManagedObjectFormConfigAdvancedDetails(isActive, bsdp_Type) }

      </div>
    );
  }

  const renderManagedObjectFormConfigSimple = (configType: EAPOrganizationConfigType) => {
    const isActive: boolean = (configType === EAPOrganizationConfigType.SIMPLE);
    return (
      <div className="p-ml-2" hidden={!isActive}>
      {/* <div className="p-ml-2"> */}
        {/* Solace Cloud Token */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              name="configSimple.cloudToken"
              control={managedObjectUseForm.control}
              // rules={APConnectorFormValidationRules.Organization_Token(props.action === EAction.NEW, 'Enter Solace Cloud Token.', isActive)}
              rules={APConnectorFormValidationRules.Organization_Token(is_simple_solace_cloud_TokenRequired(), 'Enter Solace Cloud Token.', isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputTextarea
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}      
                    disabled={!isActive}                  
                  />
                );
              }}
            />
            <label htmlFor="configSimple.cloudToken" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configSimple?.cloudToken })}>{isRequiredLabel(is_simple_solace_cloud_TokenRequired(), 'Solace Cloud Token')}</label>
          </span>
          {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configSimple?.cloudToken)}
        </div>
      </div>
    );
  }

  const renderManagedObjectFormConfigDetails = (configType: EAPOrganizationConfigType) => {
    return (
      <React.Fragment>
        {renderManagedObjectFormConfigSimple(configType)}
        {renderManagedObjectFormConfigAdvanced(configType)}
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    const isNew: boolean = (props.action === EAction.NEW);
    const configType: EAPOrganizationConfigType = managedObjectUseForm.watch('configType');
    return (
      <div className="card">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* name */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="name"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.CommonName()}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={isNew}
                          disabled={!isNew}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="name" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.name })}>Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.name)}
            </div>
            {/* Display Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="displayName"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSDisplayName('Enter display name.', true)}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={!isNew}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.displayName)}
            </div>
            {/* config Type */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="configType"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select Config Type.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={Object.values(EAPOrganizationConfigType)} 
                          onChange={(e) => {                           
                            field.onChange(e.value);
                            managedObjectUseForm.clearErrors();
                          }}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                  )}}
                />
                <label htmlFor="configType" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configType })}>Configuration Type*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.configType)}
            </div>

            { renderManagedObjectFormConfigDetails(configType)}

          </form>  
          {/* footer */}
          {renderManagedObjectFormFooter()}
        </div>
      </div>
    );
  }
  
  return (
    <div className="manage-organizations">

      {props.action === EAction.NEW && 
        <APComponentHeader header='Create Organization' />
      }

      {props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit Organization: ${props.organizationDisplayName}`} />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject &&
        renderManagedObjectForm()
      }
    </div>
  );
}
