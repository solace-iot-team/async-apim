
import React from "react";

import { E_CALL_STATE_ACTIONS } from "./ManageLoginAndSelectCommon";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { Loading } from "../Loading/Loading";
import { APSLoginInternal, ApsSessionService } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";

import '../APComponents.css';
import "./ManageLoginAndSelect.css";

export interface IManageGetLoginProps {
  onError: (apiCallState: TApiCallState) => void;
  onLoginInternal: () => void;
  // onSuccess: (apiCallState: TApiCallState) => void;
}

export const ManageGetLogin: React.FC<IManageGetLoginProps> = (props: IManageGetLoginProps) => {
  const ComponentName = 'ManageGetLogin';

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isLoading] = React.useState<boolean>(false);
  const [isLoginInternal, setIsLoginInternal] = React.useState<boolean>(false);

  // * Api Calls *
  const apiGetLogin = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetLogin';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_LOGIN, `get login`);
    try { 

      const apsLoginInternal: APSLoginInternal = await ApsSessionService.apsGetLogin();
      if(apsLoginInternal.loginInternal !== undefined && apsLoginInternal.loginInternal) setIsLoginInternal(true);

    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    // setIsLoading(true);
    await apiGetLogin();
    // setIsLoading(false);
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isLoginInternal) props.onLoginInternal();
  }, [isLoginInternal]); /* eslint-disable-line react-hooks/exhaustive-deps */


  return (
    <div className="user-login">

      <Loading show={isLoading} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

    </div>
  );
}
