
import React from "react";

import { MenuItem } from "primereact/api";

import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { TApiCallState } from "../../../../utils/ApiCallState";
import { E_COMPONENT_STATE_ADD_USER } from "../ManageOrganizationUsersCommon";
import { ListSystemUsers } from "./ListSystemUsers";
import { TAPSystemUserDisplay } from "../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { AddOrganizationUserRolesAndGroups } from "./AddOrganizationUserRolesAndGroups";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface IAddOrganizationUserProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState, addedUserEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const AddOrganizationUser: React.FC<IAddOrganizationUserProps> = (props: IAddOrganizationUserProps) => {
  // const componentName = 'AddOrganizationUser';

  type TComponentState = {
    previousState: E_COMPONENT_STATE_ADD_USER,
    currentState: E_COMPONENT_STATE_ADD_USER
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE_ADD_USER.UNDEFINED,
    currentState: E_COMPONENT_STATE_ADD_USER.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE_ADD_USER) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showRolesAndGroupsComponent, setShowRolesAndGroupsComponent] = React.useState<boolean>(false);
  const [systemUserToAdd, setSystemUserToAdd] = React.useState<TAPSystemUserDisplay>();

  // * useEffect Hooks *

  React.useEffect(() => {
    const item: MenuItem = {
      label: 'Add User'
    }
    setBreadCrumbItemList([item]);
    setNewComponentState(E_COMPONENT_STATE_ADD_USER.SYSTEM_USER_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    props.setBreadCrumbItemList(breadCrumbItemList);
  }, [breadCrumbItemList]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * prop callbacks *

  const onSubComponentAddBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
    props.setBreadCrumbItemList(newItemList);
  }

  const onSelectUserToAdd = (selected_ApSystemUserDisplay: TAPSystemUserDisplay) => {
    setSystemUserToAdd(selected_ApSystemUserDisplay);
    setNewComponentState(E_COMPONENT_STATE_ADD_USER.EDIT_USER_ROLES_AND_GROUPS);
  }

  const onAddUserSuccess = (apiCallState: TApiCallState, addedUserEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    props.onSuccess(apiCallState, addedUserEntityId);
  }

  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const calculateShowStates = (componentState: TComponentState) => {
    if(!componentState.currentState) {
      setShowListComponent(false);
      setShowRolesAndGroupsComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_ADD_USER.SYSTEM_USER_LIST_VIEW) {
      setShowListComponent(true);
      setShowRolesAndGroupsComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_ADD_USER.EDIT_USER_ROLES_AND_GROUPS) {
      setShowListComponent(false);
      setShowRolesAndGroupsComponent(true);
    }
  }

  return (
    <div className="manage-users">

      {/* <Loading show={isLoading} />       */}
      
      {/* {!isLoading && renderToolbar() } */}

      {showListComponent && 
        <ListSystemUsers
          excludeOrganizationEntityId={props.organizationEntityId}
          onError={onSubComponentError} 
          onSelectUser={onSelectUserToAdd}
          onCancel={props.onCancel}
          onLoadingChange={props.onLoadingChange} 
        />
      }
      { showRolesAndGroupsComponent && systemUserToAdd &&
        <AddOrganizationUserRolesAndGroups
          apSystemUserDisplay={systemUserToAdd}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onAddUserSuccess}
          onError={onSubComponentError}
          onCancel={props.onCancel}
          onLoadingChange={props.onLoadingChange}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        />
      
      }
    </div>
  );
}
