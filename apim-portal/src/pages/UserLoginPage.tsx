import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import { Dialog } from 'primereact/dialog';

import { AuthHelper } from '../auth/AuthHelper';
import { TApiCallState } from "../utils/ApiCallState";
import { EAppState, Globals } from '../utils/Globals';
import { UserContext } from '../components/UserContextProvider/UserContextProvider';
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { ConfigContext } from '../components/ConfigContextProvider/ConfigContextProvider';
import { TUserLoginCredentials } from '../components/UserLogin/UserLogin';
import { SelectOrganization, CALL_STATE_ACTIONS as SelectOrganizationCallStateActions } from '../components/SelectOrganization/SelectOrganization';
import { UserLogin } from '../components/UserLogin/UserLogin';
import { CommonName } from '@solace-iot-team/apim-connector-openapi-browser';

export const UserLoginPage: React.FC = () => {
  const componentName = 'UserLoginPage';

  const [userLoginCredentials, setUserLoginCredentials] = React.useState<TUserLoginCredentials>();
  const location = useLocation<TUserLoginCredentials>();
  const history = useHistory();
  const [showUserLogin, setShowUserLogin] = React.useState<boolean>(false);
  const [isLoginSuccess, setIsLoginSuccess] = React.useState<boolean | null>(null);
  const [isOrganizationSelectFinished, setIsOrganizationSelectFinished] = React.useState<boolean>(false);
  const [isFinished, setIsFinished] = React.useState<boolean>(false);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [configContext] = React.useContext(ConfigContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const navigateTo = (path: string): void => { history.push(path); }

  const successfulLoginSetup = (): void => {
    const funcName = 'successfulLoginSetup';
    const logName = `${componentName}.${funcName}()`;
    let originAppState: EAppState = userContext.originAppState;
    let newCurrentAppState: EAppState = userContext.currentAppState;

    if(userContext.currentAppState !== EAppState.UNDEFINED) {
      newCurrentAppState = userContext.currentAppState;
      // catch state management errors
      if(originAppState === EAppState.UNDEFINED) throw new Error(`${logName}: orginAppState is undefined, currentAppState=${newCurrentAppState}`);
    } else {
      // came directly to /login url
      // if access to admin portal ==> admin portal, if access to developer portal ==> developer portal, if no access ==> Error
      if(AuthHelper.isAuthorizedToAccessAdminPortal(authContext.authorizedResourcePathsAsString)) {
        originAppState = EAppState.ADMIN_PORTAL; 
        newCurrentAppState = EAppState.ADMIN_PORTAL;
      } else if(AuthHelper.isAuthorizedToAccessDeveloperPortal(authContext.authorizedResourcePathsAsString)) {
        originAppState = EAppState.DEVELOPER_PORTAL; 
        newCurrentAppState = EAppState.DEVELOPER_PORTAL;
      } else {
        throw new Error(`${logName}: user not authorized to access developer portal nor admin portal.\nauthContext=${JSON.stringify(authContext, null, 2)}\nuserContext=${JSON.stringify(userContext, null, 2)}`);
      }
    }
    dispatchAuthContextAction({ type: 'SET_IS_LOGGED_IN' });
    dispatchUserContextAction({ type: 'SET_ORIGIN_APP_STATE', appState: originAppState});
    dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: newCurrentAppState});
    navigateTo(Globals.getCurrentHomePath(true, newCurrentAppState));
  }

  React.useEffect(() => {
    // const funcName = 'useEffect([])';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: location.state=${JSON.stringify(location.state)}`);
    if(location.state) {
      setUserLoginCredentials(location.state);
    }
    setShowUserLogin(true);
  }, [location.state]);

  React.useEffect(() => {
    if(isFinished) {
      successfulLoginSetup();
    }
  }, [isFinished]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLoginSuccess = (apiCallStatus: TApiCallState) => {
    setIsLoginSuccess(true);
    setShowUserLogin(false);
  }
  const onLoginError = (apiCallStatus: TApiCallState) => {
    setIsLoginSuccess(false);
  }
  
  const onSelectOrganizationSuccess = () => {
    // const funcName = 'onSelectOrganizationSuccess';
    // const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: userContext.user.memberOfOrganizations=${JSON.stringify(userContext.user.memberOfOrganizations, null, 2)}`);
    // alert(`${logName}: userContext.runtimeSettings=${JSON.stringify(userContext.runtimeSettings, null, 2)}`);
    dispatchAuthContextAction({ type: 'SET_AUTH_CONTEXT', authContext: { 
      isLoggedIn: true, 
      authorizedResourcePathsAsString: AuthHelper.getAuthorizedResourcePathListAsString(configContext, userContext),
    }});
    setIsOrganizationSelectFinished(true);
    setIsFinished(true);
  }

  const onSelectOrganizationError = (apiCallStatus: TApiCallState) => {
    // const funcName = 'onSelectOrganizationError';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: apiCallStatus = ${JSON.stringify(apiCallStatus, null, 2)}`);
    let userMessage: string;
    if(apiCallStatus.context.action === SelectOrganizationCallStateActions.NO_CONNECTOR_CONFIG) userMessage = 'cannot select organization (no connector configured)';
    else userMessage = apiCallStatus.context.userDetail?apiCallStatus.context.userDetail:'unknown error';

    dispatchUserContextAction({ type: 'SET_USER_MESSAGE', userMessage: {
      // TODO: should show a warning instead
      success: true,
      context: {
        internalAction: apiCallStatus.context.action,
        userAction: 'login',
        userMessage: userMessage
      }
    }})
    setIsOrganizationSelectFinished(true);
    setIsFinished(true);
  }

  return (
    <React.Fragment>
      {showUserLogin && 
        <UserLogin onSuccess={onLoginSuccess} onError={onLoginError} userCredentials={userLoginCredentials} />
      }
      {isLoginSuccess &&
        <Dialog 
          className="p-fluid"
          visible={!isOrganizationSelectFinished}
          style={{ width: '450px' }}
          modal
          onHide={() => {}}
          closable={false}
        >
          <SelectOrganization onSuccess={onSelectOrganizationSuccess} onError={onSelectOrganizationError} />
        </Dialog>
      }
    </React.Fragment>
  );
}

