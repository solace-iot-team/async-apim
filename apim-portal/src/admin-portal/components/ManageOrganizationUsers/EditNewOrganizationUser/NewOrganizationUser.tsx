
import React from "react";
import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { Globals } from "../../../../utils/Globals";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE_NEW_USER } from "../ManageOrganizationUsersCommon";
import APUsersDisplayService, { 
  TAPUserCredentialsDisplay,
  TAPUserDisplay, 
  TAPUserProfileDisplay 
} from "../../../../displayServices/old.APUsersDisplayService";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { NewOrganizationUserProfile } from "./NewOrganizationUserProfile";
import { NewOrganizationUserRolesAndGroups } from "./NewOrganizationUserRolesAndGroups";
import { NewOrganizationUserCredentials } from "./NewOrganizationUserCredentials";
import { NewOrganizationUserReviewAndCreate } from "./NewOrganizationUserReviewAndCreate";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from "../../../../displayServices/APBusinessGroupsDisplayService";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";

export interface INewOrganizationUserProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newUserEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const NewOrganizationUser: React.FC<INewOrganizationUserProps> = (props: INewOrganizationUserProps) => {
  const ComponentName = 'NewOrganizationUser';

  type TManagedObject = TAPUserDisplay;

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
      case E_COMPONENT_STATE_NEW_USER.ROLES_AND_GROUPS:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.PROFILE);
      case E_COMPONENT_STATE_NEW_USER.CREDENTIALS:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.ROLES_AND_GROUPS);
      case E_COMPONENT_STATE_NEW_USER.REVIEW:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.CREDENTIALS);
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
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.ROLES_AND_GROUPS);
      case E_COMPONENT_STATE_NEW_USER.ROLES_AND_GROUPS:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.CREDENTIALS);
      case E_COMPONENT_STATE_NEW_USER.CREDENTIALS:
        return setNewComponentState(E_COMPONENT_STATE_NEW_USER.REVIEW);
      case E_COMPONENT_STATE_NEW_USER.REVIEW:
        return;
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }

  const ComponentState2TabIndexMap = new Map<E_COMPONENT_STATE_NEW_USER, number>([
    [E_COMPONENT_STATE_NEW_USER.PROFILE, 0],
    [E_COMPONENT_STATE_NEW_USER.ROLES_AND_GROUPS, 1],
    [E_COMPONENT_STATE_NEW_USER.CREDENTIALS, 2],
    [E_COMPONENT_STATE_NEW_USER.REVIEW, 3]
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
  const [showRolesAndGroups, setShowRolesAndGroups] = React.useState<boolean>(false);
  const [showCredentials, setShowCredentials] = React.useState<boolean>(false);
  const [showReview, setShowReview] = React.useState<boolean>(false);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [completeOrganizationApBusinessGroupDisplayList, setCompleteOrganizationApBusinessGroupDisplayList] = React.useState<TAPBusinessGroupDisplayList>([]);

  // * Api Calls *

  const apiGetCompleteApBusinessGroupDisplayList = async(organizationId: string): Promise<TApiCallState> => {
    const funcName = 'apiGetCompleteApBusinessGroupDisplayList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_LIST, 'retrieve list of business groups');
    try {
      const list: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: organizationId
      });
      setCompleteOrganizationApBusinessGroupDisplayList(list);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetCompleteApBusinessGroupDisplayList(props.organizationEntityId.id);
    setManagedObject(await APUsersDisplayService.create_EmptyObject({ organizationId: props.organizationEntityId.id }));
    setNewComponentState(E_COMPONENT_STATE_NEW_USER.PROFILE);
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: 'New User'
    }]);
    doInitialize()
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
    if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.UNDEFINED) {
      setShowProfile(false);
      setShowRolesAndGroups(false);
      setShowCredentials(false);
      setShowReview(false);
      return;
    }
    if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.PROFILE) {
      setShowProfile(true);
      setShowRolesAndGroups(false);
      setShowCredentials(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.ROLES_AND_GROUPS) {
      setShowProfile(false);
      setShowRolesAndGroups(true);
      setShowCredentials(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.CREDENTIALS) {
      setShowProfile(false);
      setShowRolesAndGroups(false);
      setShowCredentials(true);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.REVIEW) {
      setShowProfile(false);
      setShowRolesAndGroups(false);
      setShowCredentials(false);
      setShowReview(true);
    }
    // set the tabIndex
    setActiveTabIndexByComponentState(componentState.currentState);
  }

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onNext_From_Profile = (apUserProfileDisplay: TAPUserProfileDisplay) => {
    const funcName = 'onNext_From_Profile';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    setManagedObject(APUsersDisplayService.set_ApUserProfileDisplay({ apUserDisplay: managedObject, apUserProfileDisplay: apUserProfileDisplay }));
    setNextComponentState();
  }

  const onNext_From_RolesAndGroups = (updatedApUserDisplay: TAPUserDisplay) => {
    const funcName = 'onNext_From_RolesAndGroups';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    setManagedObject(updatedApUserDisplay);
    // TODO: set the values in managedObject
    // setManagedObject(APUsersDisplayService.set_ApUserProfileDisplay({ apUserDisplay: managedObject, apUserProfileDisplay: apUserProfileDisplay }));
    setNextComponentState();
  }

  const onNext_From_Credentials = (apUserCredentialsDisplay: TAPUserCredentialsDisplay) => {
    const funcName = 'onNext_From_Profile';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    setManagedObject(APUsersDisplayService.set_ApUserCredentialsDisplay({ apUserDisplay: managedObject, apUserCredentialsDisplay: apUserCredentialsDisplay }));
    setNextComponentState();
  }

  const onBack = () => {
    setPreviousComponentState();
  }

  const onCreateSuccess = (apUserDisplay: TAPUserDisplay, apiCallState: TApiCallState) => {
    props.onNewSuccess(apiCallState, apUserDisplay.apEntityId);
  }

  const renderComponent = (mo: TManagedObject) => {

    return (
      <React.Fragment>
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Profile' disabled={!showProfile}>
            <React.Fragment>
              <NewOrganizationUserProfile
                organizationEntityId={props.organizationEntityId}
                apUserDisplay={mo}
                onNext={onNext_From_Profile}
                onBack={() => {}}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Roles & Groups' disabled={!showRolesAndGroups}>
            <React.Fragment>
              <NewOrganizationUserRolesAndGroups 
                organizationEntityId={props.organizationEntityId}
                apUserDisplay={mo}
                onNext={onNext_From_RolesAndGroups}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Credentials' disabled={!showCredentials}>
            <React.Fragment>
              <NewOrganizationUserCredentials
                organizationEntityId={props.organizationEntityId}
                apUserDisplay={mo}
                onNext={onNext_From_Credentials}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Review & Create' disabled={!showReview}>
            <React.Fragment>
              <NewOrganizationUserReviewAndCreate
                organizationEntityId={props.organizationEntityId}
                apUserDisplay={mo}
                completeOrganizationApBusinessGroupDisplayList={completeOrganizationApBusinessGroupDisplayList}
                onCreateSuccess={onCreateSuccess}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
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

      {managedObject && renderComponent(managedObject)}

      {/* DEBUG */}
      {managedObject && 
        <React.Fragment>
          <hr />
          <p><b>{ComponentName}:</b></p>
          <p><b>managedObject.apsUserResponse.profile=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.apsUserResponse.profile, null, 2)}
          </pre>
          <p><b>managedObject.apMemberOfOrganizationGroupsDisplayList=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.apMemberOfOrganizationGroupsDisplayList, null, 2)}
          </pre>
          <p><b>managedObject.apsUserResponse.memberOfOrganizationGroups=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.apsUserResponse.memberOfOrganizationGroups, null, 2)}
          </pre>
          <p><b>managedObject.apsUserResponse.password=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.apsUserResponse.password, null, 2)}
          </pre>
        </React.Fragment>
      }

    </div>
  );
}
