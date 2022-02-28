
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { 
  E_COMPONENT_STATE, 
  E_CALL_STATE_ACTIONS, 
} from "./ManageOrganizationUsersCommon";
import { ListOrganizationUsers } from "./ListOrganizationUsers";
import { AddOrganizationUser } from "./AddOrganizationUser";
import { TAPEntityId } from "../../../utils/APEntityIdsService";

import '../../../components/APComponents.css';
import "./ManageOrganizationUsers.css";
import { DeleteOrganizationUser } from "./DeleteOrganizationUser";
import { ViewOrganizationUser } from "./ViewOrganizationUser";
import { EditOrganizationUser } from "./EditNewOrganizationUser/EditOrganizationUser";
import { NewOrganizationUser } from "./EditNewOrganizationUser/NewOrganizationUser";

export interface IManageOrganizationUsersProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageOrganizationUsers: React.FC<IManageOrganizationUsersProps> = (props: IManageOrganizationUsersProps) => {
  const componentName = 'ManageOrganizationUsers';

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
  
  const ToolbarNewManagedObjectButtonLabel = 'New';
  const ToolbarAddManagedObjectButtonLabel = 'Add';
  const ToolbarEditManagedObjectButtonLabel = 'Edit';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete';

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectId, setManagedObjectId] = React.useState<string>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showAddComponent, setShowAddComponent] = React.useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  // * useEffect Hooks *
  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_DELETE_USER:
          case E_CALL_STATE_ACTIONS.API_CREATE_USER:
          case E_CALL_STATE_ACTIONS.API_REPLACE_USER:
          case E_CALL_STATE_ACTIONS.API_ADD_USER_TO_ORG:
          case E_CALL_STATE_ACTIONS.API_REMOVE_ORG:
            props.onSuccess(apiCallStatus);
            break;
          default:
        }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedObject = (apEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectId(apEntityId.id);
    setManagedObjectDisplayName(apEntityId.displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * New Object *
  const onNewManagedObject = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  const onAddManagedObject = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_ADD);
  }
  // * Edit Object *
  const onEditManagedObjectFromToolbar = () => {
    const funcName = 'onEditManagedObjectFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onEditManagedObject({ id: managedObjectId, displayName: managedObjectDisplayName});
  }
  const onEditManagedObject = (entityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectId(entityId.id);
    setManagedObjectDisplayName(entityId.displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onDeleteManagedObject({ id: managedObjectId, displayName: managedObjectDisplayName});
  }
  const onDeleteManagedObject = (entityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectId(entityId.id);
    setManagedObjectDisplayName(entityId.displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Toolbar *
  const renderLeftToolbarContent = (): Array<JSX.Element> | undefined => {
    if(!componentState.currentState) return undefined;
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;
    if(showAddComponent) return undefined;

    const jsxButtonList: Array<JSX.Element> = [];
    if(showListComponent || showViewComponent) {
      jsxButtonList.push(<Button key={ToolbarNewManagedObjectButtonLabel} label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>);
      jsxButtonList.push(<Button key={ToolbarAddManagedObjectButtonLabel} label={ToolbarAddManagedObjectButtonLabel} icon="pi pi-arrow-down" onClick={onAddManagedObject} className="p-button-text p-button-plain p-button-outlined"/>);        
    }
    if(showViewComponent) {
      jsxButtonList.push(<Button key={ToolbarEditManagedObjectButtonLabel} label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>);
      jsxButtonList.push(<Button key={ToolbarDeleteManagedObjectButtonLabel} label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>);
    }
    return jsxButtonList;
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: Array<JSX.Element> | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} />);
    else return (<React.Fragment></React.Fragment>);
  }
  
  // * prop callbacks *
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    setBreadCrumbItemList(itemList);
    props.setBreadCrumbItemList(itemList);
  }
  const onSubComponentAddBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
    props.setBreadCrumbItemList(newItemList);
  }
  const onSetManageUserComponentState = (componentState: E_COMPONENT_STATE, userEntityId: TAPEntityId) => {
    setManagedObjectId(userEntityId.id);
    setManagedObjectDisplayName(userEntityId.displayName);
    setNewComponentState(componentState);
    setRefreshCounter(refreshCounter + 1);
  }
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, newUserEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setManagedObjectId(newUserEntityId.id);
      setManagedObjectDisplayName(newUserEntityId.displayName);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onAddManagedObjectSuccess = (apiCallState: TApiCallState, addedUserEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setManagedObjectId(addedUserEntityId.id);
      setManagedObjectDisplayName(addedUserEntityId.displayName);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onEditSaveManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    props.onSuccess(apiCallState);
    // if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
    //   if(updatedDisplayName) setManagedObjectDisplayName(updatedDisplayName);
    //   setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    // }
    // else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onSubComponentSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentCancel = () => {
    setPreviousComponentState();
  }

  const calculateShowStates = (componentState: TComponentState) => {
    if(!componentState.currentState) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowAddComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowAddComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowAddComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
      setShowAddComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowAddComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowAddComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
      setShowAddComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_ADD) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowAddComponent(true);
    }
  }

  return (
    <div className="manage-users">

      <Loading show={isLoading} />      
      
      {!isLoading && renderToolbar() }

      {showListComponent && 
        <ListOrganizationUsers
          key={refreshCounter}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectEdit={onEditManagedObject}
          onManagedObjectDelete={onDeleteManagedObject}
          onManagedObjectView={onViewManagedObject}
          setBreadCrumbItemList={props.setBreadCrumbItemList}
        />
      }
      {showViewComponent && managedObjectId && managedObjectDisplayName &&
        <ViewOrganizationUser
          key={refreshCounter}
          userEntityId={ { id: managedObjectId, displayName: managedObjectDisplayName }}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageUserComponentState}
        />      
      }
      {showDeleteComponent && managedObjectId && managedObjectDisplayName &&
        <DeleteOrganizationUser
          userEntityId={{ id: managedObjectId, displayName: managedObjectDisplayName }}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onDeleteManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      { showNewComponent &&
        <NewOrganizationUser
          organizationEntityId={props.organizationEntityId}
          onNewSuccess={onNewManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      { showAddComponent && 
        <AddOrganizationUser
          organizationEntityId={props.organizationEntityId}
          onSuccess={onAddManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {showEditComponent && managedObjectId && managedObjectDisplayName &&
        <EditOrganizationUser
          organizationEntityId={props.organizationEntityId}
          userEntityId={{id: managedObjectId, displayName: managedObjectDisplayName }}
          onSaveSuccess={onEditSaveManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        />
      }
    </div>
  );
}
