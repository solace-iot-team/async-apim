
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { E_CALL_STATE_ACTIONS } from "./ManageExternalSystemsCommon";
import APExternalSystemsDisplayService, { TAPExternalSystemDisplay } from "../../../displayServices/APExternalSystemsDisplayService";
import { APSOpenApiFormValidationRules } from "../../../utils/APSOpenApiFormValidationRules";

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
  const componentName = 'EditNewExternalSystem';

  type TManagedObject = TAPExternalSystemDisplay;

  type TManagedObjectFormData = TManagedObject & {
  }
  
  const EmptyManagedObject: TManagedObject = APExternalSystemsDisplayService.create_EmptyObject();

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<string>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
    
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;
  
  const transformManagedObject_To_FormData = (mo: TManagedObject): TManagedObjectFormData => {
    // const funcName = 'transformManagedObjectToFormData';
    // const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: managedObject.apiProduct.accessLevel=${managedObject.apiProduct.accessLevel}`);
    const fd: TManagedObjectFormData = {
      ...mo,
    };
    // console.log(`${logName}: fd = ${JSON.stringify(fd, null, 2)}`);
    // alert(`${logName}: check console for fd ...`)
    return fd;
  }

  const transformFormData_To_ManagedObject = (mofd: TManagedObjectFormData): TManagedObject => {
    // const funcName = 'transformFormData_To_ManagedObject';
    // const logName = `${componentName}.${funcName}()`;
    let mo: TManagedObject = {
      ...mofd,
      apsExternalSystem: {
        ...mofd.apsExternalSystem,
        displayName: mofd.apEntityId.displayName,
        externalSystemId: mofd.apEntityId.id,
      }
    };
    // alert(`${logName}: mo = ${JSON.stringify(mo, null, 2)}`);
    return mo;
  }

  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: string, managedObjectDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
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
    const logName = `${componentName}.${funcName}()`;
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
    const logName = `${componentName}.${funcName}()`;
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
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.EDIT) {
      if(!props.externalSystemId) throw new Error(`${logName}: props.action=${props.action}: props.externalSystemId is undefined`);
      if(!props.externalSystemDisplayName) throw new Error(`${logName}: props.action=${props.action}: props.externalSystemDisplayName is undefined`);
      await apiGetManagedObject(props.externalSystemId, props.externalSystemDisplayName);
    } else {
      setManagedObject(EmptyManagedObject);
    }
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormData(transformManagedObject_To_FormData(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormData) doPopulateManagedObjectFormDataValues(managedObjectFormData);
  }, [managedObjectFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
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
  const doPopulateManagedObjectFormDataValues = (mofd: TManagedObjectFormData) => {
    // const funcName = 'doPopulateManagedObjectFormDataValues';
    // const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: mofd.apEntityId=${JSON.stringify(mofd.apEntityId, null, 2)}`);

    managedObjectUseForm.setValue('apEntityId', mofd.apEntityId);
    managedObjectUseForm.setValue('apsExternalSystem', mofd.apsExternalSystem);
  }

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(mo);
    else await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (newMofd: TManagedObjectFormData) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    const mofd: TManagedObjectFormData = {
      ...newMofd,
    }
    doSubmitManagedObject(transformFormData_To_ManagedObject(mofd));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
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
        <Button key={componentName+getSubmitButtonLabel()} form={formId} type="submit" label={getSubmitButtonLabel()} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = () => {
    // const funcName = 'renderManagedObjectForm';
    // const logName = `${componentName}.${funcName}()`;
    const isNewObject: boolean = (props.action === EAction.NEW);
    return (
      <div className="card">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="apEntityId.id"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSId("Enter Id.", true)}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
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
                <label htmlFor="apEntityId.id" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apEntityId?.id })}>Id*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apEntityId?.id)}
            </div>
            {/* Display Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apEntityId.displayName"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSDisplayName('Enter Display Name.', true)}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={!isNewObject}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apEntityId.displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apEntityId?.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apEntityId?.displayName)}
            </div>
            {/* description */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apsExternalSystem.description"
                  control={managedObjectUseForm.control}
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
                <label htmlFor="apsExternalSystem.description" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apsExternalSystem?.description })}>Description*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apsExternalSystem?.description)}
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

      {managedObjectFormData && 
        renderManagedObjectForm()
      }

      {/* DEBUG */}
      {/* {managedObject && 
        <React.Fragment>
          <p>managedObject:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObject.asyncApiSpec, null, 2)}
          </pre>
        </React.Fragment>
      } */}
    </div>
  );
}
