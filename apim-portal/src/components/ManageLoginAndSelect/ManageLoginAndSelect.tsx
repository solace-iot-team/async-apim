
import React from "react";
import { useHistory } from 'react-router-dom';

import { Dialog } from "primereact/dialog";

import { E_COMPONENT_STATE } from "./ManageLoginAndSelectCommon";
import { TApiCallState } from "../../utils/ApiCallState";
import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";
import { UserContext } from "../APContextProviders/APUserContextProvider";
import { APHealthCheckSummaryContext } from "../APHealthCheckSummaryContextProvider";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { TAPLoginUserDisplay, TAPUserLoginCredentials } from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { UserLogin } from "./UserLogin";
import { TAPEntityId, TAPEntityIdList } from "../../utils/APEntityIdsService";
import APMemberOfService from "../../displayServices/APUsersDisplayService/APMemberOfService";
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";
import { APSelectOrganization } from "../APSelectOrganization";
import APContextsDisplayService from "../../displayServices/APContextsDisplayService";

import '../APComponents.css';
import "./ManageLoginAndSelect.css";

export interface IManageLoginAndSelectProps {
  userCredentials?: TAPUserLoginCredentials;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ManageLoginAndSelect: React.FC<IManageLoginAndSelectProps> = (props: IManageLoginAndSelectProps) => {
  const ComponentName = 'ManageLoginAndSelect';

  type TManagedObject = TAPLoginUserDisplay;

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

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  const [configContext] = React.useContext(ConfigContext);
  const [healthCheckSummaryContext] = React.useContext(APHealthCheckSummaryContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  
  const [showUserLogin, setShowUserLogin] = React.useState<boolean>(false);
  const [showSelectOrganization, setShowSelectOrganization] = React.useState<boolean>(false);

  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }

  const doSetupLoggedInUser = async (mo: TManagedObject, organizationEntityId: TAPEntityId | undefined) => {

    dispatchUserContextAction({ type: 'SET_USER', apLoginUserDisplay: mo });

    await APContextsDisplayService.setup_LoginContexts({
      apLoginUserDisplay: mo,
      organizationEntityId: organizationEntityId,
      isConnectorAvailable: configContext.connector !== undefined && healthCheckSummaryContext.connectorHealthCheckSuccess !== EAPHealthCheckSuccess.FAIL,
      dispatchAuthContextAction: dispatchAuthContextAction,
      userContextCurrentAppState: userContext.currentAppState,
      userContextOriginAppState: userContext.originAppState,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction,
      navigateTo: navigateTo,
      onLoadingChange: props.onLoadingChange
    });
  }

  const doInitialize = async () => {
    APContextsDisplayService.clear_LoginContexts({
      dispatchAuthContextAction: dispatchAuthContextAction,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction,
    });
    setNewComponentState(E_COMPONENT_STATE.LOGIN_SCREEN);
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
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

  const onLoginSuccess = (apLoginUserDisplay: TAPLoginUserDisplay) => {
    const memberOfOrganizationEntityIdList: TAPEntityIdList = APMemberOfService.get_ApMemberOfOrganizationEntityIdList({
      apMemberOfOrganizationDisplayList: apLoginUserDisplay.apMemberOfOrganizationDisplayList,
    });
    if(memberOfOrganizationEntityIdList.length === 0) {
      doSetupLoggedInUser(apLoginUserDisplay, undefined);
    } else if(memberOfOrganizationEntityIdList.length === 1) {
      doSetupLoggedInUser(apLoginUserDisplay, memberOfOrganizationEntityIdList[0]);
    } else {
      setManagedObject(apLoginUserDisplay);
      setNewComponentState(E_COMPONENT_STATE.SELECT_ORGANIZATION);        
    }
  }

  const onLoginError = (apiCallStatus: TApiCallState) => {
    setManagedObject(undefined);
    props.onError(apiCallStatus);
  }

  const onSelectOrganizationSuccess = (organizationEntityId: TAPEntityId) => {
    const funcName = 'onSelectOrganizationSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    doSetupLoggedInUser(managedObject, organizationEntityId);
  }

  return (
    <div className="user-login">

      {showUserLogin &&
        <UserLogin
          onSuccess={onLoginSuccess}
          onError={onLoginError}
          userCredentials={props.userCredentials}
          onLoadingChange={props.onLoadingChange} 
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
              apMemberOfOrganizationDisplayList: managedObject.apMemberOfOrganizationDisplayList,
            })}
            onSuccess={onSelectOrganizationSuccess} 
          />
        </Dialog>
      }

    </div>
  );
}
