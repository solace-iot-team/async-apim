
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from 'primereact/utils';

import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay_CloningInfo } from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "../ManageApiProductsCommon";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import APVersioningDisplayService from "../../../../displayServices/APVersioningDisplayService";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface ICloneApiProductFormProps {
  formId: string;
  organizationId: string;
  apAdminPortalApiProductDisplay_CloningInfo: TAPAdminPortalApiProductDisplay_CloningInfo;
  onSubmit: (apAdminPortalApiProductDisplay_CloningInfo: TAPAdminPortalApiProductDisplay_CloningInfo) => void;
  onError: (apiCallState: TApiCallState) => void;
}

export const CloneApiProductForm: React.FC<ICloneApiProductFormProps> = (props: ICloneApiProductFormProps) => {
  const ComponentName = 'CloneApiProductForm';

  type TManagedObject = TAPAdminPortalApiProductDisplay_CloningInfo;
  type TManagedObjectFormData = {
    id: string;
    displayName: string;
    description: string;
    version: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      id: mo.apCloneEntityId.id,
      displayName: mo.apCloneEntityId.displayName,
      description: mo.apCloneDescription,
      version: mo.apCloneVersionString,
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

    const mo: TManagedObject = props.apAdminPortalApiProductDisplay_CloningInfo;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;

    mo.apCloneEntityId = {
      id: fd.id,
      displayName: fd.displayName
    };
    mo.apCloneVersionString = fd.version;
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apAdminPortalApiProductDisplay_CloningInfo);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // * Api Calls *
  const apiCheck_ApiProductIdExists = async(apiProductId: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_ApiProductIdExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_API_PRODUCT_ID_EXISTS, `check api product exists: ${apiProductId}`);
    let checkResult: boolean | undefined = undefined;
    try { 
      checkResult = await APAdminPortalApiProductsDisplayService.apiCheck_ApApiProductDisplay_Exists({
        organizationId: props.organizationId,
        apiProductId: apiProductId
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
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) {
        if(apiCallStatus.context.action !== E_CALL_STATE_ACTIONS.API_CHECK_API_PRODUCT_ID_EXISTS) props.onError(apiCallStatus);
      }
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

  const validate_SemVer = (newVersion: string): string | boolean => {
    if(APVersioningDisplayService.is_NewVersion_GreaterThan_LastVersion({
      lastVersion: managedObject.apOriginalVersionString,
      newVersion: newVersion
    })) return true;
    return `New version must be greater than last version: ${managedObject.apOriginalVersionString}.`
  }

  const validate_Id = async(id: string): Promise<string | boolean> => {
    // check if id exists
    const checkResult: boolean | undefined = await apiCheck_ApiProductIdExists(id);
    if(checkResult === undefined) return false;
    if(checkResult) return 'API Product Id already exists, choose a unique Id.';
    return true;
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
  
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
                    ...APConnectorFormValidationRules.CommonName(),
                    validate: validate_Id
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus={false}
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
                  rules={APConnectorFormValidationRules.CommonDisplayName()}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={true}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.displayName })}>Display Name*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.displayName)}
            </div>
            {/* description */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.description"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.description })}>Description*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.description)}
            </div>
            {/* version */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.version"
                  rules={{
                    ...APConnectorFormValidationRules.SemVer(),
                    validate: validate_SemVer
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus={true}
                        className={classNames({ 'p-invalid': fieldState.invalid })}      
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.version })}>New Version*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.version)}
            </div>
          </form>
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      { managedObjectFormDataEnvelope && renderManagedObjectForm() }

    </div>
  );
}
