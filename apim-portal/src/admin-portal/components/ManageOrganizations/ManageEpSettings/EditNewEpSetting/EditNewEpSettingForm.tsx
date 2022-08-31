
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Checkbox } from "primereact/checkbox";
import { classNames } from 'primereact/utils';
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";

import { ApiCallState, TApiCallState } from "../../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../../displayServices/APDisplayUtils";
import { APClientConnectorOpenApi } from "../../../../../utils/APClientConnectorOpenApi";
// import { APSOpenApiFormValidationRules } from "../../../../../utils/APSOpenApiFormValidationRules";
import { APConnectorFormValidationRules } from "../../../../../utils/APConnectorOpenApiFormValidationRules";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageEpSettingsCommon";
import APEpSettingsDisplayService, { IAPEpSettingsDisplay } from "../../../../../displayServices/APEpSettingsDisplayService";

import '../../../../../components/APComponents.css';
import "../../ManageOrganizations.css";

export interface IEditNewEpSettingFormProps {
  action: EAction;
  organizationId: string;
  apEpSettingsDisplay: IAPEpSettingsDisplay;
  formId: string;
  onSubmit: (apEpSettingsDisplay: IAPEpSettingsDisplay) => void;
  onError: (apiCallState: TApiCallState) => void;
  // onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewEpSettingForm: React.FC<IEditNewEpSettingFormProps> = (props: IEditNewEpSettingFormProps) => {
  const ComponentName = 'EditNewEpSettingForm';

  type TManagedObject = IAPEpSettingsDisplay;
  type TManagedObjectFormData = {
    id: string;
    displayName: string;
    // apEpSettings_MappingList: TApEpSettings_MappingList;
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
    // const funcName = 'create_ManagedObject_From_FormEntities';
    // const logName = `${ComponentName}.${funcName}()`;

    const mo: TManagedObject = props.apEpSettingsDisplay;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    if(isNewManagedObject()) mo.apEntityId.id = fd.id;
    mo.apEntityId.displayName = fd.displayName;
    // DEBUG
    // alert(`${logName}: check console for logging...`);
    // console.log(`${logName}: mo=${JSON.stringify(mo, null, 2)}`);
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apEpSettingsDisplay);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // * Api Calls *

  const apiCheck_ManagedObjectIdExists = async(moId: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_ManagedObjectIdExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_ID_EXISTS, `check setting id exists: ${moId}`);
    let checkResult: boolean | undefined = undefined;
    try { 
      checkResult = await APEpSettingsDisplayService.apiCheck_ApEpSettingId_Exists({
        organizationId: props.organizationId,
        id: moId
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
    if(checkResult) return 'Setting Id already exists, please choose a unique Id.';
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
                  rules={APConnectorFormValidationRules.CommonDisplayName()}
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
