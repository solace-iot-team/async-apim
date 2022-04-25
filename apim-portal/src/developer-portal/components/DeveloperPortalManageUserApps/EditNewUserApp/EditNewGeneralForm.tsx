
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { EAction, E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageUserAppsCommon";
import { TAPAppDisplay_General } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import APDeveloperPortalUserAppsDisplayService from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IEditNewGeneralFormProps {
  action: EAction;
  organizationId: string;
  apAppDisplay_General: TAPAppDisplay_General;
  formId: string;
  onSubmit: (apAppDisplay_General: TAPAppDisplay_General) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewGeneralForm: React.FC<IEditNewGeneralFormProps> = (props: IEditNewGeneralFormProps) => {
  const ComponentName = 'EditNewGeneralForm';

  type TManagedObject = TAPAppDisplay_General;
  type TManagedObjectFormData = {
    id: string;
    displayName: string;
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
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apAppDisplay_General;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    if(isNewManagedObject()) mo.apEntityId.id = fd.id;
    mo.apEntityId.displayName = fd.displayName;
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apAppDisplay_General);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // * Api Calls *

  const apiCheck_ManageObjectIdExists = async(managedObjectId: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_ManageObjectIdExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_USER_APP_ID_EXISTS, `check if app: ${managedObjectId}`);
    let checkResult: boolean | undefined = undefined;
    try { 
      checkResult = await APDeveloperPortalUserAppsDisplayService.apiCheck_AppId_Exists({
        organizationId: props.organizationId,
        appId: managedObjectId
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
    // placeholder
  }

  const validate_Id = async(id: string): Promise<string | boolean> => {
    if(props.action === EAction.EDIT) return true;
    // check if id exists
    const checkResult: boolean | undefined = await apiCheck_ManageObjectIdExists(id);
    if(checkResult === undefined) return false;
    if(checkResult) return 'App Id already exists, choose a unique Id.';
    return true;
  }

  const renderManagedObjectForm = () => {
    const isNewObject: boolean = isNewManagedObject();
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            {isNewObject &&
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
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.id })}>Id*</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.id)}
              </div>
            }
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
          </form>  
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
