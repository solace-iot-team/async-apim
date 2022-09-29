
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Checkbox } from "primereact/checkbox";
import { classNames } from 'primereact/utils';
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { DisplaySectionHeader_ApiProducts, DisplaySectionHeader_Apps, DisplaySectionHeader_AssetManagement, DisplaySectionHeader_ServiceRegistry, EAction, E_CALL_STATE_ACTIONS } from "../ManageOrganizationsCommon";
import { IAPSingleOrganizationDisplay_General } from "../../../../displayServices/APOrganizationsDisplayService/APSingleOrganizationDisplayService";
import { IAPSystemOrganizationDisplay_General } from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import APOrganizationsDisplayService from "../../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";
import { APSOpenApiFormValidationRules } from "../../../../utils/APSOpenApiFormValidationRules";
import { APSAssetIncVersionStrategy } from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { ServiceRegistryType } from "@solace-iot-team/apim-connector-openapi-browser";
import { ConfigHelper } from "../../../../components/APContextProviders/ConfigContextProvider/ConfigHelper";
import { ConfigContext } from "../../../../components/APContextProviders/ConfigContextProvider/ConfigContextProvider";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IEditNewGeneralFormProps {
  action: EAction;
  apOrganizationDisplay_General: IAPSingleOrganizationDisplay_General | IAPSystemOrganizationDisplay_General;
  formId: string;
  onSubmit: (apOrganizationDisplay_General: IAPSingleOrganizationDisplay_General | IAPSystemOrganizationDisplay_General) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewGeneralForm: React.FC<IEditNewGeneralFormProps> = (props: IEditNewGeneralFormProps) => {
  const ComponentName = 'EditNewGeneralForm';

  type TManagedObject = IAPSingleOrganizationDisplay_General | IAPSystemOrganizationDisplay_General;
  type TManagedObjectFormData = {
    id: string;
    displayName: string;

    serviceRegistryType: ServiceRegistryType;

    assetIncVersionStrategy: APSAssetIncVersionStrategy;

    is_Configured_MaxNumEnvs_Per_ApiProduct: boolean;
    maxNumEnvs_Per_ApiProduct: number;

    is_Configured_MaxNumApis_Per_ApiProduct: boolean;
    maxNumApis_Per_ApiProduct: number;
    
    is_Configured_AppCredentialsExpiryDays: boolean;
    appCredentialsExpiryDays: number;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const isNewManagedObject = (): boolean => {
    return props.action === EAction.NEW;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      id: mo.apEntityId.id,
      displayName: mo.apEntityId.displayName,

      serviceRegistryType: mo.apServiceRegistry,

      assetIncVersionStrategy: mo.apAssetIncVersionStrategy,

      is_Configured_MaxNumEnvs_Per_ApiProduct: mo.apMaxNumEnvs_Per_ApiProduct > APOrganizationsDisplayService.get_DefaultMaxNumEnvs_Per_ApiProduct(),
      maxNumEnvs_Per_ApiProduct: mo.apMaxNumEnvs_Per_ApiProduct,

      is_Configured_MaxNumApis_Per_ApiProduct: mo.apMaxNumApis_Per_ApiProduct > APOrganizationsDisplayService.get_DefaultMaxNumApis_Per_ApiProduct(),
      maxNumApis_Per_ApiProduct: mo.apMaxNumApis_Per_ApiProduct,

      is_Configured_AppCredentialsExpiryDays: mo.apAppCredentialsExpiryDuration_millis > APOrganizationsDisplayService.get_DefaultAppCredentialsExpiryDuration_Millis(),
      appCredentialsExpiryDays: mo.apAppCredentialsExpiryDuration_millis > APOrganizationsDisplayService.get_DefaultAppCredentialsExpiryDuration_Millis() ? APDisplayUtils.convertMilliseconds_To_Days(mo.apAppCredentialsExpiryDuration_millis) : APOrganizationsDisplayService.get_DefaultAppCredentialsExpiryDuration_Millis(),
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    // const funcName = 'create_ManagedObject_From_FormEntities';
    // const logName = `${ComponentName}.${funcName}()`;

    const mo: TManagedObject = props.apOrganizationDisplay_General;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    if(isNewManagedObject()) mo.apEntityId.id = fd.id;
    mo.apEntityId.displayName = fd.displayName;
    mo.apServiceRegistry = fd.serviceRegistryType;
    mo.apAssetIncVersionStrategy = fd.assetIncVersionStrategy;
    mo.apMaxNumEnvs_Per_ApiProduct = fd.is_Configured_MaxNumEnvs_Per_ApiProduct ? fd.maxNumEnvs_Per_ApiProduct : APOrganizationsDisplayService.get_DefaultMaxNumEnvs_Per_ApiProduct();
    mo.apMaxNumApis_Per_ApiProduct = fd.is_Configured_MaxNumApis_Per_ApiProduct ? fd.maxNumApis_Per_ApiProduct : APOrganizationsDisplayService.get_DefaultMaxNumApis_Per_ApiProduct();
    mo.apAppCredentialsExpiryDuration_millis = fd.is_Configured_AppCredentialsExpiryDays ? APDisplayUtils.convertDays_To_Milliseconds(fd.appCredentialsExpiryDays) : APOrganizationsDisplayService.get_DefaultAppCredentialsExpiryDuration_Millis();
    // DEBUG
    // alert(`${logName}: check console for logging...`);
    // console.log(`${logName}: mo=${JSON.stringify(mo, null, 2)}`);
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apOrganizationDisplay_General);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const [configContext] = React.useContext(ConfigContext);


  // * Api Calls *

  const apiCheck_ManagedObjectIdExists = async(moId: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_ManagedObjectIdExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_ORGANIZATION_ID_EXISTS, `check organization id exists: ${moId}`);
    let checkResult: boolean | undefined = undefined;
    try { 
      checkResult = await APOrganizationsDisplayService.apiCheck_OrganizationId_Exists({
        organizationId: moId
      });
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return checkResult;
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
    // check where the error is within the hidden forms
    // const funcName = 'onInvalidSubmitManagedObjectForm';
    // const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: what is invalid? - see console`);
    // console.log(`${logName}: managedObjectUseForm.formState.errors=${JSON.stringify(managedObjectUseForm.formState.errors, null, 2)}`);
  }

  const validate_Id = async(id: string): Promise<string | boolean> => {
    if(props.action === EAction.EDIT) return true;
    // check if id exists
    const checkResult: boolean | undefined = await apiCheck_ManagedObjectIdExists(id);
    if(checkResult === undefined) return false;
    if(checkResult) return 'Organization Id already exists, choose a unique Id.';
    return true;
  }

  const renderFields_MaxNumEnvs_Per_ApiProduct = (isActive: boolean) => {
    const rules_MaxNumEnvs_Per_ApiProduct = (isActive: boolean): any => {
      if(isActive) return {
        required: "Enter Max Number of Environments per API Product.",
        min: {
          value: 1,
          message: 'Max Number of Environments per API Product must be > 0.',
        }
      };
      else return {
        required: false,
        min: undefined
      };
    }
    if(isActive === undefined) return (<></>);
    return (
      <div className="p-ml-2 p-mt-4" hidden={!isActive}>
        {/* maxNumEnvs_Per_ApiProduct */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.maxNumEnvs_Per_ApiProduct"
              rules={rules_MaxNumEnvs_Per_ApiProduct(isActive)}
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
                );
              }}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.maxNumEnvs_Per_ApiProduct })}>Max Number of Environments per API Product*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.maxNumEnvs_Per_ApiProduct)}
        </div>
      </div>
    );
  }

  const renderFields_MaxNumApis_Per_ApiProduct = (isActive: boolean) => {
    const rules_MaxNumApis_Per_ApiProduct = (isActive: boolean): any => {
      if(isActive) return {
        required: "Enter Max Number of APIs per API Product.",
        min: {
          value: 1,
          message: 'Max Number of APIs per API Product must be > 0.',
        }
      };
      else return {
        required: false,
        min: undefined
      };
    }
    if(isActive === undefined) return (<></>);
    return (
      <div className="p-ml-2 p-mt-4" hidden={!isActive}>
        {/* maxNumApis_Per_ApiProduct */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.maxNumApis_Per_ApiProduct"
              rules={rules_MaxNumApis_Per_ApiProduct(isActive)}
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
                );
              }}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.maxNumApis_Per_ApiProduct })}>Max Number of APIs per API Product*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.maxNumApis_Per_ApiProduct)}
        </div>
      </div>
    );
  }

  const renderFields_AppCredentialsExpiryDays = (isActive: boolean) => {
    const rules = (isActive: boolean): any => {
      if(isActive) return {
        required: "Enter App Credentials Expiry in days.",
        min: {
          value: 14,
          message: 'Expiry days must be > 14.',
        }
      };
      else return {
        required: false,
        min: undefined
      };
    }
    if(isActive === undefined) return (<></>);
    return (
      <div className="p-ml-2 p-mt-4" hidden={!isActive}>
        {/* appCredentialsExpiryDays */}
        <div className="p-field">
          <span className="p-float-label">
            <Controller
              control={managedObjectUseForm.control}
              name="formData.appCredentialsExpiryDays"
              rules={rules(isActive)}
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
                );
              }}
            />
            <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.appCredentialsExpiryDays })}>App Credentials Expiry (days)*</label>
          </span>
          {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.appCredentialsExpiryDays)}
        </div>
      </div>
    );
  }

  const renderManagedObjectForm = () => {
    const isNewObject: boolean = isNewManagedObject();
    const is_Configured_MaxNumEnvs_Per_ApiProduct = managedObjectUseForm.watch('formData.is_Configured_MaxNumEnvs_Per_ApiProduct');
    const is_Configured_MaxNumApis_Per_ApiProduct = managedObjectUseForm.watch('formData.is_Configured_MaxNumApis_Per_ApiProduct');
    const is_Configured_AppCredentialsExpiryDays = managedObjectUseForm.watch('formData.is_Configured_AppCredentialsExpiryDays');
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.id"
                  rules={{
                    ...APSOpenApiFormValidationRules.APSId("Enter organization id.", true),
                    validate: validate_Id
                  }}
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.id })}>Id*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.id)}
            </div>
            {/* Display Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.displayName"
                  rules={APSOpenApiFormValidationRules.APSDisplayName("Enter a display name.", true)}
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.displayName })}>Display Name*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.displayName)}
            </div>

            <div className="p-mb-4 p-mt-4 ap-display-component-header">{DisplaySectionHeader_ServiceRegistry}:</div>
            <div className="p-ml-4">
              {/* service registry */}
              <div className="p-field">
                <span className="p-float-label">
                  <Controller
                    control={managedObjectUseForm.control}
                    name="formData.serviceRegistryType"
                    rules={APConnectorFormValidationRules.isRequired('Select Service Registry Type.', true)}
                    render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={Object.values(ServiceRegistryType)} 
                          onChange={(e) => {                           
                            field.onChange(e.value);
                            managedObjectUseForm.clearErrors();
                          }}
                          className={classNames({ 'p-invalid': fieldState.invalid })}      
                          // leave it fixed at patch
                          disabled={!ConfigHelper.isEventPortal20(configContext)}
                        />                        
                      );
                    }}
                  />
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.assetIncVersionStrategy })}>Service Registry Type*</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.assetIncVersionStrategy)}
              </div>
            </div>

            <div className="p-mb-4 p-mt-4 ap-display-component-header">{DisplaySectionHeader_AssetManagement}:</div>
            <div className="p-ml-4">
              {/* asset inc version strategy */}
              <div className="p-field">
                <span className="p-float-label">
                  <Controller
                    control={managedObjectUseForm.control}
                    name="formData.assetIncVersionStrategy"
                    rules={APConnectorFormValidationRules.isRequired('Select Asset Version Increment Strategy.', true)}
                    render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={Object.values(APSAssetIncVersionStrategy)} 
                          onChange={(e) => {                           
                            field.onChange(e.value);
                            managedObjectUseForm.clearErrors();
                          }}
                          className={classNames({ 'p-invalid': fieldState.invalid })}      
                          // leave it fixed at patch
                          disabled={true}                 
                        />                        
                      );
                    }}
                  />
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.assetIncVersionStrategy })}>Asset Version Increment Strategy*</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.assetIncVersionStrategy)}
              </div>
            </div>

            <div className="p-mb-2 p-mt-4 ap-display-component-header">{DisplaySectionHeader_ApiProducts}:</div>
            <div className="p-ml-4">
              {/* set max num envs per api product */}
              <div className="p-field-checkbox">
                <span>
                  <Controller
                    control={managedObjectUseForm.control}
                    name="formData.is_Configured_MaxNumEnvs_Per_ApiProduct"
                    render={( { field, fieldState }) => {
                      return(
                        <Checkbox
                          inputId={field.name}
                          checked={field.value}
                          // onChange={(e) => field.onChange(e.checked)}     
                          onChange={(e) => {                           
                            field.onChange(e.checked);
                            managedObjectUseForm.clearErrors('formData.maxNumEnvs_Per_ApiProduct');
                          }}    
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                    )}}
                  />
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.is_Configured_MaxNumEnvs_Per_ApiProduct })}> Configure Max Number of Environments per API Product</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.is_Configured_MaxNumEnvs_Per_ApiProduct)}
              </div>
              { renderFields_MaxNumEnvs_Per_ApiProduct(is_Configured_MaxNumEnvs_Per_ApiProduct) }
              {/* set max num apis per api product */}
              <div className="p-field-checkbox">
                <span>
                  <Controller
                    control={managedObjectUseForm.control}
                    name="formData.is_Configured_MaxNumApis_Per_ApiProduct"
                    render={( { field, fieldState }) => {
                      return(
                        <Checkbox
                          inputId={field.name}
                          checked={field.value}
                          // onChange={(e) => field.onChange(e.checked)}     
                          onChange={(e) => {                           
                            field.onChange(e.checked);
                            managedObjectUseForm.clearErrors('formData.maxNumApis_Per_ApiProduct');
                          }}    
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                    )}}
                  />
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.is_Configured_MaxNumApis_Per_ApiProduct })}> Configure Max Number of APIs per API Product</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.is_Configured_MaxNumApis_Per_ApiProduct)}
              </div>
              { renderFields_MaxNumApis_Per_ApiProduct(is_Configured_MaxNumApis_Per_ApiProduct) }
            </div>

            <div className="p-mb-2 p-mt-4 ap-display-component-header">{DisplaySectionHeader_Apps}:</div>
            <div className="p-ml-4">
              {/* set app credentials expiry */}
              <div className="p-field-checkbox">
                <span>
                  <Controller
                    control={managedObjectUseForm.control}
                    name="formData.is_Configured_AppCredentialsExpiryDays"
                    render={( { field, fieldState }) => {
                      return(
                        <Checkbox
                          inputId={field.name}
                          checked={field.value}
                          // onChange={(e) => field.onChange(e.checked)}     
                          onChange={(e) => {                           
                            field.onChange(e.checked);
                            managedObjectUseForm.clearErrors('formData.appCredentialsExpiryDays');
                          }}    
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                    )}}
                  />
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.is_Configured_AppCredentialsExpiryDays })}> Configure App Credentials Expiry</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.is_Configured_AppCredentialsExpiryDays)}
              </div>
              { renderFields_AppCredentialsExpiryDays(is_Configured_AppCredentialsExpiryDays) }
            </div>              
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
