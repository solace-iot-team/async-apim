import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import { Dialog } from 'primereact/dialog';

import { AuthHelper } from '../auth/AuthHelper';
import { TApiCallState } from "../utils/ApiCallState";
import { EAppState, EUICommonResourcePaths, Globals } from '../utils/Globals';
import { UserContext } from '../components/UserContextProvider/UserContextProvider';
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { TUserLoginCredentials } from '../components/UserLogin/UserLogin';
import { SelectOrganization, CALL_STATE_ACTIONS as SelectOrganizationCallStateActions } from '../components/SelectOrganization/SelectOrganization';
import { UserLogin } from '../components/UserLogin/UserLogin';
import { ConfigContext } from '../components/ConfigContextProvider/ConfigContextProvider';
import { APHealthCheckContext } from '../components/APHealthCheckContextProvider';
import { EAPHealthCheckSuccess } from '../utils/APHealthCheck';

export const UserLoginPage: React.FC = () => {
  const componentName = 'UserLoginPage';

  const [userLoginCredentials, setUserLoginCredentials] = React.useState<TUserLoginCredentials>();
  const location = useLocation<TUserLoginCredentials>();
  const history = useHistory();
  const [showUserLogin, setShowUserLogin] = React.useState<boolean>(false);
  const [isLoginSuccess, setIsLoginSuccess] = React.useState<boolean | null>(null);
  const [showSelectOrganizationDialog, setShowSelectOrganizationDialog] = React.useState<boolean>(false);
  const [isFinished, setIsFinished] = React.useState<boolean>(false);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [healthCheckContext] = React.useContext(APHealthCheckContext);
  const [configContext] = React.useContext(ConfigContext);
  const [authContext] = React.useContext(AuthContext);

  const navigateTo = (path: string): void => { history.push(path); }

  const successfulLoginSetup = (): void => {
    const funcName = 'successfulLoginSetup';
    const logName = `${componentName}.${funcName}()`;
    let originAppState: EAppState = userContext.originAppState;
    let newCurrentAppState: EAppState = userContext.currentAppState;

    // DEBUG
    // check contexts
    // alert(`${logName}: authContext = >${JSON.stringify(authContext, null, 2)}`);
    // alert(`${logName}: configContext.connector=${JSON.stringify(configContext.connector, null, 2)}`);
    // alert(`${logName}: healthCheckContext.connectorHealthCheckResult.summary=${JSON.stringify(healthCheckContext.connectorHealthCheckResult?.summary, null, 2)}`);
    if(
      (configContext.connector === undefined) || 
      (healthCheckContext.connectorHealthCheckResult && healthCheckContext.connectorHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL)
    ) {
      // no access to admin portal ==> redirect to system unavailable
      if(!AuthHelper.isAuthorizedToAccessAdminPortal(authContext.authorizedResourcePathsAsString)) {
        navigateTo(EUICommonResourcePaths.HealthCheckView);
        return;
      }
    }

    if(userContext.currentAppState !== EAppState.UNDEFINED) {
      newCurrentAppState = userContext.currentAppState;
      // catch state management errors
      if(originAppState === EAppState.UNDEFINED) throw new Error(`${logName}: orginAppState is undefined, currentAppState=${newCurrentAppState}`);
    } else {
      // came directly to /login url
      // if access to admin portal ==> admin portal, if access to developer portal ==> developer portal, if no access ==> developer portal
      if(AuthHelper.isAuthorizedToAccessAdminPortal(authContext.authorizedResourcePathsAsString)) {
        originAppState = EAppState.ADMIN_PORTAL; 
        newCurrentAppState = EAppState.ADMIN_PORTAL;
      } else if(AuthHelper.isAuthorizedToAccessDeveloperPortal(authContext.authorizedResourcePathsAsString)) {
        originAppState = EAppState.DEVELOPER_PORTAL; 
        newCurrentAppState = EAppState.DEVELOPER_PORTAL;
      } else {
        originAppState = EAppState.DEVELOPER_PORTAL; 
        newCurrentAppState = EAppState.DEVELOPER_PORTAL;
        // throw new Error(`${logName}: user not authorized to access developer portal nor admin portal.\nauthContext=${JSON.stringify(authContext, null, 2)}\nuserContext=${JSON.stringify(userContext, null, 2)}`);
      }
    }
    // already logged in 
    // dispatchAuthContextAction({ type: 'SET_IS_LOGGED_IN' });
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
    // const funcName = 'useEffect([isFinished, authContext.authorizedResourcePathsAsString])';
    // const logName = `${componentName}.${funcName}()`;
    if(isFinished) {
      // alert(`${logName}: isFinished, authContext.authorizedResourcePathsAsString = ${JSON.stringify(authContext.authorizedResourcePathsAsString)}`);
      successfulLoginSetup();
    }
  }, [isFinished, authContext.authorizedResourcePathsAsString]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLoginSuccess = (apiCallStatus: TApiCallState) => {
    setIsLoginSuccess(true);
    setShowUserLogin(false);
    setShowSelectOrganizationDialog(true);
  }
  const onLoginError = (apiCallStatus: TApiCallState) => {
    setIsLoginSuccess(false);
  }
  
  const onSelectOrganizationSuccess = () => {
    setShowSelectOrganizationDialog(false);
    setIsFinished(true);
  }

  const onSelectOrganizationError = (apiCallStatus: TApiCallState) => {
    // const funcName = 'onSelectOrganizationError';
    // const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: starting ...`)

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
    }});
    setShowSelectOrganizationDialog(false);
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
          visible={showSelectOrganizationDialog}
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

