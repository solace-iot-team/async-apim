
import React from "react";
import { useHistory } from 'react-router-dom';

import { Dialog } from "primereact/dialog";

import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./ManageLoginAndSelectCommon";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";
import { UserContext } from "../APContextProviders/APUserContextProvider";
import { APHealthCheckSummaryContext } from "../APHealthCheckSummaryContextProvider";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { TAPSecLoginUserResponse } from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { TAPEntityId, TAPEntityIdList } from "../../utils/APEntityIdsService";
import APMemberOfService from "../../displayServices/APUsersDisplayService/APMemberOfService";
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";
import { APSelectOrganization } from "../APSelectOrganization";
import APContextsDisplayService from "../../displayServices/APContextsDisplayService";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { Loading } from "../Loading/Loading";
import { UserSecLogin } from "./UserSecLogin";
import { SessionContext } from "../APContextProviders/APSessionContextProvider";

import '../APComponents.css';
import "./ManageLoginAndSelect.css";

export interface IManageSecLoginAndSelectProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
}

export const ManageSecLoginAndSelect: React.FC<IManageSecLoginAndSelectProps> = (props: IManageSecLoginAndSelectProps) => {
  const ComponentName = 'ManageSecLoginAndSelect';

  type TManagedObject = TAPSecLoginUserResponse;

  type TComponentState = {
    previousState: E_COMPONENT_STATE,
    currentState: E_COMPONENT_STATE
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE.UNDEFINED,
    currentState: E_COMPONENT_STATE.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  const [sessionContext, dispatchSessionContextAction] = React.useContext(SessionContext);
  const [configContext] = React.useContext(ConfigContext);
  const [healthCheckSummaryContext] = React.useContext(APHealthCheckSummaryContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  
  const [showUserLogin, setShowUserLogin] = React.useState<boolean>(false);
  const [showSelectOrganization, setShowSelectOrganization] = React.useState<boolean>(false);

  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }

  const apiSetupLoginContexts = async(mo: TManagedObject, organizationEntityId: TAPEntityId | undefined): Promise<TApiCallState> => {
    const funcName = 'apiSetupLoginContexts';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_SETUP_LOGIN_CONTEXTS, `setup user: ${mo.apLoginUserDisplay.apEntityId.id}`);
    try { 
      await APContextsDisplayService.setup_LoginContexts({
        apLoginUserDisplay: mo.apLoginUserDisplay,
        apSessionContext: { apsApiToken: mo.apsApitoken, organizationId: mo.lastOrganizationId },
        organizationEntityId: organizationEntityId,
        isConnectorAvailable: configContext.connector !== undefined && healthCheckSummaryContext.connectorHealthCheckSuccess !== EAPHealthCheckSuccess.FAIL,
        dispatchAuthContextAction: dispatchAuthContextAction,
        userContextCurrentAppState: userContext.currentAppState,
        userContextOriginAppState: userContext.originAppState,
        dispatchUserContextAction: dispatchUserContextAction,
        dispatchOrganizationContextAction: dispatchOrganizationContextAction,
        dispatchSessionContextAction: dispatchSessionContextAction,
        navigateTo: navigateTo,
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doSetupLoggedInUser = async (mo: TManagedObject, organizationEntityId: TAPEntityId | undefined) => {
    setIsLoading(true);
    await apiSetupLoginContexts(mo, organizationEntityId);
    dispatchUserContextAction({ type: 'SET_USER', apLoginUserDisplay: mo.apLoginUserDisplay });
    setIsLoading(false);
  }

  const doInitialize = async () => {
    APContextsDisplayService.clear_LoginContexts({
      dispatchAuthContextAction: dispatchAuthContextAction,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction,
      dispatchSessionContextAction: dispatchSessionContextAction,
    });
    setNewComponentState(E_COMPONENT_STATE.LOGIN_SCREEN);
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // const funcName = 'useEffect[managedObject]';
    // const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) return;
    const memberOfOrganizationEntityIdList: TAPEntityIdList = APMemberOfService.get_ApMemberOfOrganizationEntityIdList({
      apMemberOfOrganizationDisplayList: managedObject.apLoginUserDisplay.apMemberOfOrganizationDisplayList,
    });
    if(memberOfOrganizationEntityIdList.length === 0) {
      doSetupLoggedInUser(managedObject, undefined);
    } else if(memberOfOrganizationEntityIdList.length === 1) {
      doSetupLoggedInUser(managedObject, memberOfOrganizationEntityIdList[0]);
    } else {
      setNewComponentState(E_COMPONENT_STATE.SELECT_ORGANIZATION);        
    }  
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) {
        setNewComponentState(E_COMPONENT_STATE.UNDEFINED);
        setIsLoading(false);
        props.onError(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const calculateShowStates = (componentState: TComponentState) => {
    if(componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowUserLogin(false);
      setShowSelectOrganization(false);
      return;
    }
    if(componentState.currentState === E_COMPONENT_STATE.LOGIN_SCREEN) {
      setShowUserLogin(true);
      setShowSelectOrganization(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.SELECT_ORGANIZATION) {
      setShowUserLogin(false);
      setShowSelectOrganization(true);
    }
  }

  const onLoginSuccess = (apSecLoginUserResponse: TAPSecLoginUserResponse) => {
    setManagedObject(apSecLoginUserResponse);
  }

  const onLoginError = (apiCallStatus: TApiCallState) => {
    // alert(`${ComponentName}.onLoginError(): errorororororor`)
    setManagedObject(undefined);
    props.onError(apiCallStatus);
  }

  const onSelectOrganizationSuccess = (organizationEntityId: TAPEntityId) => {
    const funcName = 'onSelectOrganizationSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    // alert(`${logName}: organizationEntityId = ${JSON.stringify(organizationEntityId, null, 2)}`);
    doSetupLoggedInUser(managedObject, organizationEntityId);
  }

  return (
    <div className="user-login">

      <Loading show={isLoading} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {showUserLogin &&
        <UserSecLogin
          onSuccess={onLoginSuccess}
          onError={onLoginError}
          // onLoadingChange={props.onLoadingChange} 
          onLoadingChange={setIsLoading} 
        />
      }

      {showSelectOrganization && managedObject &&
        <Dialog 
          className="p-fluid"
          visible={showSelectOrganization}
          style={{ width: '450px' }}
          modal
          onHide={() => {}}
          closable={false}
        >
          <APSelectOrganization
            apMemberOfOrganizationEntityIdList={APMemberOfService.get_ApMemberOfOrganizationEntityIdList({
              apMemberOfOrganizationDisplayList: managedObject.apLoginUserDisplay.apMemberOfOrganizationDisplayList,
            })}
            onSuccess={onSelectOrganizationSuccess} 
          />
        </Dialog>
      }

    </div>
  );
}
