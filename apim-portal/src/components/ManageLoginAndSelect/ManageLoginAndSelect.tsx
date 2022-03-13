
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
    const memberOfOrganizationEntityIdList: TAPEntityIdList = APMemberOfService.get_ApMemberOfOrganizationEntityIdList({
      apMemberOfOrganizationDisplayList: mo.apMemberOfOrganizationDisplayList,
    });
    dispatchUserContextAction({ type: 'SET_AVAILABLE_ORGANIZATION_ENTITY_ID_LIST', availableOrganizationEntityIdList: memberOfOrganizationEntityIdList});

    const authorizedResourcePathsAsString: string = await APRbacDisplayService.create_AuthorizedResourcePathListAsString({
      apLoginUserDisplay: mo,
      organizationId: organizationEntityId?.id
    });
    dispatchAuthContextAction({ type: 'SET_AUTH_CONTEXT', authContext: { 
      isLoggedIn: true, 
      authorizedResourcePathsAsString: authorizedResourcePathsAsString,
    }});

    if(organizationEntityId !== undefined) {
      dispatchUserContextAction({ type: 'SET_CURRENT_ORGANIZATION_ENTITY_ID', currentOrganizationEntityId: organizationEntityId });
      // only if connector is defined & healthy
      if(configContext.connector !== undefined && healthCheckSummaryContext.connectorHealthCheckSuccess !== EAPHealthCheckSuccess.FAIL) {
        dispatchOrganizationContextAction({ type: 'SET_ORGANIZATION_CONTEXT', organizationContext: await APOrganizationsService.getOrganization(organizationEntityId.id)});
      }
    }

    // setup the app
    if(configContext.connector === undefined || healthCheckSummaryContext.connectorHealthCheckSuccess !== EAPHealthCheckSuccess.FAIL) {
      // no access to admin portal ==> redirect to system unavailable
      if(!AuthHelper.isAuthorizedToAccessAdminPortal(authorizedResourcePathsAsString)) {
        navigateTo(EUICommonResourcePaths.HealthCheckView);
        return;
      }
    }

    let originAppState: EAppState = userContext.originAppState;
    let newCurrentAppState: EAppState = userContext.currentAppState;

    if(userContext.currentAppState !== EAppState.UNDEFINED) {
      newCurrentAppState = userContext.currentAppState;
      // catch state management errors
      if(originAppState === EAppState.UNDEFINED) throw new Error(`${logName}: orginAppState is undefined, currentAppState=${newCurrentAppState}`);
    } else {
      // came directly to /login url
      // if access to admin portal ==> admin portal, if access to developer portal ==> developer portal, if no access ==> developer portal
      if(AuthHelper.isAuthorizedToAccessAdminPortal(authorizedResourcePathsAsString)) {
        originAppState = EAppState.ADMIN_PORTAL; 
        newCurrentAppState = EAppState.ADMIN_PORTAL;
      } else if(AuthHelper.isAuthorizedToAccessDeveloperPortal(authorizedResourcePathsAsString)) {
        originAppState = EAppState.DEVELOPER_PORTAL; 
        newCurrentAppState = EAppState.DEVELOPER_PORTAL;
      } else {
        originAppState = EAppState.DEVELOPER_PORTAL; 
        newCurrentAppState = EAppState.DEVELOPER_PORTAL;
        // throw new Error(`${logName}: user not authorized to access developer portal nor admin portal.\nauthContext=${JSON.stringify(authContext, null, 2)}\nuserContext=${JSON.stringify(userContext, null, 2)}`);
      }
    }
    dispatchUserContextAction({ type: 'SET_ORIGIN_APP_STATE', appState: originAppState});
    dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: newCurrentAppState});
    navigateTo(Globals.getCurrentHomePath(true, newCurrentAppState));
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
    // const funcName = 'useEffect';
    // const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      // else {
      //   if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.xxxx) {
      //     props.onSuccess(apiCallStatus);
      //   }
      // }
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
        alert('showSelectOrganization')
        // availableOrganizationEntityIdList = 
        // const memberOfOrganizationEntityIdList: TAPEntityIdList = APMemberOfService.get_ApMemberOfOrganizationEntityIdList({
        //   apMemberOfOrganizationDisplayList: apLoginUserDisplay.apMemberOfOrganizationDisplayList,
        // });
    
      }


    </div>
  );
}
