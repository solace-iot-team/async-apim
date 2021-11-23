
import React, { memo } from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';

import { 
  AdministrationService, 
  CloudToken, 
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
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageOrganizationsCommon";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";
import { Globals } from "../../../utils/Globals";
import { Dropdown } from "primereact/dropdown";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewOrganizationProps {
  action: EAction,
  organizationId?: TManagedObjectId;
  organizationDisplayName?: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newUserId: TManagedObjectId, newDisplayName: string) => void;
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

  enum EAPServiceIntegrationType {
    SELECT = 'Select ...',
    SOLACE_CLOUD = 'Solace Cloud Services',
    CUSTOM = 'Custom Services'
  }

  type TAPCustomServiceIntegration = {
    sempv2Authentication: SempV2Authentication;
    baseUrlStr: string;
  }

  type TAPOrganizationManagedObject = {
    apiObject: Organization;
    serviceIntegrationType: EAPServiceIntegrationType;
    solaceCloudServiceIntegration: CustomCloudEndpoint;
    customServiceIntegration: TAPCustomServiceIntegration;
    eventPortalIntegration: CustomCloudEndpoint;
  };

  // enum EAPOrganizationType {
  //   SELECT = 'Select ...',
  //   SOLACE_CLOUD_SINGLE_TOKEN = 'Solace Cloud Single Token',
  //   SOLACE_CLOUD_COMPOSITE_TOKEN = 'Solace Cloud Composite Token',
  //   CUSTOM_SERVICE = 'Custom Service'
  // }

  const CDefaultSolaceCloudBaseUrlStr: string = 'https://api.solace.cloud/api/v0';
  const CDefaultEventPortalBaseUrlStr: string = 'https://api.solace.cloud/api/v0/eventPortal';

  type TUpdateApiObject = Organization;
  type TCreateApiObject = Organization;
  type TGetApiObject = Organization;
  type TManagedObject = TAPOrganizationManagedObject;
  type TManagedObjectFormData = {
    // here: all the fields user manages in the Form ...    
    name: CommonName;
    selectedServiceIntegrationType: EAPServiceIntegrationType;
    selectedServiceIntegration_SolaceCloud: CustomCloudEndpoint;
    selectedServiceIntegration_Custom: TAPCustomServiceIntegration;
    selectedEventPortalIntegration: CustomCloudEndpoint;
    // singleSolaceCloudToken: string;
    // compositeCloudTokens: {
    //   solaceCloudServices: CustomCloudEndpoint;
    //   solaceEventPortal: CustomCloudEndpoint;  
    // }
  };

  const emptyManagedObject: TManagedObject = {
    serviceIntegrationType: EAPServiceIntegrationType.SELECT,
    solaceCloudServiceIntegration: {
      baseUrl: CDefaultSolaceCloudBaseUrlStr,
      token: ''
    },
    customServiceIntegration: {
      baseUrlStr: '',
      sempv2Authentication: {
        authType: SempV2Authentication.authType.APIKEY,
        apiKeyLocation: SempV2Authentication.apiKeyLocation.HEADER,
        apiKeyName: 'apiKey'
      }
    },
    eventPortalIntegration: {
      baseUrl: CDefaultEventPortalBaseUrlStr,
      token: ''
    },
    apiObject: {
      name: '',
      "cloud-token": ''
    }
  }

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;

  const transformGetApiObjectToManagedObject = (apiObject: TGetApiObject): TManagedObject => {
    const funcName = 'transformGetApiObjectToManagedObject';
    const logName = `${componentName}.${funcName}()`;
    // service integration type 
    let _serviceIntegrationType: EAPServiceIntegrationType = emptyManagedObject.serviceIntegrationType;
    let _solaceCloudServiceIntegration: CustomCloudEndpoint = emptyManagedObject.solaceCloudServiceIntegration;
    let _eventPortalIntegration: CustomCloudEndpoint = emptyManagedObject.eventPortalIntegration;
    let _customServiceIntegration: TAPCustomServiceIntegration = emptyManagedObject.customServiceIntegration;
    if(apiObject["cloud-token"]) {
      _serviceIntegrationType = EAPServiceIntegrationType.SOLACE_CLOUD;
      if( typeof apiObject["cloud-token"] === 'string' ) {
        _solaceCloudServiceIntegration = {
          baseUrl: CDefaultSolaceCloudBaseUrlStr,
          token: apiObject['cloud-token']
        };
      }
      else if(typeof apiObject["cloud-token"] === 'object') {
        if(apiObject['cloud-token'].cloud) {
          _solaceCloudServiceIntegration = apiObject['cloud-token'].cloud;          
        }
        if(apiObject['cloud-token'].eventPortal) {
          _eventPortalIntegration = apiObject['cloud-token'].eventPortal;
        }

      }
    }
    if(apiObject.sempV2Authentication) {
      _serviceIntegrationType = EAPServiceIntegrationType.CUSTOM;
      if(typeof apiObject['cloud-token'] !== 'object') throw new Error(`${logName}: typeof apiObject['cloud-token'] !== 'object'`);
      if(!apiObject["cloud-token"].cloud) throw new Error(`${logName}: apiObject["cloud-token"].cloud is undefined`);
      _customServiceIntegration = {
        baseUrlStr: apiObject["cloud-token"].cloud.baseUrl,
        sempv2Authentication: apiObject.sempV2Authentication
      }
    }
    return { 
      apiObject: apiObject,
      serviceIntegrationType: _serviceIntegrationType,
      solaceCloudServiceIntegration: _solaceCloudServiceIntegration,
      customServiceIntegration: _customServiceIntegration,
      eventPortalIntegration: _eventPortalIntegration
    }
  }

  const transformManagedObjectToUpdateApiObject = (mo: TManagedObject): TUpdateApiObject => {
    return mo.apiObject;
  }

  const transformManagedObjectToCreateApiObject = (mo: TManagedObject): TCreateApiObject => {
    return mo.apiObject;
  }

  const transformManagedObjectToFormData = (mo: TManagedObject): TManagedObjectFormData => {
    const funcName = 'transformManagedObjectToFormData';
    const logName = `${componentName}.${funcName}()`;
    console.log(`${logName}: mo = ${JSON.stringify(mo, null, 2)}`);
    const formData: TManagedObjectFormData = {
      name: mo.apiObject.name,
      selectedServiceIntegrationType: mo.serviceIntegrationType,
      selectedServiceIntegration_SolaceCloud: mo.solaceCloudServiceIntegration,
      selectedServiceIntegration_Custom: mo.customServiceIntegration,
      selectedEventPortalIntegration: mo.eventPortalIntegration
    }
    return formData;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const funcName = 'transformFormDataToManagedObject';
    const logName = `${componentName}.${funcName}()`;
    console.log(`${logName}: formData = ${JSON.stringify(formData, null, 2)}`);

    throw new Error(`${logName}: continue here`);
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
  }

  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: TManagedObjectId, managedObjectDisplayName: string): Promise<TApiCallState> => {
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

  const apiUpdateManagedObject = async(managedObjectId: TManagedObjectId, managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION, `update organization: ${managedObject.apiObject.name}`);
    try { 
      await AdministrationService.updateOrganization({
        organizationName: managedObjectId, 
        requestBody: transformManagedObjectToUpdateApiObject(managedObject)
      });
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_ORGANIZATION, `create organization: ${managedObject.apiObject.name}`);
    try { 
      const createdApiObject: Organization = await AdministrationService.createOrganization({
        requestBody: transformManagedObjectToCreateApiObject(managedObject)
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
    const funcName = 'doPopulateManagedObjectFormDataValues';
    const logName = `${componentName}.${funcName}()`;
    throw new Error(`${logName}: continue here`);

    // managedObjectUseForm.setValue('managedObject.apiObject.name', mofd.managedObject.apiObject.name);
    // managedObjectUseForm.setValue('selectedOrganizationType', mofd.selectedOrganizationType);
    // managedObjectUseForm.setValue('singleSolaceCloudToken', mofd.singleSolaceCloudToken);
    // managedObjectUseForm.setValue('compositeCloudTokens.solaceCloudServices.baseUrl', mofd.compositeCloudTokens.solaceCloudServices.baseUrl);
    // managedObjectUseForm.setValue('compositeCloudTokens.solaceCloudServices.token', mofd.compositeCloudTokens.solaceCloudServices.token);
    // managedObjectUseForm.setValue('compositeCloudTokens.solaceEventPortal.baseUrl', mofd.compositeCloudTokens.solaceEventPortal.baseUrl);
    // managedObjectUseForm.setValue('compositeCloudTokens.solaceEventPortal.token', mofd.compositeCloudTokens.solaceEventPortal.token);
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(managedObject);
    else if(props.action === EAction.EDIT) {
      if(!props.organizationId) throw new Error(`${logName}: props.organizationId is undefined`);
      await apiUpdateManagedObject(props.organizationId, managedObject);
    } else {
      throw new Error(`${logName}: unknown action: ${props.action}`);
    }
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (managedObjectFormData: TManagedObjectFormData) => {
    doSubmitManagedObject(transformFormDataToManagedObject(managedObjectFormData));
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

  // const displayManagedObjectFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
  //   let _fieldError: any = fieldErrorList;
  //   return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  // }

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

  // const renderManagedObjectFormCompositeToken = (organizationType: EAPOrganizationType) => {
  //   const isActive: boolean = (organizationType === EAPOrganizationType.COMPOSITE_CLOUD_TOKENS);
  //   return (
  //     <div className="p-ml-4" >
  //     {/* <div className="p-ml-4" hidden={!isActive}> */}
  //       {/* <div>compositeCloudTokens:</div>
  //       <pre style={ { fontSize: '10px' }} >
  //         {JSON.stringify(managedObjectUseForm.getValues('compositeCloudTokens'), null, 2)}
  //       </pre> */}
  //       {/* Solace Cloud base url */}
  //       <div className="p-field">
  //         <span>Solace Cloud (Services):</span>
  //       </div>
  //       <div className="p-field">
  //         <span className="p-float-label">
  //           <Controller
  //             name="compositeCloudTokens.solaceCloudServices.baseUrl"
  //             control={managedObjectUseForm.control}
  //             rules={isActive && APConnectorFormValidationRules.Organization_Url()}
  //             render={( { field, fieldState }) => {
  //                 // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
  //                 return(
  //                   <InputText
  //                     id={field.name}
  //                     {...field}
  //                     className={classNames({ 'p-invalid': fieldState.invalid })}                    
  //                     disabled={!isActive}                  
  //                   />
  //             )}}
  //           />
  //           <label htmlFor="compositeCloudTokens.solaceCloudServices.baseUrl" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.compositeCloudTokens?.solaceCloudServices?.baseUrl })}>Solace Cloud Base URL*</label>
  //         </span>
  //         {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.compositeCloudTokens?.solaceCloudServices?.baseUrl)}
  //       </div>
  //       {/* Solace Cloud Token Service Discovery */}
  //       <div className="p-field">
  //         <span className="p-float-label">
  //           <Controller
  //             name="compositeCloudTokens.solaceCloudServices.token"
  //             control={managedObjectUseForm.control}
  //             // rules={isActive && APConnectorFormValidationRules.Organization_Token('Enter Solace Cloud Token (Services).')}
  //             rules={APConnectorFormValidationRules.Organization_Token('Enter Solace Cloud Token (Services).', isActive)}
  //             render={( { field, fieldState }) => {
  //                 // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
  //                 return(
  //                   <InputTextarea
  //                     id={field.name}
  //                     {...field}
  //                     className={classNames({ 'p-invalid': fieldState.invalid })}                    
  //                     disabled={!isActive}                  
  //                   />
  //             )}}
  //           />
  //           <label htmlFor="compositeCloudTokens.solaceCloudServices.token" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.compositeCloudTokens?.solaceCloudServices?.token })}>Solace Cloud Token*</label>
  //         </span>
  //         {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.compositeCloudTokens?.solaceCloudServices?.token)}
  //       </div>
  //       {/* Event Portal base url */}
  //       <div className="p-field">
  //         <span>Event Portal:</span>
  //       </div>
  //       <div className="p-field">
  //         <span className="p-float-label">
  //           <Controller
  //             name="compositeCloudTokens.solaceEventPortal.baseUrl"
  //             control={managedObjectUseForm.control}
  //             rules={isActive && APConnectorFormValidationRules.Organization_Url()}
  //             render={( { field, fieldState }) => {
  //                 // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
  //                 return(
  //                   <InputText
  //                     id={field.name}
  //                     {...field}
  //                     className={classNames({ 'p-invalid': fieldState.invalid })}              
  //                     disabled={!isActive}                  
  //                   />
  //               )}}
  //           />
  //           <label htmlFor="compositeCloudTokens.solaceEventPortal.baseUrl" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.compositeCloudTokens?.solaceEventPortal?.baseUrl })}>Event Portal Base URL*</label>
  //         </span>
  //         {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.compositeCloudTokens?.solaceEventPortal?.baseUrl)}
  //       </div>
  //       {/* Event Portal token */}
  //       <div className="p-field">
  //         <span className="p-float-label">
  //           <Controller
  //             name="compositeCloudTokens.solaceEventPortal.token"
  //             control={managedObjectUseForm.control}
  //             // rules={isActive && APConnectorFormValidationRules.Organization_Token('Enter Solace Cloud Token (Event Portal).')}
  //             rules={APConnectorFormValidationRules.Organization_Token('Enter Solace Cloud Token (Event Portal).', isActive)}
  //             render={( { field, fieldState }) => {
  //                 // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
  //                 return(
  //                   <InputTextarea
  //                     id={field.name}
  //                     {...field}
  //                     className={classNames({ 'p-invalid': fieldState.invalid })}            
  //                     disabled={!isActive}                  
  //                   />
  //             )}}
  //           />
  //           <label htmlFor="compositeCloudTokens.solaceEventPortal.token" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.compositeCloudTokens?.solaceEventPortal?.token })}>Event Portal Token*</label>
  //         </span>
  //         {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.compositeCloudTokens?.solaceEventPortal?.token)}
  //       </div>
  //     </div>
  //   );
  // }

  // const renderManagedObjectFormSingleToken = (organizationType: EAPOrganizationType) => {
  //   const isActive: boolean = (organizationType === EAPOrganizationType.SINGLE_SOLACE_CLOUD_TOKEN);
  //   return (
  //     // <div className="p-ml-4" hidden={!isActive}>
  //     <div className="p-ml-4">
  //       {/* Solace Cloud Token */}
  //       <div className="p-field">
  //         <span className="p-float-label">
  //           <Controller
  //             name="singleSolaceCloudToken"
  //             control={managedObjectUseForm.control}
  //             rules={APConnectorFormValidationRules.Organization_Token('Enter Solace Cloud Token.', isActive)}
  //             render={( { field, fieldState }) => {
  //                 console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
  //                 return(
  //                   <InputTextarea
  //                     id={field.name}
  //                     {...field}
  //                     className={classNames({ 'p-invalid': fieldState.invalid })}      
  //                     disabled={!isActive}                  
  //                   />
  //             )}}
  //           />
  //           <label htmlFor="singleSolaceCloudToken" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.singleSolaceCloudToken })}>Solace Cloud Token*</label>
  //         </span>
  //         {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.singleSolaceCloudToken)}
  //       </div>
  //     </div>
  //   );
  // }

  // const renderManagedObjectFormOrganizationDetails = (organizationType: EAPOrganizationType) => {
  const renderManagedObjectFormOrganizationDetails = () => {
    return (
      <React.Fragment>
        <p>TODO: implement me</p>
        {/* {renderManagedObjectFormSingleToken(organizationType)}
        {renderManagedObjectFormCompositeToken(organizationType)} */}
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {

    const funcName = 'renderManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    throw new Error(`${logName}: continue here`);


    // const isNew: boolean = (props.action === EAction.NEW);
    // const selectedOrganizationType: EAPOrganizationType = managedObjectUseForm.watch('selectedOrganizationType');

    // return (
    //   <div className="card">
    //     <div className="p-fluid">
    //       <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
    //         {/* name */}
    //         <div className="p-field">
    //           <span className="p-float-label p-input-icon-right">
    //             <i className="pi pi-key" />
    //             <Controller
    //               name="managedObject.apiObject.name"
    //               control={managedObjectUseForm.control}
    //               rules={APConnectorFormValidationRules.CommonName()}
    //               render={( { field, fieldState }) => {
    //                   // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
    //                   return(
    //                     <InputText
    //                       id={field.name}
    //                       {...field}
    //                       autoFocus={isNew}
    //                       disabled={!isNew}
    //                       className={classNames({ 'p-invalid': fieldState.invalid })}                       
    //                     />
    //               )}}
    //             />
    //             <label htmlFor="managedObject.apiObject.name" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.managedObject?.apiObject?.name })}>Name*</label>
    //           </span>
    //           {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.managedObject?.apiObject?.name)}
    //         </div>
    //         {/* organization Type */}
    //         <div className="p-field">
    //           <span className="p-float-label">
    //             <Controller
    //               name="selectedOrganizationType"
    //               control={managedObjectUseForm.control}
    //               rules={{
    //                 required: "Select Organization Type.",
    //               }}
    //               render={( { field, fieldState }) => {
    //                   return(
    //                     <Dropdown
    //                       id={field.name}
    //                       {...field}
    //                       options={Object.values(EAPOrganizationType)} 
    //                       // onChange={(e) => { field.onChange(e.value) }}
    //                       onChange={(e) => { 
                          
    //                         field.onChange(e.value);
    //                         managedObjectUseForm.clearErrors();
                          
    //                       }}
    //                       className={classNames({ 'p-invalid': fieldState.invalid })}                       
    //                     />                        
    //               )}}
    //             />
    //             <label htmlFor="selectedOrganizationType" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.selectedOrganizationType })}>Organization Type*</label>
    //           </span>
    //           {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.selectedOrganizationType)}
    //         </div>

    //         {/* org details */}
    //         {/* { selectedOrganizationType && managedObjectUseForm.clearErrors()} */}

    //         {/* { selectedOrganizationType && renderManagedObjectFormOrganizationDetails(selectedOrganizationType) } */}

    //         { renderManagedObjectFormOrganizationDetails(selectedOrganizationType)}

    //       </form>  
    //       {/* footer */}
    //       {renderManagedObjectFormFooter()}
    //     </div>
    //   </div>
    // );
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
