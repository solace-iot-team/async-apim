
import React from "react";
import { useHistory } from 'react-router-dom';

import { InputTextarea } from "primereact/inputtextarea";

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { EUICommonResourcePaths } from "../../utils/Globals";
import APContextsDisplayService from "../../displayServices/APContextsDisplayService";
import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import { UserContext } from "../APContextProviders/APUserContextProvider";
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";
import { SessionContext } from "../APContextProviders/APSessionContextProvider";

import "../APComponents.css";

export interface IApiCallStatusErrorProps {
  apiCallStatus: TApiCallState | null
}

export const ApiCallStatusError: React.FC<IApiCallStatusErrorProps> = (props: IApiCallStatusErrorProps) => {
  const ComponentName = 'ApiCallStatusError';

  const history = useHistory();
  const navigateHome = (): void => { history.push(EUICommonResourcePaths.Home); }
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [sessionContext, dispatchSessionContextAction] = React.useContext(SessionContext);

  const doLogoutThisUser = () => {
    navigateHome();
    APContextsDisplayService.clear_LoginContexts({
      dispatchAuthContextAction: dispatchAuthContextAction,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction,
      dispatchSessionContextAction: dispatchSessionContextAction,
    });
  }

  React.useEffect(() => {
    if(props.apiCallStatus === null) return;
    if(props.apiCallStatus.success) return;
    // console.log(`${ComponentName}: props.apiCallStatus=${JSON.stringify(props.apiCallStatus, null, 2)}`);
    if(props.apiCallStatus.isUnauthorizedError && props.apiCallStatus.isAPSApiError) {
      doLogoutThisUser();
    }
  }, [props.apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */


  return (
    <React.Fragment>
      {props.apiCallStatus && !props.apiCallStatus.success && 
        <React.Fragment>
          <div className="card p-fluid">
            {/* <Divider /> */}
            <div className="p-field">
              <InputTextarea 
                id="apiError" 
                value={ApiCallState.getUserErrorMessageFromApiCallState(props.apiCallStatus)} 
                // value={ApiCallState.getUserErrorMessageFromApiCallState(props.apiCallStatus) + ' ' +JSON.stringify(props.apiCallStatus, null, 2)} 
                className='p-invalid'
                style={{color: 'red', resize: 'none'}}
                rows={3}
                contentEditable={false}     
              />
            </div>
          </div>  
        </React.Fragment>
      }
    </React.Fragment>
  );
}


