
import React from "react";

import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId, TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { Globals } from "../../../../utils/Globals";
import APSystemUsersDisplayService, { 
  TAPSystemUserDisplay 
} from "../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { EAction, E_CALL_STATE_ACTIONS, E_COMPONENT_STATE_NEW_USER } from "../ManageSystemUsersCommon";
import { TAPUserActivationDisplay, TAPUserAuthenticationDisplay, TAPUserProfileDisplay } from "../../../../displayServices/APUsersDisplayService/APUsersDisplayService";
import { EditNewSystemUserProfile } from "./EditNewSystemUserProfile";
import { EditNewSystemUserAuthentication } from "./EditNewSystemUserAuthentication";
import { EditNewSystemUserActivationStatus } from "./EditNewSystemUserActivationStatus";
import { NewSystemUserReviewAndCreate } from "./NewSystemUserReviewAndCreate";
import { EditNewSystemUserSystemRoles } from "./EditNewSystemUserSystemRoles";

import '../../../../components/APComponents.css';
import "../ManageSystemUsers.css";

export interface INewSystemUserProps {
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState, newUserEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const NewSystemUser: React.FC<INewSystemUserProps> = (props: INewSystemUserProps) => {
  const ComponentName = 'NewSystemUser';

  type TManagedObject = TAPSystemUserDisplay;

  type TComponentState = {
    previousState: E_COMPONENT_STATE_NEW_USER,
    currentState: E_COMPONENT_STATE_NEW_USER
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE_NEW_USER.UNDEFINED,
    currentState: E_COMPONENT_STATE_NEW_USER.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE_NEW_USER) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  const setPreviousComponentState = () => {
    const funcName = 'setPreviousComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    switch(componentState.currentState) {
      case E_COMPONENT_STATE_NEW_USER.UNDEFINED:
      case E_COMPONENT_STATE_NEW_USER.PROFILE:
        return;
      case E_COMPONENT_STATE_NEW_USER.AUTHENTICATION:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.PROFILE);
      case E_COMPONENT_STATE_NEW_USER.SYSTEM_ROLES:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.AUTHENTICATION);
      case E_COMPONENT_STATE_NEW_USER.ACTIVATION:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.SYSTEM_ROLES);
      case E_COMPONENT_STATE_NEW_USER.REVIEW:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.ACTIVATION);
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }

  const setNextComponentState = () => {
    const funcName = 'setNextComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    switch(componentState.currentState) {
      case E_COMPONENT_STATE_NEW_USER.UNDEFINED:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.PROFILE);
      case E_COMPONENT_STATE_NEW_USER.PROFILE:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.AUTHENTICATION);
      case E_COMPONENT_STATE_NEW_USER.AUTHENTICATION:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.SYSTEM_ROLES);
      case E_COMPONENT_STATE_NEW_USER.SYSTEM_ROLES:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.ACTIVATION);
      case E_COMPONENT_STATE_NEW_USER.ACTIVATION:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.REVIEW);
      case E_COMPONENT_STATE_NEW_USER.REVIEW:
        return;
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }

  const ComponentState2TabIndexMap = new Map<E_COMPONENT_STATE_NEW_USER, number>([
    [E_COMPONENT_STATE_NEW_USER.PROFILE, 0],
    [E_COMPONENT_STATE_NEW_USER.AUTHENTICATION, 1],
    [E_COMPONENT_STATE_NEW_USER.SYSTEM_ROLES, 2],
    [E_COMPONENT_STATE_NEW_USER.ACTIVATION, 3],
    [E_COMPONENT_STATE_NEW_USER.REVIEW, 4]
  ]);

  const setActiveTabIndexByComponentState = (state: E_COMPONENT_STATE_NEW_USER) => {
    const funcName = 'setActiveTabIndexByComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    const idx = ComponentState2TabIndexMap.get(state);
    if(idx === undefined) throw new Error(`${logName}: idx === undefined, state=${state}`);
    setTabActiveIndex(idx);
  }

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showProfile, setShowProfile] = React.useState<boolean>(false);
  const [showAuthentication, setShowAuthentication] = React.useState<boolean>(false);
  const [showSystemRoles, setShowSystemRoles] = React.useState<boolean>(false);
  const [showActivation, setShowActivation] = React.useState<boolean>(false);
  const [showReview, setShowReview] = React.useState<boolean>(false);

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_USER, `create empty user`);
    try { 
      const emptyUser: TAPSystemUserDisplay = await APSystemUsersDisplayService.create_Empty_ApSystemUserDisplay();
      setManagedObject(emptyUser);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_USER, `create user: ${mo.apEntityId.id}`);
    try { 
      await APSystemUsersDisplayService.apsCreate_ApSystemUserDisplay({
        apSystemUserDisplay: mo
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
    setNewComponentState(E_COMPONENT_STATE_NEW_USER.PROFILE);  
  }

  const doCreateUser = async(mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiCreateManagedObject(mo);
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: 'New User'
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_USER) {
          if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
          props.onSaveSuccess(apiCallStatus, managedObject.apEntityId);
        }
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const calculateShowStates = (componentState: TComponentState) => {
    if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.UNDEFINED) {
      setShowProfile(false);
      setShowAuthentication(false);
      setShowSystemRoles(false);
      setShowActivation(false);
      setShowReview(false);
      return;
    }
    if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.PROFILE) {
      setShowProfile(true);
      setShowAuthentication(false);
      setShowSystemRoles(false);
      setShowActivation(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.AUTHENTICATION) {
      setShowProfile(false);
      setShowAuthentication(true);
      setShowSystemRoles(false);
      setShowActivation(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.SYSTEM_ROLES) {
      setShowProfile(false);
      setShowAuthentication(false);
      setShowSystemRoles(true);
      setShowActivation(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.ACTIVATION) {
      setShowProfile(false);
      setShowAuthentication(false);
      setShowSystemRoles(false);
      setShowActivation(true);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.REVIEW) {
      setShowProfile(false);
      setShowAuthentication(false);
      setShowSystemRoles(false);
      setShowActivation(false);
      setShowReview(true);
    }
    // set the tabIndex
    setActiveTabIndexByComponentState(componentState.currentState);
  }

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onSaveUserProfile = (apUserProfileDisplay: TAPUserProfileDisplay) => {
    const funcName = 'onSaveUserProfile';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const newMo: TManagedObject = APSystemUsersDisplayService.set_ApUserProfileDisplay({
      apUserDisplay: managedObject,
      apUserProfileDisplay: apUserProfileDisplay,
    }) as TAPSystemUserDisplay;
    setManagedObject(newMo);
    setNextComponentState();
  }

  const onSaveUserAuthentication = (apUserAuthenticationDisplay: TAPUserAuthenticationDisplay) => {
    const funcName = 'onSaveUserAuthentication';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const newMo: TManagedObject = APSystemUsersDisplayService.set_ApUserAuthenticationDisplay({
      apUserDisplay: managedObject,
      apUserAuthenticationDisplay: apUserAuthenticationDisplay,
    }) as TAPSystemUserDisplay;
    setManagedObject(newMo);
    setNextComponentState();
  }

  const onSaveUserSystemRoles = (apSystemRoleEntityIdList: TAPEntityIdList) => {
    const funcName = 'onSaveUserSystemRoles';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const newMo: TManagedObject = APSystemUsersDisplayService.set_ApSystemRoleEntityIdList({
      apUserDisplay: managedObject,
      apSystemRoleEntityIdList: apSystemRoleEntityIdList,
    }) as TAPSystemUserDisplay;
    setManagedObject(newMo);
    setNextComponentState();
  }

  const onSaveUserActivationStatus = (apUserActivationDisplay: TAPUserActivationDisplay) => {
    const funcName = 'onSaveUserActivationStatus';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const newMo: TManagedObject = APSystemUsersDisplayService.set_ApUserActivationDisplay({
      apUserDisplay: managedObject,
      apUserActivationDisplay: apUserActivationDisplay,
    }) as TAPSystemUserDisplay;
    setManagedObject(newMo);
    setNextComponentState();
  }

  const onBack = () => {
    setPreviousComponentState();
  }

  const onCreateUser = (apSystemUserDisplay: TAPSystemUserDisplay) => {
    doCreateUser(apSystemUserDisplay);
  }

  const renderComponent = (mo: TManagedObject) => {

    return (
      <React.Fragment>
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Profile' disabled={!showProfile}>
            <React.Fragment>
              <EditNewSystemUserProfile
                action={EAction.NEW}
                apSystemUserDisplay={mo}
                onSave={onSaveUserProfile}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Authentication' disabled={!showAuthentication}>
            <React.Fragment>
              <EditNewSystemUserAuthentication
                action={EAction.NEW}
                apSystemUserDisplay={mo}
                onSave={onSaveUserAuthentication}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='System Roles' disabled={!showSystemRoles}>
            <React.Fragment>
              <EditNewSystemUserSystemRoles
                action={EAction.NEW}
                apSystemUserDisplay={mo}
                onSave={onSaveUserSystemRoles}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Activation Status' disabled={!showActivation}>
            <React.Fragment>
              <EditNewSystemUserActivationStatus
                action={EAction.NEW}
                apSystemUserDisplay={mo}
                onSave={onSaveUserActivationStatus}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Review & Create' disabled={!showReview}>
            <React.Fragment>
              <NewSystemUserReviewAndCreate
                apSystemUserDisplay={mo}
                onCreate={onCreateUser}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }

  return (
    <div className="manage-users">

      <APComponentHeader header={`Create New User`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObject && renderComponent(managedObject) }

    </div>
  );
}
