
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Checkbox } from "primereact/checkbox";
import { classNames } from 'primereact/utils';

import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { E_CALL_STATE_ACTIONS } from "./ManageExternalSystemsCommon";
import APExternalSystemsDisplayService, { TAPExternalSystemDisplay } from "../../../displayServices/APExternalSystemsDisplayService";
import { APSOpenApiFormValidationRules } from "../../../utils/APSOpenApiFormValidationRules";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";

import '../../../components/APComponents.css';
import "./ManageExternalSystems.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewExternalSystemProps {
  action: EAction;
  organizationId: string;
  externalSystemId?: string;
  externalSystemDisplayName?: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newId: string, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewExternalSystem: React.FC<IEditNewExternalSystemProps> = (props: IEditNewExternalSystemProps) => {
  const ComponentName = 'EditNewExternalSystem';

  type TManagedObject = TAPExternalSystemDisplay;
  type TManagedObjectFormData = {
    id: string;
    displayName: string;
    description: string;
    isMarketplaceDestination: boolean;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  
  // const isNewManagedObject = (): boolean => {
  //   return props.action === EAction.NEW;
  // }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      id: mo.apEntityId.id,
      displayName: mo.apEntityId.displayName,
      description: mo.description,
      isMarketplaceDestination: mo.isMarketplaceDestination,
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = APExternalSystemsDisplayService.create_EmptyObject();
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apEntityId.id = fd.id;
    mo.apEntityId.displayName = fd.displayName;
    mo.description = fd.description;
    mo.isMarketplaceDestination = fd.isMarketplaceDestination;
    return mo;
  }

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<string>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
    
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const FormId = ComponentName;
  
  // * Api Calls *
  const apiCheck_IdExists = async(id: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_IdExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_EXTERNAL_SYSTEM_ID_EXISTS, `check external system exists: ${id}`);
    let checkResult: boolean | undefined = undefined;
    try { 
      checkResult = await APExternalSystemsDisplayService.apiCheck_Id_Exists({
        organizationId: props.organizationId,
        externalSystemId: id,
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return checkResult;
  }

  const apiGetManagedObject = async(managedObjectId: string, managedObjectDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EXTERNAL_SYSTEM, `retrieve details for external system: ${managedObjectDisplayName}`);
    try {
      const object: TAPExternalSystemDisplay = await APExternalSystemsDisplayService.apiGet_ApExternalSystemDisplay({
        organizationId: props.organizationId,
        externalSystemId: managedObjectId
      })
      setManagedObject(object);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_EXTERNAL_SYSTEM, `create external system: ${mo.apEntityId.displayName}`);
    try { 
      await APExternalSystemsDisplayService.apiCreate_ApExternalSystemDisplay({
        organizationId: props.organizationId,
        apExternalSystemDisplay: mo
      });
      setCreatedManagedObjectId(mo.apEntityId.id);
      setCreatedManagedObjectDisplayName(mo.apEntityId.displayName);      
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_EXTERNAL_SYSTEM, `update external system: ${mo.apEntityId.displayName}`);
    try { 
      await APExternalSystemsDisplayService.apiUpdate_ApExternalSystemDisplay({
        organizationId: props.organizationId,
        apExternalSystemDisplay: mo
      });
      setUpdatedManagedObjectDisplayName(mo.apEntityId.displayName);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${ComponentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.EDIT) {
      if(!props.externalSystemId) throw new Error(`${logName}: props.action=${props.action}: props.externalSystemId is undefined`);
      if(!props.externalSystemDisplayName) throw new Error(`${logName}: props.action=${props.action}: props.externalSystemDisplayName is undefined`);
      await apiGetManagedObject(props.externalSystemId, props.externalSystemDisplayName);
    } else {
      setManagedObject(APExternalSystemsDisplayService.create_EmptyObject());
    }
    props.onLoadingChange(false);
  }

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
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_EXTERNAL_SYSTEM) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_EXTERNAL_SYSTEM) {
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Form *
  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(mo);
    else await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    doSubmitManagedObject(create_ManagedObject_From_FormEntities({ formDataEnvelope: newMofde}));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // setIsFormSubmitted(true);
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    const getSubmitButtonLabel = (): string => {
      if (props.action === EAction.NEW) return 'Create';
      else return 'Save';
    }
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button key={ComponentName+getSubmitButtonLabel()} form={FormId} type="submit" label={getSubmitButtonLabel()} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const validate_Id = async(id: string): Promise<string | boolean> => {
    if(props.action !== EAction.NEW) return true;
    // check if id exists
    const checkResult: boolean | undefined = await apiCheck_IdExists(id);
    if(checkResult === undefined) return false;
    if(checkResult) return 'External System Id already exists, please choose a unique Id.';
    return true;
  }

  const renderManagedObjectForm = () => {
    // const funcName = 'renderManagedObjectForm';
    // const logName = `${componentName}.${funcName}()`;
    const isNewObject: boolean = (props.action === EAction.NEW);
    return (
      <div className="card">
        <div className="p-fluid">
          <form id={FormId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.id"
                  rules={{
                    ...APSOpenApiFormValidationRules.APSId("Enter Id.", true),
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
                  rules={APSOpenApiFormValidationRules.APSDisplayName('Enter Display Name.', true)}
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
            {/* isMarketplaceDestination */}
            <div className="p-field-checkbox">
              <span>
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.isMarketplaceDestination"
                  render={( { field, fieldState }) => {
                    return(
                      <Checkbox
                        inputId={field.name}
                        checked={field.value}
                        onChange={(e) => field.onChange(e.checked)}                                  
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.isMarketplaceDestination })}> Enable as a Marketplace Destination</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.isMarketplaceDestination)}
            </div>
          </form>  
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }

  const getEditNotes = (mo: TManagedObject): string => {
    if(mo.apBusinessGroupExternalDisplayList.length === 0) return 'No imported business groups.';
    return `Imported Business Groups: ${mo.apBusinessGroupExternalDisplayList.length}.`;
  }
  
  return (
    <div className="ap-manage-external-system">

      {managedObject && props.action === EAction.NEW && 
        <APComponentHeader header='Create External System:' />
      }

      {managedObject && props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit External System: ${props.externalSystemDisplayName}`} notes={getEditNotes(managedObject)}/>
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObjectFormDataEnvelope && renderManagedObjectForm() }

    </div>
  );
}
