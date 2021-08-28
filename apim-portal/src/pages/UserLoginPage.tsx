import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import { Dialog } from 'primereact/dialog';

import { SelectOrganization, CALL_STATE_ACTIONS as SelectOrganizationCallStateActions } from '../components/SelectOrganization/SelectOrganization';
import { UserLogin } from '../components/UserLogin/UserLogin';
import { TApiCallState } from "../utils/ApiCallState";
import { EUIResourcePaths } from '../utils/Globals';
import { UserContext } from '../components/UserContextProvider/UserContextProvider';
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { TUserLoginCredentials } from '../components/UserLogin/UserLogin';

export const UserLoginPage: React.FC = () => {
  // const componentName = 'UserLoginPage';

  const [userLoginCredentials, setUserLoginCredentials] = React.useState<TUserLoginCredentials>();
  const location = useLocation<TUserLoginCredentials>();
  const history = useHistory();
  const [showUserLogin, setShowUserLogin] = React.useState<boolean>(false);
  const [isLoginSuccess, setIsLoginSuccess] = React.useState<boolean | null>(null);
  const [isOrganizationSelectFinished, setIsOrganizationSelectFinished] = React.useState<boolean>(false);
  const [isFinished, setIsFinished] = React.useState<boolean>(false);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */

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
      dispatchAuthContextAction({ type: 'SET_IS_LOGGED_IN' });
      history.push({ pathname: EUIResourcePaths.UserHome });
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

