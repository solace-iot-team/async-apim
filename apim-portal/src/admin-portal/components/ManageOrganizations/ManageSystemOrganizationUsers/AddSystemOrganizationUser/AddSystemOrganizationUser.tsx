
import React from "react";

import { MenuItem } from "primereact/api";

import { TAPEntityId } from "../../../../../utils/APEntityIdsService";
import { TApiCallState } from "../../../../../utils/ApiCallState";
import { E_COMPONENT_STATE_ADD_USER } from "../../ManageOrganizationsCommon";
import { TAPSystemUserDisplay } from "../../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { ListSystemOrganizationUsersSystemUsers } from "./ListSystemOrganizationUsersSystemUsers";
import { AddSystemOrganizationUserRoles } from "./AddSystemOrganizationUserRoles";

import '../../../../../components/APComponents.css';
import "../../ManageOrganizations.css";

export interface IAddSystemOrganizationUserProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState, addedUserEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const AddSystemOrganizationUser: React.FC<IAddSystemOrganizationUserProps> = (props: IAddSystemOrganizationUserProps) => {
  const ComponentName = 'AddSystemOrganizationUser';

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
  // const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showRolesComponent, setShowRolesComponent] = React.useState<boolean>(false);
  const [systemUserToAdd, setSystemUserToAdd] = React.useState<TAPSystemUserDisplay>();

  // * useEffect Hooks *

  React.useEffect(() => {
    const item: MenuItem = {
      label: 'Add User'
    }
    props.setBreadCrumbItemList([item]);
    setNewComponentState(E_COMPONENT_STATE_ADD_USER.SYSTEM_USER_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   props.setBreadCrumbItemList(breadCrumbItemList);
  // }, [breadCrumbItemList]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * prop callbacks *

  // const onSubComponentAddBreadCrumbItemList = (itemList: Array<MenuItem>) => {
  //   const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
  //   props.setBreadCrumbItemList(newItemList);
  // }

  const onSelectUserToAdd = (selected_ApSystemUserDisplay: TAPSystemUserDisplay) => {
    setSystemUserToAdd(selected_ApSystemUserDisplay);
    setNewComponentState(E_COMPONENT_STATE_ADD_USER.EDIT_USER_ROLES);
  }

  const onAddUserRolesSuccess = (apiCallState: TApiCallState) => {
    const funcName = 'onAddUserRolesSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(systemUserToAdd === undefined) throw new Error(`${logName}: organizationUserToAdd === undefined`);
    setApiCallStatus(apiCallState);
    props.onSuccess(apiCallState, systemUserToAdd.apEntityId);
  }

  const onAddUserRolesCancel = () => {
    setNewComponentState(E_COMPONENT_STATE_ADD_USER.SYSTEM_USER_LIST_VIEW);
  }

  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const calculateShowStates = (componentState: TComponentState) => {
    if(!componentState.currentState) {
      setShowListComponent(false);
      setShowRolesComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_ADD_USER.SYSTEM_USER_LIST_VIEW) {
      setShowListComponent(true);
      setShowRolesComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_ADD_USER.EDIT_USER_ROLES) {
      setShowListComponent(true);
      setShowRolesComponent(true);
    }
  }

  return (
    <div className="manage-users">

      {showListComponent && 
        <ListSystemOrganizationUsersSystemUsers
          excludeOrganizationEntityId={props.organizationEntityId}
          onError={onSubComponentError} 
          onSelectUser={onSelectUserToAdd}
          onCancel={props.onCancel}
          onLoadingChange={props.onLoadingChange} 
        />
      }
      { showRolesComponent && systemUserToAdd &&
        <AddSystemOrganizationUserRoles
          organizationEntityId={props.organizationEntityId}
          apSystemUserDisplay={systemUserToAdd}
          onError={onSubComponentError}
          onAddSuccess={onAddUserRolesSuccess}
          onCancel={onAddUserRolesCancel}
          onLoadingChange={props.onLoadingChange}
        />
        // <EditSystemOrganizationUserRoles      
        //   organizationEntityId={props.organizationEntityId}
        //   userEntityId={organizationUserToAdd.apEntityId}
        //   onError={onSubComponentError}
        //   onSaveSuccess={onAddUserSuccess}
        //   onCancel={props.onCancel}
        //   onLoadingChange={props.onLoadingChange}
        //   // setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        //   // setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        // />
      }
    </div>
  );
}
