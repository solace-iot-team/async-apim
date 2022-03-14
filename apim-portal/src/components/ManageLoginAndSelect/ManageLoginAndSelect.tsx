
import React from "react";
import { useLocation, useHistory } from 'react-router-dom';

import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./ManageLoginAndSelectCommon";
import { TApiCallState } from "../../utils/ApiCallState";
import { Loading } from "../Loading/Loading";
import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";
import { UserContext } from "../APContextProviders/APUserContextProvider";
import { APHealthCheckSummaryContext } from "../APHealthCheckSummaryContextProvider";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { TAPLoginUserDisplay, TAPUserLoginCredentials } from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { UserLogin } from "./UserLogin";
import { TAPEntityId, TAPEntityIdList } from "../../utils/APEntityIdsService";
import APMemberOfService from "../../displayServices/APUsersDisplayService/APMemberOfService";
import APRbacDisplayService from "../../displayServices/APRbacDisplayService";
import { APOrganizationsService } from "../../utils/APOrganizationsService";
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";

import '../APComponents.css';
import "./ManageLoginAndSelect.css";
import { AuthHelper } from "../../auth/AuthHelper";
import { EAppState, EUICommonResourcePaths, Globals } from "../../utils/Globals";
import { APSelectOrganization } from "../APSelectOrganization";
import { Dialog } from "primereact/dialog";
import APContextsDisplayService from "../../displayServices/APContextsDisplayService";

export interface IManageLoginAndSelectProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  userCredentials?: TAPUserLoginCredentials;
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
  const setPreviousComponentState = () => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: componentState.previousState
    });
  }

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
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
    const funcName = 'doSetupLoggedInUser';
    const logName = `${ComponentName}.${funcName}()`;

    dispatchUserContextAction({ type: 'SET_USER', apLoginUserDisplay: mo });

    await APContextsDisplayService.setup_Contexts({
      apLoginUserDisplay: mo,
      organizationEntityId: organizationEntityId,
      isConnectorAvailable: configContext.connector !== undefined && healthCheckSummaryContext.connectorHealthCheckSuccess !== EAPHealthCheckSuccess.FAIL,
      dispatchAuthContextAction: dispatchAuthContextAction,
      userContextCurrentAppState: userContext.currentAppState,
      userContextOriginAppState: userContext.originAppState,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction,
      navigateTo: navigateTo,
    });
  }

  const doInitialize = async () => {

    dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT' });
    dispatchUserContextAction({ type: 'CLEAR_USER_CONTEXT' });
    dispatchOrganizationContextAction({ type: 'CLEAR_ORGANIZATION_CONTEXT'});

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
    else if(componentState.currentState === E_COMPONENT_STATE.DONE) {
      setShowUserLogin(false);
      setShowSelectOrganization(false);
      alert('DONE...')
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

      <Loading show={isLoading} />      

      {showUserLogin &&
        <UserLogin
          onSuccess={onLoginSuccess}
          onError={onLoginError}
          userCredentials={props.userCredentials}
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
