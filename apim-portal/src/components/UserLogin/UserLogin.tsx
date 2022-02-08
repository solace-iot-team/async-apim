
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { classNames } from 'primereact/utils';
import { Loading } from '../Loading/Loading';
import { Divider } from 'primereact/divider';

import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { AuthContext } from '../AuthContextProvider/AuthContextProvider';
import { UserContext } from '../UserContextProvider/UserContextProvider';
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";
import { TApiCallState } from "../../utils/ApiCallState";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { 
  APSUserLoginCredentials,
  APSUser, 
  ApsLoginService
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { APSOpenApiFormValidationRules } from "../../utils/APSOpenApiFormValidationRules";

import "../APComponents.css";
import "./UserLogin.css";

export type TUserLoginCredentials = APSUserLoginCredentials;

export interface IUserLoginProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  userCredentials?: TUserLoginCredentials;
}

const emptyLoginData: APSUserLoginCredentials = {
  userId: '',
  userPwd: ''
}

export const UserLogin: React.FC<IUserLoginProps> = (props: IUserLoginProps) => {
  const componentName = 'UserLogin';

  const [loginFormData, setLoginFormData] = React.useState<APSUserLoginCredentials>(emptyLoginData);
  const [isLoginSuccessful, setIsLoginSuccessful] = React.useState<boolean | undefined>(undefined);
  const [isCallingApi, setIsCallingApi] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [loggedInUser, setLoggedInUser] = React.useState<APSUser>();
  const [showLoginForm, setShowLoginForm] = React.useState<boolean>(false);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const loginUseForm = useForm<APSUserLoginCredentials>();

  const doLogin = async(apsUserLoginCredentials: APSUserLoginCredentials): Promise<TApiCallState> => {
    const funcName = 'doLogin';
    const logName = `${componentName}.${funcName}()`;
    setIsCallingApi(true);
    setIsLoginSuccessful(undefined);    
    let callState: TApiCallState = {
      success: true,
      context: {
        action: logName,
        userDetail: `login`
      }
    }
    try { 
      const loggedInUser: APSUser = await ApsLoginService.login({
        requestBody: apsUserLoginCredentials
      });
      setLoggedInUser(loggedInUser);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState.success = false;
      callState.isAPSApiError = APSClientOpenApi.isInstanceOfApiError(e);
      if(callState.isAPSApiError) callState.error = e;
      else callState.error = e.toString();
    }
    setIsCallingApi(false);
    setApiCallStatus(callState);
    setIsLoginSuccessful(callState.success);
    return callState;
  }

  const doAutoLogin = async(apsUserLoginCredentials: APSUserLoginCredentials) => {
    const apiCallState: TApiCallState = await doLogin(apsUserLoginCredentials);
    if(!apiCallState.success) {
      setLoginFormData(apsUserLoginCredentials);
      setShowLoginForm(true);
    }
  }

  React.useEffect(() => {
    dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT' });
    dispatchUserContextAction({ type: 'CLEAR_USER_CONTEXT' });
    dispatchOrganizationContextAction({ type: 'CLEAR_ORGANIZATION_CONTEXT'});
    if(props.userCredentials) doAutoLogin(props.userCredentials);
    else setShowLoginForm(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if(loginFormData) {
      loginUseForm.setValue('userId', loginFormData.userId);
      loginUseForm.setValue('userPwd', loginFormData.userPwd);
    } else {
      loginUseForm.setValue('userId', '');
      loginUseForm.setValue('userPwd', '');
    }
  }, [loginFormData]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if(isLoginSuccessful === undefined) return;
    if(apiCallStatus === null) throw new Error('apiCallStatus is null');
    if(isLoginSuccessful) {
      if(loggedInUser) {
        dispatchUserContextAction({ type: 'SET_USER', user: loggedInUser});  
      }
    } else {
      props.onError(apiCallStatus);
    }
  }, [isLoginSuccessful]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if(isLoginSuccessful === undefined || !isLoginSuccessful) return;
    if(apiCallStatus === null) throw new Error('apiCallStatus is null');
    // do not set auth context - select organization will be called next
    if(loggedInUser) {
      props.onSuccess(apiCallStatus);
    } else {
      props.onError(apiCallStatus);
    }
  }, [userContext]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (apsUserLoginCredentials: APSUserLoginCredentials) => {
    setLoginFormData(apsUserLoginCredentials);
    doLogin(apsUserLoginCredentials);
  }

  const displayLoginFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  return (
    <div className="auth-login">
    {showLoginForm &&
        <div className="p-d-flex p-jc-center">
          <div className="card ">
            <h2 className="p-text-center">Login</h2>
            <form onSubmit={loginUseForm.handleSubmit(onSubmit)} className="p-fluid">
              <div className="p-field">
                <span className="p-float-label p-input-icon-right">
                  <i className="pi pi-envelope" />
                  <Controller
                    name="userId"
                    control={loginUseForm.control}
                    rules={APSOpenApiFormValidationRules.APSEmail("Enter user id (your e-mail).", true)}
                    // defaultValue=''
                    render={( {field, fieldState }) => (
                      <InputText 
                        id={field.name}
                        {...field}
                      autoFocus 
                      className={classNames({ 'p-invalid': fieldState.invalid })} 
                    />  
                    )}
                  />
                  <label htmlFor="userId" className={classNames({ 'p-error': loginUseForm.formState.errors.userId })}>E-Mail</label>
                </span>
                {displayLoginFormFieldErrorMessage(loginUseForm.formState.errors.userId)}
              </div>
              <div className="p-field">
                <span className="p-float-label p-input-icon-right">
                  <Controller
                    name="userPwd"
                    control={loginUseForm.control}
                    rules={{
                      required: "Enter password.",
                    }}
                    defaultValue=''
                    render={( {field, fieldState }) => (
                      <Password
                        id={field.name}
                        toggleMask={true}
                        feedback={false}
                        {...field}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                    )}
                  />
                  <label htmlFor="userPwd" className={classNames({ 'p-error': loginUseForm.formState.errors.userPwd })}>Password</label>
                </span>
                {displayLoginFormFieldErrorMessage(loginUseForm.formState.errors.userPwd)}
              </div>
              <Button type="submit" label="Login" className="p-mt-2" />
              {isLoginSuccessful === false && !isCallingApi &&
                <div className="card">
                  <Divider />
                  <span className="p-error">Login failed.</span>
                </div>
              }      
            </form>
          </div>
        </div>
      }
      {isCallingApi && <Loading show={true} /> }
    </div>
  );
}
