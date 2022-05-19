
import React from "react";
import { useInterval } from 'react-use';
import { useLocation, useHistory } from 'react-router-dom';

import { SessionContext } from "../APContextProviders/APSessionContextProvider";

import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import APLoginUsersDisplayService from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { APSSessionRefreshTokenResponse } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { EUICommonResourcePaths } from "../../utils/Globals";

export interface IUserSecVerifyProps {}

export const UserSecVerify: React.FC<IUserSecVerifyProps> = (props: IUserSecVerifyProps) => {
  const ComponentName = 'UserSecVerify';

  const VerifyUserInterval_ms: number = 300000; // every 5 minutes
  // const VerifyUserInterval_ms: number = 60000; // every minute
  // const VerifyUserInterval_ms: number = 10000; // every 10 seconds

  const [sessionContext, dispatchSessionContextAction] = React.useContext(SessionContext);
  const [delay] = React.useState<number>(VerifyUserInterval_ms); 
  const location = useLocation();
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  
  
  const apiVerifyUser = async(): Promise<void> => {
    const funcName = 'apiVerifyUser';
    const logName = `${ComponentName}.${funcName}()`;
    console.log(`${logName}: starting ...`);
    try { 
      const apsSessionRefreshTokenResponse: APSSessionRefreshTokenResponse = await APLoginUsersDisplayService.apsSecRefreshToken();
      // alert(`${logName}: apsSessionRefreshTokenResponse=${JSON.stringify(apsSessionRefreshTokenResponse, null, 2)}`);
      if(apsSessionRefreshTokenResponse.success) {
        // alert(`${logName}: apsSessionRefreshTokenResponse.token=${apsSessionRefreshTokenResponse.token}`);
        // alert(`${logName}: location.pathname=${location.pathname}`);
        dispatchSessionContextAction({ type: 'SET_SESSION_CONTEXT', apSessionContext: {
          apsApiToken: apsSessionRefreshTokenResponse.token,
        }});  
      } else {
        // alert(`${logName}: location.pathname=${location.pathname}`);
        if(location.pathname !== EUICommonResourcePaths.SecLogin) {
          dispatchSessionContextAction({ type: 'CLEAR_SESSION_CONTEXT' });
          navigateTo(EUICommonResourcePaths.GetLogin);
        }
      }
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      // dispatchSessionContextAction({ type: 'CLEAR_SESSION_CONTEXT' });
      // callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    // setApiCallStatus(callState);
    // return callState;
  }

  const doVerifyUser = async() => {
    await apiVerifyUser();
  }

  React.useEffect(() => {
    doVerifyUser();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useInterval( () => 
    {
      doVerifyUser();
    },
    delay
  );

  return (<></>);
}


// const verifyUser = React.useCallback(() => {
//   setIsLoading(true);
//   fetch(process.env.REACT_APP_API_ENDPOINT + "users/refreshToken", {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//   }).then(async response => {
//     if (response.ok) {
//       const data = await response.json();
//       dispatchUserContextAction({ type: 'SET_USER_TOKEN', token: data.token } );
//       // setUserContext(oldValues => {
//       //   return { ...oldValues, token: data.token }
//       // })
//     } else {
//       dispatchUserContextAction({ type: 'CLEAR_USER_TOKEN' } );
//       // setUserContext(oldValues => {
//       //   return { ...oldValues, token: null }
//       // })
//     }
//     // call refreshToken every 5 minutes to renew the authentication token.
//     // setTimeout(verifyUser, 5 * 60 * 1000);
//     setTimeout(verifyUser, 60 * 1000);
//     // setTimeout(verifyUser, 5 * 1000);
//   });
//   setIsLoading(false);
// }, [dispatchUserContextAction]);

// React.useEffect(() => {
//   verifyUser();
// }, []);

