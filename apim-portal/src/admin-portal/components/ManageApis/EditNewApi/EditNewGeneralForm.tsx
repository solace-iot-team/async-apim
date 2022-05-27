
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageApisCommon";
import APApisDisplayService, { TAPApiDisplay_General } from "../../../../displayServices/APApisDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface IEditNewGeneralFormProps {
  action: EAction;
  organizationId: string;
  apApiDisplay_General: TAPApiDisplay_General;
  formId: string;
  onSubmit: (apApiDisplay_General: TAPApiDisplay_General) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewGeneralForm: React.FC<IEditNewGeneralFormProps> = (props: IEditNewGeneralFormProps) => {
  const ComponentName = 'EditNewGeneralForm';

  type TManagedObject = TAPApiDisplay_General;
  type TManagedObjectFormData = {
    id: string;
    description: string;
    summary: string;
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
      description: mo.description,
      summary: mo.summary,
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apApiDisplay_General;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    if(isNewManagedObject()) mo.apEntityId.id = fd.id;
    mo.description = fd.description;
    mo.summary = fd.summary;
    return mo;
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // * Api Calls *

  const apiCheck_ApiIdExists = async(apiId: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_ApiIdExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_API_ID_EXISTS, `check api exists: ${apiId}`);
    let checkResult: boolean | undefined = undefined;
    try { 
      checkResult = await APApisDisplayService.apiCheck_ApApiDisplay_Exists({
        organizationId: props.organizationId,
        apiId: apiId
      });
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return checkResult;
  }

  const doInitialize = async () => {
    setManagedObject(props.apApiDisplay_General);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
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

  const validate_Id = async(id: string): Promise<string | boolean> => {
    if(props.action !== EAction.NEW) return true;
    // check if id exists
    const checkResult: boolean | undefined = await apiCheck_ApiIdExists(id);
    if(checkResult === undefined) return false;
    if(checkResult) return 'API Id already exists, please choose a unique Id.';
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
                    ...APConnectorFormValidationRules.CommonName(),
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.id })}>Name/Id*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.id)}
            </div>
            {/* summary */}
            {/* <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.summary"
                  rules={{
                    required: "Enter summary.",
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.summary })}>Summary*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.summary)}
            </div> */}
            {/* description */}
            {/* <div className="p-field">
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
            </div> */}
          </form>  
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-apis">

      { managedObjectFormDataEnvelope && renderManagedObjectForm() }

    </div>
  );
}
