
import React from "react";
import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE_NEW_USER } from "../ManageOrganizationUsersCommon";
import APUsersDisplayService, { 
  TAPUserDisplay 
} from "../../../../displayServices/APUsersDisplayService";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { EditOrganizationUserProfile } from "./EditOrganizationUserProfile";
import { EditOrganizationUserCredentails } from "./EditOrganizationUserCredentials";
import { EditOrganizationUserMemberOfBusinessGroups } from "./EditOrganizationUserMemberOfBusinessGroups";
import { EditOrganizationUserMemberOfOrganizationRoles } from "./EditOrganizationUserMemberOfOrganizationRoles";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

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
    setComponentState({
      previousState: componentState.currentState,
      currentState: componentState.previousState
    });
  }

// need a map from state to tabindex

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showProfile, setShowProfile] = React.useState<boolean>(false);
  const [showRolesAndGroups, setShowRolesAndGroups] = React.useState<boolean>(false);
  const [showCredentials, setShowCredentials] = React.useState<boolean>(false);
  const [showReview, setShowReview] = React.useState<boolean>(false);
  // const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  // * Api Calls *


  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: 'New User'
    }]);
    setNewComponentState(E_COMPONENT_STATE_NEW_USER.PROFILE);
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
    if(!componentState.currentState) {
      setShowProfile(false);
      setShowRolesAndGroups(false);
      setShowCredentials(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW_USER.PROFILE) {
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
  }

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  // const onError_EditOrganizationUserMemberOf = (apiCallState: TApiCallState) => {
  //   setApiCallStatus(apiCallState);
  //   props.onError(apiCallState);
  //   setRefreshCounter(refreshCounter + 1);
  // }

  // const onSaveSuccess_EditOrganizationUserMemberOf = (apiCallState: TApiCallState) => {
  //   props.onSaveSuccess(apiCallState);
  //   setRefreshCounter(refreshCounter + 1);
  // }

  const renderContent = () => {

    // map state to tabActiveIndex
    // disable the tabs based on showxxxx

    return (
      <React.Fragment>
        {/* <div className="p-mt-4"><b>Activated</b>: {String(mo.apsUserResponse.isActivated)}</div> */}

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Profile'>
            <React.Fragment>
              <p>Create profile: email, first, last and next</p>
              
              {/* <EditOrganizationUserProfile
                apUserDisplay={mo} 
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onSaveSuccess={props.onSaveSuccess}
                onLoadingChange={props.onLoadingChange}
              /> */}
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Roles & Groups' disabled>
            <React.Fragment>
              <p>Set the organization roles and group roles and back/next</p>
              {/* <EditOrganizationUserMemberOfOrganizationRoles
                key={`EditOrganizationUserMemberOfOrganizationRoles_${refreshCounter}`}
                organizationEntityId={props.organizationEntityId}
                apUserDisplay={mo}
                onError={onError_EditOrganizationUserMemberOf}
                onCancel={props.onCancel}
                onSaveSuccess={onSaveSuccess_EditOrganizationUserMemberOf}
                onLoadingChange={props.onLoadingChange}
              /> */}
              {/* <EditOrganizationUserMemberOfBusinessGroups
                key={`EditOrganizationUserMemberOfBusinessGroups_${refreshCounter}`}
                organizationEntityId={props.organizationEntityId}
                apUserDisplay={mo}
                onError={onError_EditOrganizationUserMemberOf}
                onCancel={props.onCancel}
                onSaveSuccess={onSaveSuccess_EditOrganizationUserMemberOf}
                onLoadingChange={props.onLoadingChange}
              /> */}
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Credentials'>
            <React.Fragment>
              <p>set the password and back/next</p>
              {/* <EditOrganizationUserCredentails
                apUserDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onSaveSuccess={props.onSaveSuccess}
                onLoadingChange={props.onLoadingChange}
              /> */}
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Review'>
            <React.Fragment>
              <p>review the user info and back or save</p>
              {/* <EditOrganizationUserCredentails
                apUserDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onSaveSuccess={props.onSaveSuccess}
                onLoadingChange={props.onLoadingChange}
              /> */}
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

      {renderContent()}

    </div>
  );
}
