
import React from "react";
import { useInterval } from 'react-use';
import { useLocation, useHistory } from 'react-router-dom';

import { SessionContext } from "../APContextProviders/APSessionContextProvider";

import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import APLoginUsersDisplayService, { TAPLoginUserDisplay } from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { APSSessionRefreshTokenResponse } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { EAppState, Globals } from "../../utils/Globals";
import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import APContextsDisplayService from "../../displayServices/APContextsDisplayService";
import { UserContext } from "../APContextProviders/APUserContextProvider";
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";
import { Loading } from "../Loading/Loading";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";

export interface UserSecRefreshProps {
  children: any;
}

export const UserSecRefresh: React.FC<UserSecRefreshProps> = (props: UserSecRefreshProps) => {
  const ComponentName = 'UserSecRefresh';

  const VerifyUserInterval_ms: number = 300000; // every 5 minutes
  // const VerifyUserInterval_ms: number = 5000; // every 5 seconds
  // const VerifyUserInterval_ms: number = 1000; // every 1 seconds (test health + refresh at same time)

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [sessionContext, dispatchSessionContextAction] = React.useContext(SessionContext);
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  const [configContext] = React.useContext(ConfigContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [areContextsInitialized, setAreContextsInitialized] = React.useState<boolean>(false);
  const [delay] = React.useState<number>(VerifyUserInterval_ms);
  const [runInterval, setRunInterval] = React.useState<boolean>(false);

  const location = useLocation();
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  
  const apiSetupLoginContexts = async({ userId, organizationId }: {
    userId: string;
    organizationId?: string;
  }): Promise<void> => {
    const funcName = 'apiSetupLoginContexts';
    const logName = `${ComponentName}.${funcName}()`;
    console.log(`${logName}: starting ...`);
    console.log(`${logName}: organizationId=${organizationId}`);

    const apLoginUserDisplay: TAPLoginUserDisplay  = await APLoginUsersDisplayService.apsGet_ApLoginUserDisplay( { userId: userId });
    // these contexts are not yet set, assuming connector is available, if not, it will be caught in next health check cycle
    // const isConnectorAvailable: boolean = configContext.connector !== undefined && healthCheckSummaryContext.connectorHealthCheckSuccess !== EAPHealthCheckSuccess.FAIL;
    const isConnectorAvailable: boolean = true;
    const userContextCurrentAppState: EAppState = Globals.get_CurrentAppState_From_Path({ path: location.pathname });
    const userContextOriginAppState: EAppState = EAppState.ADMIN_PORTAL;

    console.log(`${logName}: TODO: do i need the origin app state?`);

    await APContextsDisplayService.setup_RefreshContexts({
      apLoginUserDisplay: apLoginUserDisplay,
      organizationId: organizationId,
      isConnectorAvailable: isConnectorAvailable,
      userContextCurrentAppState: userContextCurrentAppState,
      userContextOriginAppState: userContextOriginAppState,
      dispatchAuthContextAction: dispatchAuthContextAction,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction,
      navigateTo: navigateTo,
      navigateToPath: location.pathname
    });
    dispatchUserContextAction({ type: 'SET_USER', apLoginUserDisplay: apLoginUserDisplay });

  }

  const apiVerifyUser = async(): Promise<void> => {
    const funcName = 'apiVerifyUser';
    const logName = `${ComponentName}.${funcName}()`;
    console.log(`${logName}: starting ...`);
    try {
      await APSClientOpenApi.lockToken4Refresh();
      const apsSessionRefreshTokenResponse: APSSessionRefreshTokenResponse = await APLoginUsersDisplayService.apsSecRefreshToken();
      // alert(`${logName}: apsSessionRefreshTokenResponse=${JSON.stringify(apsSessionRefreshTokenResponse, null, 2)}`);
      if(apsSessionRefreshTokenResponse.success) {
        // alert(`${logName}: apsSessionRefreshTokenResponse.token=${apsSessionRefreshTokenResponse.token}`);
        // alert(`${logName}: location.pathname=${location.pathname}`);
        dispatchSessionContextAction({ type: 'SET_SESSION_CONTEXT', apSessionContext: {
          apsApiToken: apsSessionRefreshTokenResponse.token,
          organizationId: apsSessionRefreshTokenResponse.organizationId,
        }});
        // set up all the contexts on page refresh
        if(!authContext.isLoggedIn) {
          await apiSetupLoginContexts({ userId: apsSessionRefreshTokenResponse.userId, organizationId: apsSessionRefreshTokenResponse.organizationId });
        }
        setRunInterval(true);
      } else {
        setRunInterval(false);
        dispatchSessionContextAction({ type: 'CLEAR_SESSION_CONTEXT' });
        dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT'});
      }
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      setRunInterval(false);
      dispatchSessionContextAction({ type: 'CLEAR_SESSION_CONTEXT' });
      dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT'});
    } finally {
      await APSClientOpenApi.unlockToken4Refresh();
    }
  }

  const isPageRefresh = (): boolean => {
    if(!authContext.isLoggedIn && !configContext.isInitialized) return true;
    return false;
  }

  const doVerifyUser = async() => {
    if(isPageRefresh()) setIsLoading(true);
    await apiVerifyUser();
    setIsLoading(false);
  }

  React.useEffect(() => {
    doVerifyUser();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(authContext.isLoggedIn) setRunInterval(true);
  }, [authContext.isLoggedIn]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // console.log(`${ComponentName}: triggering on contexts ...`);
    // console.log(`${ComponentName}: isLoading=${isLoading}, configContext.isInitialized=${configContext.isInitialized}, healthCheckSummaryContext.connectorHealthCheckSuccess=${healthCheckSummaryContext.connectorHealthCheckSuccess}`);
    if(isLoading) return;
    if(!configContext.isInitialized) return;
    setAreContextsInitialized(true);
  }, [configContext, isLoading]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useInterval( () => 
    {
      doVerifyUser();
    },
    runInterval ? delay : null
  );

  const renderChildren = () => {
    return (
      <React.Fragment>
        { props.children }
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>

      <Loading show={isLoading} />

      { areContextsInitialized && renderChildren() }

    </React.Fragment>
  );
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

