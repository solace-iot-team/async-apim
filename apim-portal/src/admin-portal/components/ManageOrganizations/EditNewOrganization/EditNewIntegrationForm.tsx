
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { DisplaySectionHeader_NotificationHub, EAction } from "../ManageOrganizationsCommon";
import { IAPSingleOrganizationDisplay_Integration } from "../../../../displayServices/APOrganizationsDisplayService/APSingleOrganizationDisplayService";
import { IAPSystemOrganizationDisplay_Integration } from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { 
  EAPNotificationHubAuthType, 
  EAPNotificationHubAuthType_Form_Select, 
  TAPNotificationHubAuth, 
  TAPNotificationHubConfig, 
  TAPNotificationHub_ApiKeyAuth, 
  TAPNotificationHub_BasicAuth, 
  TAPNotificationHub_BearerTokenAuth, 
  TAPNotificationHub_Undefined
} from "../../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";
import { APIKeyAuthentication } from "@solace-iot-team/apim-connector-openapi-browser";
import { Globals } from "../../../../utils/Globals";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IEditNewIntegrationFormProps {
  action: EAction;
  apOrganizationDisplay_Integration: IAPSingleOrganizationDisplay_Integration | IAPSystemOrganizationDisplay_Integration;
  formId: string;
  onSubmit: (apOrganizationDisplay_Connectivity: IAPSingleOrganizationDisplay_Integration | IAPSystemOrganizationDisplay_Integration) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewIntegrationForm: React.FC<IEditNewIntegrationFormProps> = (props: IEditNewIntegrationFormProps) => {
  const ComponentName = 'EditNewIntegrationForm';

  type TManagedObject = IAPSingleOrganizationDisplay_Integration | IAPSystemOrganizationDisplay_Integration;

  type TManageObjectFormData_NotificationHub = {
    baseUrl: string;
    apAuthType: EAPNotificationHubAuthType;
    apNotificationHub_Undefined: TAPNotificationHub_Undefined;
    apNotificationHub_BasicAuth: TAPNotificationHub_BasicAuth;
    apNotificationHub_ApiKeyAuth: TAPNotificationHub_ApiKeyAuth;
    apNotificationHub_BearerTokenAuth: TAPNotificationHub_BearerTokenAuth;
  }

  type TManagedObjectFormData = {
    notificationHub: TManageObjectFormData_NotificationHub;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const isNewManagedObject = (): boolean => {
    return props.action === EAction.NEW;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const funcName = 'transform_ManagedObject_To_FormDataEnvelope';
    const logName = `${ComponentName}.${funcName}()`;
    // DEBUG
    // alert(`${logName}: check console for logging...`);
    // console.log(`${logName}: mo=${JSON.stringify(mo, null, 2)}`);
    
    // preset everything with empty values for form
    const notificationHubFormData: TManageObjectFormData_NotificationHub = {
      baseUrl: '',
      apAuthType: EAPNotificationHubAuthType.BASIC_AUTH,
      apNotificationHub_Undefined: {
        apAuthType: EAPNotificationHubAuthType.UNDEFINED
      },
      apNotificationHub_ApiKeyAuth: {
        apAuthType: EAPNotificationHubAuthType.API_KEY_AUTH,
        apiKeyFieldName: '',
        apiKeyLocation: APIKeyAuthentication.location.HEADER,
        apiKeyValue: ''
      },
      apNotificationHub_BasicAuth: {
        apAuthType: EAPNotificationHubAuthType.BASIC_AUTH,
        username: '',
        password: ''
      },
      apNotificationHub_BearerTokenAuth: {
        apAuthType: EAPNotificationHubAuthType.BEARER_TOKEN_AUTH,
        token: ''
      }
    };
    if(mo.apNotificationHubConfig !== undefined) {
      const apAuthType: EAPNotificationHubAuthType = mo.apNotificationHubConfig.apNotificationHubAuth.apAuthType;
      notificationHubFormData.apAuthType = apAuthType;
      notificationHubFormData.baseUrl = mo.apNotificationHubConfig.baseUrl;
      switch(apAuthType) {
        case EAPNotificationHubAuthType.BEARER_TOKEN_AUTH:
          notificationHubFormData.apNotificationHub_BearerTokenAuth = mo.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_BearerTokenAuth;
          break;
        case EAPNotificationHubAuthType.API_KEY_AUTH:
          notificationHubFormData.apNotificationHub_ApiKeyAuth = mo.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_ApiKeyAuth;
          break;
        case EAPNotificationHubAuthType.BASIC_AUTH:
          notificationHubFormData.apNotificationHub_BasicAuth = mo.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_BasicAuth;
          break;
        case EAPNotificationHubAuthType.UNDEFINED:
          notificationHubFormData.apAuthType = apAuthType;
          notificationHubFormData.apNotificationHub_BasicAuth = mo.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_BasicAuth;
          break;
        default:
          Globals.assertNever(logName, apAuthType);
      }
    }
    const fd: TManagedObjectFormData = {
      notificationHub: notificationHubFormData
    };
    // DEBUG
    // alert(`${logName}: check console for logging...`);
    // console.log(`${logName}: fd=${JSON.stringify(fd, null, 2)}`);
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const funcName = 'transform_ManagedObject_To_FormDataEnvelope';
    const logName = `${ComponentName}.${funcName}()`;

    const mo: TManagedObject = props.apOrganizationDisplay_Integration;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    const notificationHubFormData: TManageObjectFormData_NotificationHub = fd.notificationHub;
    let apNotificationHubAuth: TAPNotificationHubAuth | undefined = undefined;
    switch(notificationHubFormData.apAuthType) {
      case EAPNotificationHubAuthType.API_KEY_AUTH:
        apNotificationHubAuth = notificationHubFormData.apNotificationHub_ApiKeyAuth;
        break;
      case EAPNotificationHubAuthType.BASIC_AUTH:
        apNotificationHubAuth = notificationHubFormData.apNotificationHub_BasicAuth;
        break;
      case EAPNotificationHubAuthType.BEARER_TOKEN_AUTH:
        apNotificationHubAuth = notificationHubFormData.apNotificationHub_BearerTokenAuth;
        break;
      case EAPNotificationHubAuthType.UNDEFINED:
        throw new Error(`${logName}: unable to handle notificationHubFormData.apAuthType=${notificationHubFormData.apAuthType}`);
      default:
        Globals.assertNever(logName, notificationHubFormData.apAuthType);                  
    }
    if(apNotificationHubAuth === undefined) throw new Error(`${logName}: apNotificationHubAuth === undefined`);
    const apNotificationHubConfig: TAPNotificationHubConfig = {
      baseUrl: notificationHubFormData.baseUrl,
      apNotificationHubAuth: apNotificationHubAuth
    }
    mo.apNotificationHubConfig = apNotificationHubConfig;
    // DEBUG
    // alert(`${logName}: check console for logging...`);
    // console.log(`${logName}: mo=${JSON.stringify(mo, null, 2)}`);
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apOrganizationDisplay_Integration);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  const doInitialize = async () => {
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) {
      managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
      // must set the watched elements directly, otherwise it won't trigger properly
      managedObjectUseForm.setValue('formData.notificationHub.apAuthType', managedObjectFormDataEnvelope.formData.notificationHub.apAuthType);
    }
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

  const renderBasicAuth = (apAuthType: EAPNotificationHubAuthType) => {
    const isActive: boolean = (apAuthType === EAPNotificationHubAuthType.BASIC_AUTH);
    return (
      <div className="p-ml-2" hidden={!isActive}>
        {/* username */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.notificationHub.apNotificationHub_BasicAuth.username"
              rules={APConnectorFormValidationRules.Notifier_BasicAuthentication_Username(isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />
                );
              }}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_BasicAuth?.username })}>Username*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_BasicAuth?.username)}
        </div>
        {/* password */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.notificationHub.apNotificationHub_BasicAuth.password"
              rules={APConnectorFormValidationRules.Notifier_BasicAuthentication_Password(isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />
                );
              }}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_BasicAuth?.password })}>Password*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_BasicAuth?.password)}
        </div>
      </div>
    );
  }

  const renderApiKeyAuth = (apAuthType: EAPNotificationHubAuthType) => {
    const isActive: boolean = (apAuthType === EAPNotificationHubAuthType.API_KEY_AUTH);
    return (
      <div className="p-ml-2" hidden={!isActive}>
        {/* apiKeyLocation */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.notificationHub.apNotificationHub_ApiKeyAuth.apiKeyLocation"
              rules={{
                required: "Select API Key Location.",
              }}
              render={( { field, fieldState }) => {
                return(
                  <Dropdown
                    id={field.name}
                    {...field}
                    options={Object.values(APIKeyAuthentication.location)} 
                    onChange={(e) => { field.onChange(e.value); }}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />                        
                  );
              }}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_ApiKeyAuth?.apiKeyLocation })}>API Key Location*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_ApiKeyAuth?.apiKeyLocation)}
        </div>
        {/* apiKeyFieldName */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.notificationHub.apNotificationHub_ApiKeyAuth.apiKeyFieldName"
              rules={APConnectorFormValidationRules.Notifier_ApiKeyAuthentication_ApiKeyFieldName(isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />
                );
              }}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_ApiKeyAuth?.apiKeyFieldName })}>API Key Name*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_ApiKeyAuth?.apiKeyFieldName)}
        </div>
        {/* apiKeyValue */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.notificationHub.apNotificationHub_ApiKeyAuth.apiKeyValue"
              rules={APConnectorFormValidationRules.Notifier_ApiKeyAuthentication_ApiKeyValue(isActive)}
              render={( { field, fieldState }) => {
                return(
                  <InputText
                    id={field.name}
                    {...field}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />
                );
              }}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_ApiKeyAuth?.apiKeyValue })}>API Key Value*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_ApiKeyAuth?.apiKeyValue)}
        </div>
      </div>
    );
  }

  const renderBearerToken = (apAuthType: EAPNotificationHubAuthType) => {
    const isActive: boolean = (apAuthType === EAPNotificationHubAuthType.BEARER_TOKEN_AUTH);
    return (
      <div className="p-ml-2" hidden={!isActive}>
        {/* token */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.notificationHub.apNotificationHub_BearerTokenAuth.token"
              rules={APConnectorFormValidationRules.Notifier_BearerTokenAuthentication_Token(isActive)}
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
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_BearerTokenAuth?.token })}>Bearer Token*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.notificationHub?.apNotificationHub_BearerTokenAuth?.token)}
        </div>
      </div>
    );
  }

  const renderAuthTypeDetails = (apAuthType: EAPNotificationHubAuthType) => {
    return(
      <React.Fragment>
        { renderBasicAuth(apAuthType) }
        { renderApiKeyAuth(apAuthType) }
        { renderBearerToken(apAuthType) }
      </React.Fragment>
    );
  }

  const renderNotificationHubForm = () => {
    const apAuthType: EAPNotificationHubAuthType = managedObjectUseForm.watch('formData.notificationHub.apAuthType');
    return (
      <React.Fragment>
        <div className="p-mb-4 ap-display-component-header">{DisplaySectionHeader_NotificationHub}:</div>
        <div className="p-ml-2">
          {/* baseUrl */}
          <div className="p-field">
            <span className="p-float-label">
              <Controller
                control={managedObjectUseForm.control}
                name="formData.notificationHub.baseUrl"
                rules={APConnectorFormValidationRules.Organization_Url(true)}
                render={( { field, fieldState }) => {
                  return(
                    <InputText
                      id={field.name}
                      {...field}
                      className={classNames({ 'p-invalid': fieldState.invalid })}                       
                    />
                )}}
              />
              <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.notificationHub?.baseUrl })}>Base Url*</label>
            </span>
            {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.notificationHub?.baseUrl)}
          </div>
          {/* apAuthType */}
          <div className="p-field">
            <span className="p-float-label">
              <Controller
                control={managedObjectUseForm.control}
                name="formData.notificationHub.apAuthType"
                rules={{
                  required: "Select Auth Type.",
                }}
                render={( { field, fieldState }) => {
                  return(
                    <Dropdown
                      id={field.name}
                      {...field}
                      options={Object.values(EAPNotificationHubAuthType_Form_Select)} 
                      onChange={(e) => {                           
                        field.onChange(e.value);
                        managedObjectUseForm.clearErrors();
                      }}
                      className={classNames({ 'p-invalid': fieldState.invalid })}                       
                    />                        
                )}}
              />
              <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.notificationHub?.apAuthType })}>Auth Type*</label>
            </span>
            {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.notificationHub?.apAuthType)}
          </div>

          { renderAuthTypeDetails(apAuthType) }

        </div>
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    const isNewObject: boolean = isNewManagedObject();
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            { renderNotificationHubForm() }
          </form>  
        </div>
      </div>
    );
  }
  
  return (
    <div className="manage-organizations">

      { renderManagedObjectForm() }

    </div>
  );
}
