
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";

import { 
  $CloudToken,
  AdministrationService, 
  CloudToken, 
  CommonDisplayName, 
  CommonName, 
  CustomCloudEndpoint, 
  Organization,
  SempV2Authentication
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
  TAPOrganizationConfigAdvancedServiceDiscoveryProvisioning,
  TAPOrganizationConfigEventPortal,
  TAPOrganizationConfigSimple,
  TAPReverseProxySempV2AuthenticationApiKey,
  TAPReverseProxySempV2AuthenticationBasic, 
} from "./ManageOrganizationsCommon";
import { Globals } from "../../../utils/Globals";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";
import api from "primereact/api";


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
  onEditSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewOrganziation: React.FC<IEditNewOrganizationProps> = (props: IEditNewOrganizationProps) => {
  const componentName = 'EditNewOrganziation';

  // Service Discovery & Provisioning:
  // - Solace Cloud: 
  //    - <provide cloud token>, 
  //    - provide baseUrl (default solace cloud standard)
  // - Custom: provide sempv2Authentication + solace cloud baseUrl
  // Event Portal Integration:
  // - optional entry:
  //   - base Url + token
  // - if no entry ==> copy Solace Cloud token + eventPortal base Url


  // const CDefaultSolaceCloudBaseUrlStr: string = 'https://api.solace.cloud/api/v0';
  // const CDefaultEventPortalBaseUrlStr: string = 'https://api.solace.cloud/api/v0/eventPortal';

  type TUpdateApiObject = Organization;
  type TCreateApiObject = Organization;
  type TGetApiObject = Organization;
  type TManagedObject = TAPOrganizationConfig;
  type TManagedObjectFormData = TManagedObject;
  //   // here: all the fields user manages in the Form ...    
  //   name: CommonName;
  //   selectedServiceIntegrationType: EAPServiceIntegrationType;
  //   selectedServiceIntegration_SolaceCloud: CustomCloudEndpoint;
  //   selectedServiceIntegration_Custom: TAPCustomServiceIntegration;
  //   selectedEventPortalIntegration: CustomCloudEndpoint;
  //   // singleSolaceCloudToken: string;
  //   // compositeCloudTokens: {
  //   //   solaceCloudServices: CustomCloudEndpoint;
  //   //   solaceEventPortal: CustomCloudEndpoint;  
  //   // }
  // };

  // const emptyManagedObject: TManagedObject = {
  //   name: '',
  //   configType: EAPOrganizationConfigType.SIMPLE,
  //   configSimple: {
  //     cloudToken: ''
  //   },
  //   configAdvancedServiceDiscoveryProvisioning: {
  //     bsdp_Type: EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD,
  //     bsdp_SolaceCloud: {
  //       baseUrl: CDefaultSolaceCloudBaseUrlStr,
  //       cloudToken: ''
  //     },
  //     bsdp_ReverseProxy: {
  //       baseUrl: '',
  //       token: '',
  //       sempV2AuthType: EAPReverseProxySempV2AuthType.BASIC_AUTH,
  //       sempV2AuthType_Basic: {},
  //       sempV2AuthType_ApiKey: {
  //         apiKeyLocation: EAPReverseProxySempV2ApiKeyLocation.HEADER,
  //         apiKeyName: 'apiKey'
  //       }
  //     }
  //   },
  //   configAdvancedEventPortal: {
  //     baseUrl: CDefaultEventPortalBaseUrlStr,
  //     cloudToken: ''
  //   }
  // }

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<CommonName>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<CommonDisplayName>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;

  // const _mapAPReverseProxySempv2AuthTypeToApiAuthType = (apAuthType: EAPReverseProxySempV2AuthType): SempV2Authentication.authType => {
  //   const funcName = '_mapAPReverseProxySempv2AuthTypeToApiAuthType';
  //   const logName = `${componentName}.${funcName}()`;
  //   switch (apAuthType) {
  //     case EAPReverseProxySempV2AuthType.BASIC_AUTH:
  //       return SempV2Authentication.authType.BASIC_AUTH;
  //     case EAPReverseProxySempV2AuthType.API_KEY:
  //       return SempV2Authentication.authType.APIKEY;
  //     default:
  //       Globals.assertNever(logName, apAuthType);
  //   }
  //   throw new Error(`${logName}: must never get here`);
  // }
  // const _mapApiSempv2AuthTypeToAPReverseProxySempv2AuthType = (apiAuthType: SempV2Authentication.authType): EAPReverseProxySempV2AuthType => {
  //   const funcName = '_mapApiSempv2AuthTypeToAPReverseProxySempv2AuthType';
  //   const logName = `${componentName}.${funcName}()`;
  //   switch (apiAuthType) {
  //     case SempV2Authentication.authType.BASIC_AUTH:
  //       return EAPReverseProxySempV2AuthType.BASIC_AUTH;
  //     case SempV2Authentication.authType.APIKEY:
  //       return EAPReverseProxySempV2AuthType.API_KEY;
  //     default:
  //       Globals.assertNever(logName, apiAuthType);
  //   }
  //   throw new Error(`${logName}: must never get here`);
  // }
  // const _mapAPReverseProxyApiKeyLocationToApiKeyLocation = (apKeyLocation: EAPReverseProxySempV2ApiKeyLocation): SempV2Authentication.apiKeyLocation  => {
  //   const funcName = '_mapAPReverseProxyApiKeyLocationToApiKeyLocation';
  //   const logName = `${componentName}.${funcName}()`;
  //   switch(apKeyLocation) {
  //     case EAPReverseProxySempV2ApiKeyLocation.HEADER:
  //       return SempV2Authentication.apiKeyLocation.HEADER;
  //     case EAPReverseProxySempV2ApiKeyLocation.QUERY:
  //       return SempV2Authentication.apiKeyLocation.QUERY;
  //     default:
  //       Globals.assertNever(logName, apKeyLocation);
  //   }
  //   throw new Error(`${logName}: must never get here`);
  // }
  // const _mapApiSempv2KeyLocationToAPReverseProxyApiKeyLocation = (apiKeyLocation: SempV2Authentication.apiKeyLocation): EAPReverseProxySempV2ApiKeyLocation   => {
  //   const funcName = '_mapApiSempv2KeyLocationToAPReverseProxyApiKeyLocation';
  //   const logName = `${componentName}.${funcName}()`;
  //   switch(apiKeyLocation) {
  //     case SempV2Authentication.apiKeyLocation.HEADER:
  //       return EAPReverseProxySempV2ApiKeyLocation.HEADER;
  //     case SempV2Authentication.apiKeyLocation.QUERY:
  //       return EAPReverseProxySempV2ApiKeyLocation.QUERY;
  //     default:
  //       Globals.assertNever(logName, apiKeyLocation);
  //   }
  //   throw new Error(`${logName}: must never get here`);
  // }

  const transformGetApiObjectToManagedObject = (apiObject: TGetApiObject): TManagedObject => {
    return ManageOrganizationsCommon.transformApiOrganizationToAPOrganizationConfig(apiObject);
  }

  // const transformGetApiObjectToManagedObject = (apiObject: TGetApiObject): TManagedObject => {
  //   const funcName = 'transformGetApiObjectToManagedObject';
  //   const logName = `${componentName}.${funcName}()`;

  //   if(!apiObject["cloud-token"]) throw new Error(`${logName}: apiObject["cloud-token"] is undefined`);
  //   let mo: TManagedObject = emptyManagedObject;
  //   mo.name = apiObject.name;
  //   if( typeof apiObject["cloud-token"] === 'string' ) {
  //     mo.configType = EAPOrganizationConfigType.SIMPLE;
  //     mo.configSimple = { 
  //       cloudToken: apiObject["cloud-token"]
  //     };
  //     return mo;
  //   } else if( typeof apiObject["cloud-token"] === 'object') {
  //     mo.configType = EAPOrganizationConfigType.ADVANCED;
  //     if(!apiObject['cloud-token'].cloud.token) throw new Error(`${logName}: apiObject['cloud-token'].cloud.token is undefined`);
  //     if(!apiObject['cloud-token'].eventPortal.token) throw new Error(`${logName}: apiObject['cloud-token'].eventPortal.token is undefined`);
  //     if(!apiObject.sempV2Authentication) {
  //       // Solace cloud
  //       mo.configAdvancedServiceDiscoveryProvisioning.bsdp_Type = EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD;
  //       mo.configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud = {
  //         baseUrl: apiObject['cloud-token'].cloud.baseUrl,
  //         cloudToken: apiObject['cloud-token'].cloud.token
  //       };
  //       mo.configAdvancedEventPortal = {
  //         baseUrl: apiObject['cloud-token'].eventPortal.baseUrl,
  //         cloudToken: apiObject['cloud-token'].eventPortal.token
  //       };
  //       return mo;
  //     } else {        
  //       // reverse proxy
  //       mo.configAdvancedServiceDiscoveryProvisioning.bsdp_Type = EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY;
  //       const sempV2AuthType: EAPReverseProxySempV2AuthType = _mapApiSempv2AuthTypeToAPReverseProxySempv2AuthType(apiObject.sempV2Authentication.authType);
  //       let sempV2AuthType_Basic: TAPReverseProxySempV2AuthenticationBasic = mo.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_Basic;
  //       let sempV2AuthType_ApiKey: TAPReverseProxySempV2AuthenticationApiKey = mo.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey;
  //       switch(sempV2AuthType) {
  //         case EAPReverseProxySempV2AuthType.BASIC_AUTH:
  //           sempV2AuthType_Basic = {};
  //           break;
  //         case EAPReverseProxySempV2AuthType.API_KEY:
  //           if(!apiObject.sempV2Authentication.apiKeyName) throw new Error(`${logName}: apiObject.sempV2Authentication.apiKeyName is undefined`);
  //           sempV2AuthType_ApiKey = {
  //             apiKeyLocation: _mapApiSempv2KeyLocationToAPReverseProxyApiKeyLocation(apiObject.sempV2Authentication.apiKeyLocation),
  //             apiKeyName: apiObject.sempV2Authentication.apiKeyName
  //           };
  //           break;
  //         default:
  //           Globals.assertNever(logName, sempV2AuthType);
  //       }
  //       mo.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy = {
  //         baseUrl: apiObject['cloud-token'].cloud.baseUrl,
  //         token: apiObject['cloud-token'].cloud.token,
  //         sempV2AuthType: sempV2AuthType,
  //         sempV2AuthType_Basic: sempV2AuthType_Basic,
  //         sempV2AuthType_ApiKey: sempV2AuthType_ApiKey
  //       }
  //       return mo;
  //     }
  //   } else throw new Error(`${logName}: cannot determine type of organization config from apiObject=${JSON.stringify(apiObject, null, 2)}`);
  // }

  // const _createSimple = (name: CommonName, configSimple: TAPOrganizationConfigSimple): TCreateApiObject => {
  //   const apiCreate: TCreateApiObject = {
  //     name: name,
  //     "cloud-token": configSimple.cloudToken
  //   }
  //   return apiCreate;  
  // }

  // const _createAdvanced = (name: CommonName, configAdvancedServiceDiscoveryProvisioning: TAPOrganizationConfigAdvancedServiceDiscoveryProvisioning, configAdvancedEventPortal: TAPOrganizationConfigEventPortal): TCreateApiObject => {
  //   const funcName = '_createAdvanced';
  //   const logName = `${componentName}.${funcName}()`;

  //   if(configAdvancedServiceDiscoveryProvisioning.bsdp_Type === EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD) {
  //     const ct: CloudToken = {
  //       cloud: {
  //         baseUrl: configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.baseUrl,
  //         token: configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.cloudToken
  //       },
  //       eventPortal: {
  //         baseUrl: configAdvancedEventPortal.baseUrl,
  //         token: configAdvancedEventPortal.cloudToken
  //       }
  //     };
  //     const apiCreate: TCreateApiObject = {
  //       name: name,
  //       "cloud-token": ct
  //     }
  //     return apiCreate;  
  //   } else if (configAdvancedServiceDiscoveryProvisioning.bsdp_Type === EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY) {
  //     const ct: CloudToken = {
  //       cloud: {
  //         baseUrl: configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.baseUrl,
  //         token: configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.token
  //       },
  //       eventPortal: {
  //         baseUrl: configAdvancedEventPortal.baseUrl,
  //         token: configAdvancedEventPortal.cloudToken
  //       }
  //     };
  //     const sempv2Auth: SempV2Authentication = {
  //       authType: _mapAPReverseProxySempv2AuthTypeToApiAuthType(configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType),
  //       apiKeyLocation: _mapAPReverseProxyApiKeyLocationToApiKeyLocation(configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey.apiKeyLocation),
  //       apiKeyName: configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey.apiKeyName
  //     }
  //     const apiCreate: TCreateApiObject = {
  //       name: name,
  //       "cloud-token": ct,
  //       sempV2Authentication: sempv2Auth
  //     }
  //     return apiCreate;    
  //   } else throw new Error(`${logName}: unknown configAdvancedServiceDiscoveryProvisioning.bsdp_Type=${configAdvancedServiceDiscoveryProvisioning.bsdp_Type}`);
  // }

  const transformManagedObjectToCreateApiObject = (mo: TManagedObject): TCreateApiObject => {
    return ManageOrganizationsCommon.transformAPOrganizationConfigToApiOrganization(mo);
  }

  const transformManagedObjectToUpdateApiObject = (mo: TManagedObject): TUpdateApiObject => {
    return transformManagedObjectToCreateApiObject(mo);
  }


  const transformManagedObjectToFormData = (mo: TManagedObject): TManagedObjectFormData => {
    const funcName = 'transformManagedObjectToFormData';
    const logName = `${componentName}.${funcName}()`;
    
    console.log(`${logName}: mo = ${JSON.stringify(mo, null, 2)}`);

    const formData: TManagedObjectFormData = mo;

    // const formData: TManagedObjectFormData = {
    //   name: mo.apiObject.name,
    //   selectedServiceIntegrationType: mo.serviceIntegrationType,
    //   selectedServiceIntegration_SolaceCloud: mo.solaceCloudServiceIntegration,
    //   selectedServiceIntegration_Custom: mo.customServiceIntegration,
    //   selectedEventPortalIntegration: mo.eventPortalIntegration
    // }
    return formData;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const funcName = 'transformFormDataToManagedObject';
    const logName = `${componentName}.${funcName}()`;
    console.log(`${logName}: formData = ${JSON.stringify(formData, null, 2)}`);

    const mo: TManagedObject = formData;

// continue here

    // const mo: TManagedObject = {
    //   apiObject: {
    //     ...formData.managedObject.apiObject,
    //   },
    //   organizationType: formData.selectedOrganizationType
    // }
    // // now set the correct org config
    // switch (formData.selectedOrganizationType) {
    //   case EAPOrganizationType.SELECT:
    //     throw new Error(`${logName}: formData.selectedOrganizationType === ${EAPOrganizationType.SELECT}`);
    //     break;
    //   case EAPOrganizationType.SINGLE_SOLACE_CLOUD_TOKEN:
    //     mo.apiObject["cloud-token"] = formData.singleSolaceCloudToken;
    //     break;
    //   case EAPOrganizationType.COMPOSITE_CLOUD_TOKENS:
    //     if(!formData.compositeCloudTokens) throw new Error(`${logName}: formData.compositeCloudTokensis undefined`);
    //     mo.apiObject["cloud-token"] = {
    //       cloud: formData.compositeCloudTokens.solaceCloudServices,
    //       eventPortal: formData.compositeCloudTokens.solaceEventPortal
    //     }
    //     break;
    //   default:
    //     Globals.assertNever(logName, formData.selectedOrganizationType);
    // }
    // return mo;

    // return {
    //   ...formData,
    //   apiObject: {
    //     ...formData.apiObject,
    //     "cloud-token": formData.solaceCloudToken
    //   }
    // }
    return mo;
  }

  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: CommonName, managedObjectDisplayName: CommonDisplayName): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve details for organization: ${managedObjectDisplayName}`);
    try { 
      const apiOrganization: Organization = await AdministrationService.getOrganization({
        organizationName: managedObjectId
      });      
      setManagedObject(transformGetApiObjectToManagedObject(apiOrganization));
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
      await AdministrationService.updateOrganization({
        organizationName: managedObjectId, 
        requestBody: transformManagedObjectToUpdateApiObject(mo)
      });
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
      const createdApiObject: Organization = await AdministrationService.createOrganization({
        requestBody: transformManagedObjectToCreateApiObject(mo)
      });
      setCreatedManagedObjectId(createdApiObject.name);
      setCreatedManagedObjectDisplayName(createdApiObject.name);      
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
        props.onEditSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (mofd: TManagedObjectFormData) => {
    // const funcName = 'doPopulateManagedObjectFormDataValues';
    // const logName = `${componentName}.${funcName}()`;
    // throw new Error(`${logName}: continue here`);

    managedObjectUseForm.setValue('name', mofd.name);
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
    // const funcName = 'onInvalidSubmitManagedObjectForm';
    // const logName = `${componentName}.${funcName}()`;
    // alert(`invalid form ...`);
    // console.log(`${logName}: managedObjectUseForm.formState.errors.singleSolaceCloudToken = ${JSON.stringify(managedObjectUseForm.formState.errors.singleSolaceCloudToken, null, 2)}`);
    // managedObjectUseForm.formState.errors.singleSolaceCloudToken
    // setIsFormSubmitted(true);
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
    const isActive: boolean = (reverseProxyAuthType === EAPReverseProxySempV2AuthType.BASIC_AUTH);
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
              rules={APConnectorFormValidationRules.Organization_Token('Enter Reverse Proxy Token.', isActive)}
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
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.token" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_ReverseProxy?.token })}>Reverse Proxy Token*</label>
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
              rules={APConnectorFormValidationRules.Organization_Token('Enter Solace Cloud Token.', isActive)}
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
            <label htmlFor="configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.cloudToken" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedServiceDiscoveryProvisioning?.bsdp_SolaceCloud?.cloudToken })}>Solace Cloud Token*</label>
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
              rules={APConnectorFormValidationRules.Organization_Token('Enter Event Portal Token.', isActive)}
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
            <label htmlFor="configAdvancedEventPortal.cloudToken" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configAdvancedEventPortal?.cloudToken })}>Event Portal Token*</label>
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
              rules={APConnectorFormValidationRules.Organization_Token('Enter Solace Cloud Token.', isActive)}
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
            <label htmlFor="configSimple.cloudToken" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.configSimple?.cloudToken })}>Solace Cloud Token*</label>
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
