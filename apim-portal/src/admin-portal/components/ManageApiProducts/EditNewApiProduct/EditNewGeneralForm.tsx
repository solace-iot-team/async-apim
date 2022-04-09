
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { EAction, E_CALL_STATE_ACTIONS} from "../ManageApiProductsCommon";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { TAPApiProductDisplay_General } from "../../../../displayServices/APApiProductsDisplayService";
import APAdminPortalApiProductsDisplayService from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import APVersioningDisplayService from "../../../../displayServices/APVersioningDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewGeneralFormProps {
  action: EAction;
  organizationId: string;
  apApiProductDisplay_General: TAPApiProductDisplay_General;
  formId: string;
  onSubmit: (apAdminPortalApiProductDisplay_General: TAPApiProductDisplay_General) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewGeneralForm: React.FC<IEditNewGeneralFormProps> = (props: IEditNewGeneralFormProps) => {
  const ComponentName = 'EditNewGeneralForm';

  type TManagedObject = TAPApiProductDisplay_General;
  type TManagedObjectFormData = {
    id: string;
    displayName: string;
    description: string;
    version: string;
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
      description: mo.apDescription,
      version: mo.apVersionInfo.apCurrentVersion,
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apApiProductDisplay_General;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    if(isNewManagedObject()) mo.apEntityId.id = fd.id;
    mo.apEntityId.displayName = fd.displayName;
    mo.apDescription = fd.description;
    mo.apVersionInfo.apCurrentVersion = fd.version;
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apApiProductDisplay_General);
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
    // alert(`${ComponentName}: mounting ...`);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) {
      managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
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
    setManagedObjectFormDataEnvelope(newMofde);
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const validate_SemVer = (newVersion: string): string | boolean => {
    const funcName = 'validate_SemVer';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(isNewManagedObject()) return true;
    if(APVersioningDisplayService.is_NewVersion_GreaterThan_LastVersion({
      lastVersion: managedObject.apVersionInfo.apLastVersion, 
      newVersion: newVersion
    })) return true;
    return `New version must be greater than current version: ${managedObject.apVersionInfo.apLastVersion}.`
  }

  const validate_Id = async(id: string): Promise<string | boolean> => {
    if(props.action !== EAction.NEW) return true;
    // check if id exists
    const checkResult: boolean | undefined = await apiCheck_ApiProductIdExists(id);
    if(checkResult === undefined) return false;
    if(checkResult) return 'API Product Id already exists, choose a unique Id.';
    return true;
  }

  const renderManagedObjectForm = () => {
    const isNewObject: boolean = isNewManagedObject();
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
                    ...APConnectorFormValidationRules.Name(),
                    validate: validate_Id
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus={false}
                        disabled={!isNewObject}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.id })}>Id*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.id)}
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.version })}>Version*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.version)}
            </div>
            {/* Display Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.displayName"
                  rules={APConnectorFormValidationRules.DisplayName()}
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
          </form>  
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      { renderManagedObjectForm() }

    </div>
  );
}
