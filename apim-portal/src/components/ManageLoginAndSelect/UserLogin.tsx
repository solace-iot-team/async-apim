
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
  TAPLoginUserDisplay, 
  TAPUserLoginCredentials 
} from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";
import { E_CALL_STATE_ACTIONS } from "./ManageLoginAndSelectCommon";

import "../APComponents.css";
import "./ManageLoginAndSelect.css";

export interface IUserLoginProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apLoginUserDisplay: TAPLoginUserDisplay) => void;
  userCredentials?: TAPUserLoginCredentials;
}

export const UserLogin: React.FC<IUserLoginProps> = (props: IUserLoginProps) => {
  const ComponentName = 'UserLogin';

  type TManagedObject = TAPUserLoginCredentials;

  type TManagedObjectFormData = {
    userId: string;
    userPwd: string;
  };

  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      userId: mo.userId,
      userPwd: mo.userPwd,
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
    mo.userId = fd.userId;
    mo.userPwd = fd.userPwd;
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isAutoLogin, setIsAutoLogin] = React.useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = React.useState<boolean>(false);
  const [loginAttempts, setLoginAttempts] = React.useState<number>(0);
  const [loggedIn_ApLoginUserDisplay, setLoggedIn_ApLoginUserDisplay] = React.useState<TAPLoginUserDisplay>();
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = ComponentName;

  const apiLogin = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiLogin';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_LOGIN, `login ${mo.userId}`);
    try { 
      const apLoginUserDisplay: TAPLoginUserDisplay | undefined = await APLoginUsersDisplayService.apsLogin({
        apUserLoginCredentials: mo
      });
      setLoggedIn_ApLoginUserDisplay(apLoginUserDisplay);
      if(apLoginUserDisplay === undefined) {
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

  const doAutoLogin = async(mo: TManagedObject) => {
    await apiLogin(mo);
    setIsAutoLogin(true);
    setLoginAttempts(loginAttempts + 1);
  }

  const doManualLogin = async(mo: TManagedObject) => {
    await apiLogin(mo);
    setLoginAttempts(loginAttempts + 1);
  }

  const doInitialize = async () => {
    if(props.userCredentials !== undefined) {
      await doAutoLogin(props.userCredentials);
    }
    else {
      setManagedObject(APLoginUsersDisplayService.create_Empty_ApUserLoginCredentials());
    }
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if(managedObject !== undefined && !isAutoLogin) {
      setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(managedObject !== undefined && isAutoLogin) {
  //     alert(`do the auto login... with managedObject = ${JSON.stringify(managedObject, null, 2)}`);
  //   }
  // }, [isAutoLogin]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(loggedIn_ApLoginUserDisplay !== undefined && loginSuccess) {
      props.onSuccess(loggedIn_ApLoginUserDisplay);
    } else if(isAutoLogin && !loginSuccess) {
      // simulate manual login
      setManagedObject(APLoginUsersDisplayService.create_Empty_ApUserLoginCredentials());
    }
  }, [loggedIn_ApLoginUserDisplay, loginSuccess]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
            <h2 className="p-text-center">Login</h2>
            { managedObjectFormDataEnvelope && renderManagedObjectForm() }
            { loginAttempts > 0 && !loginSuccess && renderLoginFailed() }
          </div>
        </div>
    </div>

  );

}
