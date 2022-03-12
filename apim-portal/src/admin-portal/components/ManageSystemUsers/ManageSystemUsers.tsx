
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./ManageSystemUsersCommon";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { ListSystemUsers } from "./ListSystemUsers";
import { ViewSystemUser } from "./ViewSystemUser";
import { EditSystemUser } from "./EditNewSystemUser/EditSystemUser";
import { NewSystemUser } from "./EditNewSystemUser/NewSystemUser";
import { DeleteSystemUser } from "./DeleteSystemUser";

import '../../../components/APComponents.css';
import "./ManageSystemUsers.css";

export interface IManageSystemUsersProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageSystemUsers: React.FC<IManageSystemUsersProps> = (props: IManageSystemUsersProps) => {
  const componentName = 'ManageSystemUsers';

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
  const ToolbarEditManagedObjectButtonLabel = 'Edit';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete';

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);

  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  // * useEffect Hooks *
  React.useEffect(() => {
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
          case E_CALL_STATE_ACTIONS.API_UPDATE_USER:
            props.onSuccess(apiCallStatus);
            break;
          default:
        }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedObject = (userEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(userEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * New Object *
  const onNewManagedObject = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  // * Edit Object *
  const onEditManagedObjectFromToolbar = () => {
    const funcName = 'onEditManagedObjectFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined`);
    onEditManagedObject(managedObjectEntityId);
  }
  const onEditManagedObject = (userEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(userEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined`);
    onDeleteManagedObject(managedObjectEntityId);
  }
  const onDeleteManagedObject = (userEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(userEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Toolbar *
  const renderLeftToolbarContent = (): Array<JSX.Element> | undefined => {
    if(!componentState.currentState) return undefined;
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;

    const jsxButtonList: Array<JSX.Element> = [];
    if(showListComponent || showViewComponent) {
      jsxButtonList.push(<Button key={ToolbarNewManagedObjectButtonLabel} label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>);
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
    setManagedObjectEntityId(userEntityId);
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
      setManagedObjectEntityId(newUserEntityId);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else {
      setManagedObjectEntityId(undefined);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    }
  }
  const onEditManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else {
      setManagedObjectEntityId(undefined);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    }
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
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
    }
  }

  return (
    <div className="manage-users">

      <Loading show={isLoading} />      
      
      {!isLoading && renderToolbar() }

      {showListComponent &&
        <ListSystemUsers
          key={`${componentName}_ListSystemUsers_${refreshCounter}`}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectEdit={onEditManagedObject}
          onManagedObjectDelete={onDeleteManagedObject}
          onManagedObjectView={onViewManagedObject}
          setBreadCrumbItemList={props.setBreadCrumbItemList}
        />
      }
      {showViewComponent && managedObjectEntityId &&
        <ViewSystemUser
          key={`${componentName}_ViewSystemUser_${refreshCounter}`}
          userEntityId={managedObjectEntityId}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageUserComponentState}
        />      
      }
      {showDeleteComponent && managedObjectEntityId &&
        <DeleteSystemUser
          userEntityId={managedObjectEntityId}
          onSuccess={onDeleteManagedObjectSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}    
        />
      }
      { showNewComponent &&
        <NewSystemUser
          onSaveSuccess={onNewManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {showEditComponent && managedObjectEntityId &&
        <EditSystemUser
          userEntityId={managedObjectEntityId}
          onSaveSuccess={onEditManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        />
      }
    </div>
  );
}
