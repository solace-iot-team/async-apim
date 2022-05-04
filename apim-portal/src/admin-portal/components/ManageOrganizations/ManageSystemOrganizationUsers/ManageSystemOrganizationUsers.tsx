
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { TApiCallState } from "../../../../utils/ApiCallState";
import { E_COMPONENT_STATE_USERS } from "../ManageOrganizationsCommon";
import { ListSystemOrganizationUsers } from "./ListSystemOrganizationUsers";
import { AddSystemOrganizationUser } from "./AddSystemOrganizationUser/AddSystemOrganizationUser";
import { EditSystemOrganizationUserRoles } from "./EditSystemOrganizationUserRoles";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IManageSystemOrganizationUsersProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageSystemOrganizationUsers: React.FC<IManageSystemOrganizationUsersProps> = (props: IManageSystemOrganizationUsersProps) => {
  const ComponentName = 'ManageSystemOrganizationUsers';

  type TComponentState = {
    previousState: E_COMPONENT_STATE_USERS,
    currentState: E_COMPONENT_STATE_USERS
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE_USERS.UNDEFINED,
    currentState: E_COMPONENT_STATE_USERS.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE_USERS) => {
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
  
  const ToolbarAddManagedObjectButtonLabel = 'Add';

  const ComponentBreadcrumbItem: MenuItem = {
    label: `Manage Users`,
  }

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectId, setManagedObjectId] = React.useState<string>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showAddComponent, setShowAddComponent] = React.useState<boolean>(false);
  const [showEditRolesComponent, setShowEditRolesComponent] = React.useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  // * useEffect Hooks *
  React.useEffect(() => {
    setBreadCrumbItemList([ComponentBreadcrumbItem]);
    props.setBreadCrumbItemList([ComponentBreadcrumbItem]);
    setNewComponentState(E_COMPONENT_STATE_USERS.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Edit Roles *
  const onEditRoles = (userEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectId(userEntityId.id);
    setManagedObjectDisplayName(userEntityId.displayName);
    setNewComponentState(E_COMPONENT_STATE_USERS.MANAGED_OBJECT_EDIT_ROLES);
  }

  // * Add *
  const onAddManagedObject = () => {
    setApiCallStatus(null);
    setManagedObjectId(undefined);
    setManagedObjectDisplayName(undefined);
    setNewComponentState(E_COMPONENT_STATE_USERS.MANAGED_OBJECT_ADD);
  }

  // * Toolbar *

  const renderLeftToolbarContent = (): Array<JSX.Element> | undefined => {
    if(!componentState.currentState) return undefined;
    if(showAddComponent) return undefined;

    const jsxButtonList: Array<JSX.Element> = [];
    if(showListComponent) {
      jsxButtonList.push(<Button key={ToolbarAddManagedObjectButtonLabel} label={ToolbarAddManagedObjectButtonLabel} icon="pi pi-arrow-down" onClick={onAddManagedObject} className="p-button-text p-button-plain p-button-outlined"/>);        
    }
    return jsxButtonList;
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: Array<JSX.Element> | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} />);
    else return (<React.Fragment></React.Fragment>);
  }
  
  // * prop callbacks *
  const onSubComponentAddBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
    props.setBreadCrumbItemList(newItemList);
  }
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onEditRolesManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    props.onSuccess(apiCallState);
    setNewComponentState(E_COMPONENT_STATE_USERS.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onAddManagedObjectSuccess = (apiCallState: TApiCallState, addedUserEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    setManagedObjectId(addedUserEntityId.id);
    setManagedObjectDisplayName(addedUserEntityId.displayName);
    setNewComponentState(E_COMPONENT_STATE_USERS.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
    setRefreshCounter(refreshCounter + 1);
  }
  const onSubComponentCancel = () => {
    setBreadCrumbItemList([ComponentBreadcrumbItem]);
    props.setBreadCrumbItemList([ComponentBreadcrumbItem]);
    setPreviousComponentState();
  }

  const calculateShowStates = (componentState: TComponentState) => {
    if(!componentState.currentState) {
      setShowListComponent(false);
      setShowAddComponent(false);
      setShowEditRolesComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_USERS.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowAddComponent(false);
      setShowEditRolesComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE_USERS.MANAGED_OBJECT_EDIT_ROLES) {
      setShowListComponent(true);
      setShowAddComponent(false);
      setShowEditRolesComponent(true);
    }
    else if( componentState.currentState === E_COMPONENT_STATE_USERS.MANAGED_OBJECT_ADD) {
      setShowListComponent(false);
      setShowAddComponent(true);
      setShowEditRolesComponent(false);
    }
  }

  return (
    <div className="manage-users">

      { renderToolbar() }

      {showListComponent && 
        <ListSystemOrganizationUsers        
          key={`${ComponentName}_ListSystemOrganizationUsers_${refreshCounter}`}
          organizationEntityId={props.organizationEntityId}
          onError={onSubComponentError}
          onSuccess={onListManagedObjectsSuccess}
          onLoadingChange={props.onLoadingChange}
          onManagedObjectEdit={onEditRoles}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        />
      }
      { showAddComponent && 
        <AddSystemOrganizationUser
          organizationEntityId={props.organizationEntityId}
          onSuccess={onAddManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={props.onLoadingChange}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        />
      }
      {showEditRolesComponent && managedObjectId && managedObjectDisplayName &&
        <EditSystemOrganizationUserRoles      
          organizationEntityId={props.organizationEntityId}
          userEntityId={{ id: managedObjectId, displayName: managedObjectDisplayName }}
          onError={onSubComponentError}
          onSaveSuccess={onEditRolesManagedObjectSuccess}
          onCancel={onSubComponentCancel}
          onLoadingChange={props.onLoadingChange}
        />
      }
    </div>
  );
}
