
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSOpenApiFormValidationRules } from "../../../../utils/APSOpenApiFormValidationRules";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { TAPCheckUserIdExistsResult, TAPUserProfileDisplay } from "../../../../displayServices/APUsersDisplayService/APUsersDisplayService";
import APSystemUsersDisplayService, { TAPSystemUserDisplay } from "../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageSystemUsersCommon";

import '../../../../components/APComponents.css';
import "../ManageSystemUsers.css";

export interface IEditNewSystemUserProfileProps {
  action: EAction,
  apSystemUserDisplay: TAPSystemUserDisplay;
  onSave: (apUserProfileDisplay: TAPUserProfileDisplay) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
}

export const EditNewSystemUserProfile: React.FC<IEditNewSystemUserProfileProps> = (props: IEditNewSystemUserProfileProps) => {
  const ComponentName = 'EditNewSystemUserProfile';

  type TManagedObject = TAPUserProfileDisplay;
  type TManagedObjectFormData = {
    email: string;
    first: string;
    last: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      email: mo.email,
      first: mo.first,
      last: mo.last,
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({orginalManagedObject, formDataEnvelope}: {
    orginalManagedObject: TManagedObject;
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = orginalManagedObject;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.email = fd.email;
    mo.first = fd.first;
    mo.last = fd.last;
    mo.apEntityId.displayName = APSystemUsersDisplayService.create_UserDisplayName(mo);
    mo.apEntityId.id = mo.email;
    return mo;
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = ComponentName;

  // * Api Calls *

  const apiCheckSystemUserExists = async(userId: string): Promise<TAPCheckUserIdExistsResult | undefined> => {
    const funcName = 'apiCheckSystemUserExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_USER_EXISTS, `check user exists: ${userId}`);
    let checkResult: TAPCheckUserIdExistsResult | undefined = undefined;
    try { 
      checkResult = await APSystemUsersDisplayService.apsCheck_UserIdExists({
        userId: userId
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return checkResult;
  }

  const doInitialize = async () => {
    setManagedObject(APSystemUsersDisplayService.get_ApUserProfileDisplay({
      apUserDisplay: props.apSystemUserDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject !== undefined) {
      setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onSave(mo);
  }

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    doSubmitManagedObject(create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      if(props.action === EAction.EDIT) {
        return (
          <React.Fragment>
            <Button key={ComponentName+'Save'} form={formId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
          </React.Fragment>
        );  
      } else {
        return (
          <React.Fragment>
            <Button key={ComponentName+'Next'} form={formId} type="submit" label="Next" icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
          </React.Fragment>
        );  
      }
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const validate_Email = async(email: string): Promise<string | boolean> => {
    if(props.action === EAction.EDIT) return true;
    const checkResult: TAPCheckUserIdExistsResult | undefined = await apiCheckSystemUserExists(email);
    if(checkResult === undefined) return false;
    if(checkResult.exists) return 'User already exists.';
    return true;
  }

  const renderManagedObjectForm = () => {
    const isNewUser: boolean = (props.action === EAction.NEW);
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* E-mail */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-envelope" />
                <Controller
                  name="formData.email"
                  control={managedObjectUseForm.control}
                  rules={{
                    ...APSOpenApiFormValidationRules.APSEmail("Enter E-Mail.", true),
                    validate: validate_Email
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={isNewUser}
                          disabled={!isNewUser}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.email })}>E-Mail*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.email)}
            </div>
            {/* First Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="formData.first"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSUserName("Enter First Name.", true)}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={!isNewUser}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.first })}>First Name*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.first)}
            </div>
            {/* Last Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="formData.last"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSUserName("Enter Last Name.", true)}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.last })}>Last Name*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.last)}
            </div>
          </form>  
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-users">

      {managedObject && 
        renderManagedObjectForm()
      }
    </div>
  );
}
