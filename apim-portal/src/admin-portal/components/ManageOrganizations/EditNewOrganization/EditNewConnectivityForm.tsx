
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { DisplaySectionHeader_EventPortalServices, DisplaySectionHeader_SempV2Auth, DisplaySectionHeader_SolaceCloudServices, EAction } from "../ManageOrganizationsCommon";
import { IAPSingleOrganizationDisplay_Connectivity } from "../../../../displayServices/APOrganizationsDisplayService/APSingleOrganizationDisplayService";
import { IAPSystemOrganizationDisplay_Connectivity } from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { 
  EAPCloudConnectivityConfigType,
  EAPEventPortalConnectivityConfigType,
  EAPOrganizationConnectivityConfigType, 
  EAPOrganizationSempv2AuthType, 
  TAPCloudConnectivityConfig, 
  TAPCloudConnectivityConfigCustom, 
  TAPCloudConnectivityConfigSolaceCloud, 
  TAPEventPortalConnectivityConfigCustom,
  TAPOrganizationSempv2AuthConfig_ApiKeyAuth,
  TAPOrganizationSempv2AuthConfig_BasicAuth
} from "../../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { Globals } from "../../../../utils/Globals";
import { SempV2Authentication } from "@solace-iot-team/apim-connector-openapi-browser";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IEditNewConnectivityFormProps {
  action: EAction;
  apOrganizationDisplay_Connectivity: IAPSingleOrganizationDisplay_Connectivity | IAPSystemOrganizationDisplay_Connectivity;
  formId: string;
  onSubmit: (apOrganizationDisplay_Connectivity: IAPSingleOrganizationDisplay_Connectivity | IAPSystemOrganizationDisplay_Connectivity) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewConnectivityForm: React.FC<IEditNewConnectivityFormProps> = (props: IEditNewConnectivityFormProps) => {
  const ComponentName = 'EditNewConnectivityForm';

  type TManagedObject = IAPSingleOrganizationDisplay_Connectivity | IAPSystemOrganizationDisplay_Connectivity;
  type TManagedObjectFormData = {
    configType: EAPOrganizationConnectivityConfigType;
    configSimple: {
      token: string;
    };
    configAdvanced: {
      apCloudConnectivityConfigCustom: TAPCloudConnectivityConfigCustom;
      apEventPortalConnectivityConfigCustom: TAPEventPortalConnectivityConfigCustom;
      apOrganizationSempv2AuthType: EAPOrganizationSempv2AuthType;
      apOrganzationSempv2AuthConfig_BasicAuth: TAPOrganizationSempv2AuthConfig_BasicAuth;
      apOrganzationSempv2AuthConfig_ApiKeyAuth: TAPOrganizationSempv2AuthConfig_ApiKeyAuth;
    }
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const isNewManagedObject = (): boolean => {
    return props.action === EAction.NEW;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      configType: mo.apOrganizationConnectivityConfigType,
      configSimple: {
        // never set the secrets in form
        // token: ''
        token: (mo.apCloudConnectivityConfig as TAPCloudConnectivityConfigSolaceCloud).token
      },
      configAdvanced: {
        apCloudConnectivityConfigCustom: (mo.apCloudConnectivityConfig as TAPCloudConnectivityConfigCustom),
        apEventPortalConnectivityConfigCustom: (mo.apEventPortalConnectivityConfig as TAPEventPortalConnectivityConfigCustom),
        apOrganizationSempv2AuthType: mo.apOrganizationSempv2AuthConfig.apAuthType,
        apOrganzationSempv2AuthConfig_BasicAuth: (mo.apOrganizationSempv2AuthConfig as TAPOrganizationSempv2AuthConfig_BasicAuth),
        apOrganzationSempv2AuthConfig_ApiKeyAuth: (mo.apOrganizationSempv2AuthConfig as TAPOrganizationSempv2AuthConfig_ApiKeyAuth)
      }
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const funcName = 'create_ManagedObject_From_FormEntities';
    const logName = `${ComponentName}.${funcName}()`;

    const mo: TManagedObject = props.apOrganizationDisplay_Connectivity;    
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apOrganizationConnectivityConfigType = fd.configType;
    switch(fd.configType) {
      case EAPOrganizationConnectivityConfigType.SIMPLE:
        const apCloudConnectivityConfig: TAPCloudConnectivityConfigSolaceCloud = {
          configType: EAPCloudConnectivityConfigType.SOLACE_CLOUD,
          token: fd.configSimple.token
        };
        mo.apCloudConnectivityConfig = apCloudConnectivityConfig;
        break;
      case EAPOrganizationConnectivityConfigType.ADVANCED:
        const apCloudConnectivityConfigCustom: TAPCloudConnectivityConfigCustom = {
          configType: EAPCloudConnectivityConfigType.CUSTOM,
          baseUrl: fd.configAdvanced.apCloudConnectivityConfigCustom.baseUrl,
          token: fd.configAdvanced.apCloudConnectivityConfigCustom.token
        };
        const apEventPortalConnectivityConfigCustom: TAPEventPortalConnectivityConfigCustom = {
          configType: EAPEventPortalConnectivityConfigType.CUSTOM,
          baseUrl: fd.configAdvanced.apCloudConnectivityConfigCustom.baseUrl,
          token: fd.configAdvanced.apCloudConnectivityConfigCustom.token
        };
        let apOrganizationSempv2AuthConfig: TAPOrganizationSempv2AuthConfig_ApiKeyAuth | TAPOrganizationSempv2AuthConfig_BasicAuth = mo.apOrganizationSempv2AuthConfig;
        switch(fd.configAdvanced.apOrganizationSempv2AuthType) {
          case EAPOrganizationSempv2AuthType.BASIC_AUTH:
            const apOrganizationSempv2AuthConfig_BasicAuth: TAPOrganizationSempv2AuthConfig_BasicAuth = {
              apAuthType: EAPOrganizationSempv2AuthType.BASIC_AUTH,
            };
            apOrganizationSempv2AuthConfig = apOrganizationSempv2AuthConfig_BasicAuth;
            break;
          case EAPOrganizationSempv2AuthType.API_KEY:
            const apOrganizationSempv2AuthConfig_ApiKeyAuth: TAPOrganizationSempv2AuthConfig_ApiKeyAuth = {
              apAuthType: EAPOrganizationSempv2AuthType.API_KEY,
              apiKeyLocation: fd.configAdvanced.apOrganzationSempv2AuthConfig_ApiKeyAuth.apiKeyLocation,
              apiKeyName: fd.configAdvanced.apOrganzationSempv2AuthConfig_ApiKeyAuth.apiKeyName
            };
            apOrganizationSempv2AuthConfig = apOrganizationSempv2AuthConfig_ApiKeyAuth;
            break;
          default:
            Globals.assertNever(logName, fd.configAdvanced.apOrganizationSempv2AuthType);
        }
        mo.apCloudConnectivityConfig = apCloudConnectivityConfigCustom;
        mo.apEventPortalConnectivityConfig = apEventPortalConnectivityConfigCustom;
        mo.apOrganizationSempv2AuthConfig = apOrganizationSempv2AuthConfig;
        break;
      default:
        Globals.assertNever(logName, fd.configType);
    }
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apOrganizationDisplay_Connectivity);
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
      managedObjectUseForm.setValue('formData.configType', managedObjectFormDataEnvelope.formData.configType);
      managedObjectUseForm.setValue('formData.configAdvanced.apOrganizationSempv2AuthType', managedObjectFormDataEnvelope.formData.configAdvanced.apOrganizationSempv2AuthType);
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

  const renderEventPortalCustomFields = (isActive: boolean) => {
    return (
      <React.Fragment>
        {/* baseUrl */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.configAdvanced.apEventPortalConnectivityConfigCustom.baseUrl"
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
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configAdvanced?.apEventPortalConnectivityConfigCustom?.baseUrl })}>Base Url*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.configAdvanced?.apEventPortalConnectivityConfigCustom?.baseUrl)}
        </div>
        {/* token */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.configAdvanced.apEventPortalConnectivityConfigCustom.token"
              rules={APConnectorFormValidationRules.Organization_Token(true, 'Enter Event Portal Token.', isActive)}
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
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configAdvanced?.apEventPortalConnectivityConfigCustom?.token })}>Event Portal Token*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.configAdvanced?.apEventPortalConnectivityConfigCustom?.token)}
        </div>
      </React.Fragment>        
    );
  }

  const renderSolaceCloudCustomFields = (isActive: boolean) => {
    return (
      <React.Fragment>
        {/* baseUrl */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.configAdvanced.apCloudConnectivityConfigCustom.baseUrl"
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
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configAdvanced?.apCloudConnectivityConfigCustom?.baseUrl })}>Base Url*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.configAdvanced?.apCloudConnectivityConfigCustom?.baseUrl)}
        </div>
        {/* token */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.configAdvanced.apCloudConnectivityConfigCustom.token"
              rules={APConnectorFormValidationRules.Organization_Token(true, 'Enter Solace Cloud Token.', isActive)}
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
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configAdvanced?.apCloudConnectivityConfigCustom?.token })}>Solace Cloud Token*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.configAdvanced?.apCloudConnectivityConfigCustom?.token)}
        </div>
      </React.Fragment>        
    );
  }

  const renderSempv2AuthConfigFields = (sempv2AuthType: EAPOrganizationSempv2AuthType, isActive: boolean) => {
    // const isBasicAuthActive: boolean = (sempv2AuthType === EAPOrganizationSempv2AuthType.BASIC_AUTH) && isActive;
    const isApiKeyActive: boolean = (sempv2AuthType === EAPOrganizationSempv2AuthType.API_KEY) && isActive;
    return (
      <React.Fragment>
        
        {/* nothing to render for isBasicAuthActive */}

        <div className="p-ml-2" hidden={!isApiKeyActive}>
          <div className="p-mb-4 ap-display-sub-component-header">Api Key Details:</div>

          {/* apiKeyLocation */}
          <div className="p-field">
            <span className="p-float-label">
              <Controller
                control={managedObjectUseForm.control}
                name="formData.configAdvanced.apOrganzationSempv2AuthConfig_ApiKeyAuth.apiKeyLocation"
                rules={APConnectorFormValidationRules.isRequired('Select Api Key Location.',isApiKeyActive)}
                render={( { field, fieldState }) => {
                  return(
                    <Dropdown
                      id={field.name}
                      {...field}
                      options={Object.values(SempV2Authentication.apiKeyLocation)} 
                      onChange={(e) => {                           
                        field.onChange(e.value);
                        managedObjectUseForm.clearErrors();
                      }}
                      className={classNames({ 'p-invalid': fieldState.invalid })}                       
                    />                        
                  );
                }}
              />
              <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configAdvanced?.apOrganzationSempv2AuthConfig_ApiKeyAuth?.apiKeyLocation })}>API Key Location*</label>
            </span>
            {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.configAdvanced?.apOrganzationSempv2AuthConfig_ApiKeyAuth?.apiKeyLocation)}
          </div>
          {/* apiKeyName */}
          <div className="p-field">
            <span className="p-float-label">
              <Controller
                control={managedObjectUseForm.control}
                name="formData.configAdvanced.apOrganzationSempv2AuthConfig_ApiKeyAuth.apiKeyName"
                rules={APConnectorFormValidationRules.Organization_ApiKeyName(isActive)}
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
              <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configAdvanced?.apOrganzationSempv2AuthConfig_ApiKeyAuth?.apiKeyName })}>API Key Name*</label>
            </span>
            {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.configAdvanced?.apOrganzationSempv2AuthConfig_ApiKeyAuth?.apiKeyName)}
          </div>
        </div>
      </React.Fragment>
    );
  }

  const renderSempv2AuthFields = (isActive: boolean) => {
    const sempv2AuthType: EAPOrganizationSempv2AuthType = managedObjectUseForm.watch('formData.configAdvanced.apOrganizationSempv2AuthType');
    return (
      <React.Fragment>
        {/* authType */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.configAdvanced.apOrganizationSempv2AuthType"
              rules={APConnectorFormValidationRules.isRequired('Select a SempV2 Auth Type.',isActive)}
              render={( { field, fieldState }) => {
                return(
                  <Dropdown
                    id={field.name}
                    {...field}
                    options={Object.values(EAPOrganizationSempv2AuthType)} 
                    onChange={(e) => {                           
                      field.onChange(e.value);
                      managedObjectUseForm.clearErrors();
                    }}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />                        
                );
              }}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configAdvanced?.apOrganizationSempv2AuthType })}>SempV2 Auth Type*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.configAdvanced?.apOrganizationSempv2AuthType)}
        </div>

        { renderSempv2AuthConfigFields(sempv2AuthType, isActive)}

      </React.Fragment>        
    );
  }

  const renderManagedObjectFormConfigAdvanced = (configType: EAPOrganizationConnectivityConfigType) => {
    const isActive: boolean = (configType === EAPOrganizationConnectivityConfigType.ADVANCED);
    return (
      <div className="p-ml-2" hidden={!isActive}>
        <div className="p-mb-4 ap-display-component-header">{DisplaySectionHeader_SolaceCloudServices}:</div>
        { renderSolaceCloudCustomFields(isActive) }
        <div className="p-mb-4 ap-display-component-header">{DisplaySectionHeader_EventPortalServices}:</div>
        { renderEventPortalCustomFields(isActive) }
        <div className="p-mb-4 ap-display-component-header">{DisplaySectionHeader_SempV2Auth}:</div>
        { renderSempv2AuthFields(isActive) }
      </div>
    );
  }

  const renderManagedObjectFormConfigSimple = (configType: EAPOrganizationConnectivityConfigType) => {
    const isActive: boolean = (configType === EAPOrganizationConnectivityConfigType.SIMPLE);
    return (
      <div className="p-ml-2" hidden={!isActive}>
        {/* token */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.configSimple.token"
              // rules={APConnectorFormValidationRules.Organization_Token(is_simple_solace_cloud_TokenRequired(), 'Enter Solace Cloud Token.', isActive)}
              rules={APConnectorFormValidationRules.Organization_Token(true, 'Enter Solace Cloud Token.', isActive)}
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
            {/* <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configSimple?.token })}>{isRequiredLabel(is_simple_solace_cloud_TokenRequired(), 'Solace Cloud Token')}</label> */}
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configSimple?.token })}>Solace Cloud Token*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.configSimple?.token)}
        </div>
      </div>
    );
  }

  const renderManagedObjectFormConfigDetails = (configType: EAPOrganizationConnectivityConfigType) => {
    return (
      <React.Fragment>
        {renderManagedObjectFormConfigSimple(configType)}
        {renderManagedObjectFormConfigAdvanced(configType)}
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    // const isNewObject: boolean = isNewManagedObject();
    const configType: EAPOrganizationConnectivityConfigType = managedObjectUseForm.watch('formData.configType');
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* configType */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.configType"
                  rules={{
                    required: "Select Config Type.",
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <Dropdown
                        id={field.name}
                        {...field}
                        options={Object.values(EAPOrganizationConnectivityConfigType)} 
                        onChange={(e) => {                           
                          field.onChange(e.value);
                          managedObjectUseForm.clearErrors();
                        }}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />                        
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.configType })}>Type*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.configType)}
            </div>

            { renderManagedObjectFormConfigDetails(configType)}

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
