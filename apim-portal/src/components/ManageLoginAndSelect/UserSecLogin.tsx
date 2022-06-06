
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { classNames } from 'primereact/utils';
import { Divider } from 'primereact/divider';

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { APSOpenApiFormValidationRules } from "../../utils/APSOpenApiFormValidationRules";
import APLoginUsersDisplayService, { 
  TAPSecLoginUserResponse, 
  TAPUserLoginCredentials 
} from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";
import { E_CALL_STATE_ACTIONS } from "./ManageLoginAndSelectCommon";

import "../APComponents.css";
import "./ManageLoginAndSelect.css";

export interface IUserSecLoginProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apSecLoginUserResponse: TAPSecLoginUserResponse) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const UserSecLogin: React.FC<IUserSecLoginProps> = (props: IUserSecLoginProps) => {
  const ComponentName = 'UserSecLogin';

  type TManagedObject = TAPUserLoginCredentials;

  type TManagedObjectFormData = {
    userId: string;
    userPwd: string;
  };

  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const PageTitle = "Login";

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      userId: mo.username,
      userPwd: mo.password,
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
    mo.username = fd.userId;
    mo.password = fd.userPwd;
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [loginSuccess, setLoginSuccess] = React.useState<boolean>(false);
  const [loginAttempts, setLoginAttempts] = React.useState<number>(0);
  const [apSecLoginUserResponse, setApSecLoginUserResponse] = React.useState<TAPSecLoginUserResponse>();

  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = ComponentName;

  // * Api Calls *
  const apiLogin = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiLogin';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_LOGIN, `login ${mo.username}`);
    try { 

      const apSecLoginUserResponse: TAPSecLoginUserResponse | undefined =  await APLoginUsersDisplayService.apsSecLogin({
        apUserLoginCredentials: mo
      });
      setApSecLoginUserResponse(apSecLoginUserResponse);
      if(apSecLoginUserResponse === undefined) {
        setLoginSuccess(false);
      } else {
        setLoginSuccess(true);
      }
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doManualLogin = async(mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiLogin(mo);
    props.onLoadingChange(false);
    setLoginAttempts(loginAttempts + 1);
  }

  const doInitialize = async () => {
    setManagedObject(APLoginUsersDisplayService.create_Empty_ApUserLoginCredentials());
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apSecLoginUserResponse !== undefined && loginSuccess) {
      props.onSuccess(apSecLoginUserResponse);
    }
  }, [apSecLoginUserResponse, loginSuccess]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const newMo: TManagedObject = create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: newMofde,
    });
    setManagedObject(newMo);
    doManualLogin(newMo);
  } 

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Button form={formId} type="submit" label="Login" className="p-mt-2" />
    );
  }

  const renderManagedObjectForm = () => {
    return (
      <div className="p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* UserId */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-envelope" />
                <Controller
                  name="formData.userId"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSEmail("Enter user id (your e-mail).", true) }
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.userId })}>E-Mail*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.userId)}
            </div>
            {/* Password */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <Controller
                  name="formData.userPwd"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter password.",
                  }}
                  render={( { field, fieldState }) => {
                    // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                    return(
                      <Password
                        id={field.name}
                        toggleMask={true}
                        feedback={false}
                        {...field}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.userPwd })}>Password*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.userPwd)}
            </div>
          </form>  
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }

  const renderLoginFailed = () => {
    return (
      <div className="card">
        <Divider />
        <span className="p-error">Login failed.</span>
      </div>
    );
  }

  return (

    <div className="user-login">
        <div className="p-d-flex p-jc-center">
          <div className="card">
            <h2 className="p-text-center">{PageTitle}</h2>
            { managedObjectFormDataEnvelope && renderManagedObjectForm() }
            { loginAttempts > 0 && !loginSuccess && renderLoginFailed() }
          </div>
        </div>
    </div>

  );

}
