
import React from "react";
import { useHistory } from 'react-router-dom';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { CommonDisplayName, CommonName } from "@solace-iot-team/apim-connector-openapi-browser";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { E_CALL_STATE_ACTIONS, E_CALL_STATE_ACTIONS_USERS, E_COMPONENT_STATE } from "./deleteme_ManageOrganizationsCommon";
import { ListOrganizations } from "./deleteme_ListOrganizations";
import { ViewOrganization } from "./deleteme_ViewOrganization";
import { EAction, EditNewOrganziation } from "./deleteme_EditNewOrganization";
import { DeleteOrganization } from "./deleteme_DeleteOrganization";
import { EUICommonResourcePaths, Globals } from "../../../utils/Globals";
import { MonitorOrganization } from "./deleteme_MonitorOrganization";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { ManageSystemOrganizationUsers } from "./ManageSystemOrganizationUsers/deleteme.ManageSystemOrganizationUsers";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";
import APLoginUsersDisplayService from "../../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import APContextsDisplayService from "../../../displayServices/APContextsDisplayService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { OrganizationContext } from "../../../components/APContextProviders/APOrganizationContextProvider";

export enum E_ManageOrganizations_Scope {
  ALL_ORGS = "ALL_ORGS",
  ORG_SETTINGS = "ORG_SETTINGS",
  ORG_STATUS = "ORG_STATUS"
}

export type TManageOrganizationSettingsScope = {
  type: E_ManageOrganizations_Scope.ORG_SETTINGS;
  organizationEntityId: TAPEntityId;
};
export type TMonitorOrganizationStatusScope = {
  type: E_ManageOrganizations_Scope.ORG_STATUS;
  organizationEntityId: TAPEntityId;
};
export type TManageAllOrganizationsScope = {
  type: E_ManageOrganizations_Scope.ALL_ORGS;
}
export type TManageOrganizationsScope = 
  TManageOrganizationSettingsScope
  | TManageAllOrganizationsScope
  | TMonitorOrganizationStatusScope;

export interface IManageOrganizationsProps {
  scope: TManageOrganizationsScope;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageOrganizations: React.FC<IManageOrganizationsProps> = (props: IManageOrganizationsProps) => {
  const ComponentName = 'ManageOrganizations';

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
  const ToolbarManagedOrganizationUsersButtonLabel = 'Manage Users';

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectId, setManagedObjectId] = React.useState<CommonName>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showMonitorComponent, setShowMonitorComponent] = React.useState<boolean>(false);
  const [showManageOrganizationUsersComponent, setShowManageOrganizationUsersComponent] = React.useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  
  const history = useHistory();

  const navigateTo = (path: string): void => { history.push(path); }

  
  // * Api Calls *
  const apiLogoutOrganizationAll = async(organizationId: string): Promise<TApiCallState> => {
    const funcName = 'apiLogoutOrganizationAll';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_LOGOUT_ORGANIZATION_ALL, `logout all users from this organization`);
    try { 
      await APLoginUsersDisplayService.apsLogoutOrganizationAll({
        organizationId: organizationId
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doLogoutAllOrganizationUsers = async(organizationId: string) => {
    if(userContext.runtimeSettings.currentOrganizationEntityId !== undefined) {
      if(userContext.runtimeSettings.currentOrganizationEntityId.id === organizationId) {
        // logout this user as well
        APContextsDisplayService.clear_LoginContexts({
          dispatchAuthContextAction: dispatchAuthContextAction,
          dispatchUserContextAction: dispatchUserContextAction,
          dispatchOrganizationContextAction: dispatchOrganizationContextAction,
        });
        navigateTo(EUICommonResourcePaths.Home);    
      }
    }
    await apiLogoutOrganizationAll(organizationId);
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${ComponentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
    const _type = props.scope.type;
    switch(_type) {
      case E_ManageOrganizations_Scope.ALL_ORGS:
        setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
        break;
      case E_ManageOrganizations_Scope.ORG_SETTINGS:
        const orgSettingsScope = props.scope as TManageOrganizationSettingsScope;
        onViewManagedObject(orgSettingsScope.organizationEntityId.id, orgSettingsScope.organizationEntityId.displayName);
        break;
      case E_ManageOrganizations_Scope.ORG_STATUS:
        const orgStatusScope = props.scope as TMonitorOrganizationStatusScope;
        onMonitorManagedObject(orgStatusScope.organizationEntityId.id, orgStatusScope.organizationEntityId.displayName);
        break;
      default:
        Globals.assertNever(logName, _type);
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   // const funcName = 'useEffect([componentState, managedObjectDisplayName])';
  //   // const logName = `${componentName}.${funcName}()`;
  //   // console.log(`${logName}: componentState.currentState=${componentState.currentState}, managedObjectDisplayName=${managedObjectDisplayName}`);

  //   if(!managedObjectDisplayName) return;
  //   if(props.scope.type === E_ManageOrganizations_Scope.ALL_ORGS) {
  //     // if( 
  //     //   // componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW ||
  //     //     componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT ||
  //     //     componentState.currentState === E_COMPONENT_STATE.MANAGE_ORGANIZATION_USERS
  //     //   ) {
  //     //     onSubComponentSetBreadCrumbItemList([{
  //     //       label: managedObjectDisplayName,
  //     //     }]);         
  //     // } 
  //     // else onSubComponentSetBreadCrumbItemList([]);
  //   }
  // }, [componentState, managedObjectDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_DELETE_ORGANIZATION:
          case E_CALL_STATE_ACTIONS.API_CREATE_ORGANIZATION:
          case E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION:
          case E_CALL_STATE_ACTIONS_USERS.API_UPDATE_USER_ROLES:
            props.onSuccess(apiCallStatus);
            break;
          default:
        }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedObject = (id: CommonName, displayName: CommonDisplayName): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  //  * Monitor Object *
  const onMonitorManagedObject = (id: CommonName, displayName: CommonDisplayName): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MONITOR_OBJECT);
  }  
  
  // * New Object *
  const onNewManagedObject = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  // * Edit Object *
  const onEditManagedObjectFromToolbar = () => {
    const funcName = 'onEditManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onEditManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onEditManagedObject = (id: CommonName, displayName: CommonDisplayName): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onDeleteManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onDeleteManagedObject = (id: CommonName, displayName: CommonDisplayName): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Manage Organization Users *
  const onManageOrganizationUsersFromToolbar = () => {
    const funcName = 'onManageOrganizationUsersFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onManageOrganizationUsers(managedObjectId, managedObjectDisplayName);
  }
  const onManageOrganizationUsers = (id: CommonName, displayName: CommonDisplayName): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGE_ORGANIZATION_USERS);
  }
  const onSetManageUsersComponentState = (manageUsersComponentState: E_COMPONENT_STATE, organizationEntityId: TAPEntityId) => {
    setManagedObjectId(organizationEntityId.id);
    setManagedObjectDisplayName(organizationEntityId.displayName);
    setNewComponentState(manageUsersComponentState);
    setRefreshCounter(refreshCounter + 1);
  }

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    const funcName = 'renderLeftToolbarContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(!componentState.currentState) return undefined;
    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
      </React.Fragment>
    );
    if(showViewComponent) {
      const _type = props.scope.type;
      switch(_type) {
        case E_ManageOrganizations_Scope.ALL_ORGS:
          return (
            <React.Fragment>
              <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
              <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
              <Button label={ToolbarManagedOrganizationUsersButtonLabel} onClick={onManageOrganizationUsersFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
              {/* <Button label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>         */}
            </React.Fragment>
          );    
        case E_ManageOrganizations_Scope.ORG_SETTINGS:
          return (
            <React.Fragment>
              <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
            </React.Fragment>
          );
        case E_ManageOrganizations_Scope.ORG_STATUS:
          throw new Error(`${logName}: viewComponent cannot display status`);
        default:
          Globals.assertNever(logName, _type);
      }
    }
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;
    if(showMonitorComponent) return undefined;
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    const funcName = 'renderRightToolbarContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(!componentState.currentState) return undefined;
    if(showViewComponent) {
      const _type = props.scope.type;
      switch(_type) {
        case E_ManageOrganizations_Scope.ALL_ORGS:
          return (
            <React.Fragment>
              <Button label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined" style={{ color: "red", borderColor: 'red'}}/>        
            </React.Fragment>
          );    
        case E_ManageOrganizations_Scope.ORG_SETTINGS:
        case E_ManageOrganizations_Scope.ORG_STATUS:
            return undefined;
        default:
          Globals.assertNever(logName, _type);
      }
    }
    return undefined;
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    const rightToolbarTemplate: JSX.Element | undefined = renderRightToolbarContent();
    if(leftToolbarTemplate || rightToolbarTemplate) {
      return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />);
    }
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
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    const funcName = 'onDeleteManagedObjectSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectId === undefined) throw new Error(`${logName}: managedObjectId === undefined`);

    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);

    doLogoutAllOrganizationUsers(managedObjectId);
  }

  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, newId: CommonName, newDisplayName: CommonDisplayName) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setManagedObjectId(newId);
      setManagedObjectDisplayName(newDisplayName);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onEditManagedObjectSuccess = (apiCallState: TApiCallState, updatedDisplayName: CommonDisplayName) => {
    const funcName = 'onEditManagedObjectSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectId === undefined) throw new Error(`${logName}: managedObjectId === undefined`);
    
    setApiCallStatus(apiCallState);

    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setManagedObjectDisplayName(updatedDisplayName);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);

    doLogoutAllOrganizationUsers(managedObjectId);

  }
  const onSubComponentSuccessKeepState = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
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
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MONITOR_OBJECT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(true);
      setShowManageOrganizationUsersComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGE_ORGANIZATION_USERS) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(true);
    }
  }

  return (
    <div className="manage-organizations">

      <CheckConnectorHealth />
      
      <Loading show={isLoading} />      
      
      {/* DEBUG */}
      {/* <React.Fragment>
        <pre>componentState={JSON.stringify(componentState)}</pre>
      </React.Fragment> */}

      {!isLoading && renderToolbar() }

      {showListComponent && 
        <ListOrganizations
          key={refreshCounter}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectEdit={onEditManagedObject}
          onManagedObjectDelete={onDeleteManagedObject}
          onManagedObjectView={onViewManagedObject}
        />
      }
      {showViewComponent && managedObjectId && managedObjectDisplayName &&
        <ViewOrganization
          organizationId={managedObjectId}
          organizationDisplayName={managedObjectDisplayName}
          scope={props.scope}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageUsersComponentState}
        />      
      }
      {showDeleteComponent && managedObjectId && managedObjectDisplayName &&
        <DeleteOrganization
          organizationId={managedObjectId}
          organizationDisplayName={managedObjectDisplayName}
          onSuccess={onDeleteManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      { showNewComponent &&
        <EditNewOrganziation
          action={EAction.NEW}
          onNewSuccess={onNewManagedObjectSuccess} 
          onEditSuccess={onSubComponentSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      {showEditComponent && managedObjectId && managedObjectDisplayName &&
        <EditNewOrganziation
          action={EAction.EDIT}
          organizationId={managedObjectId}
          organizationDisplayName={managedObjectDisplayName}
          onNewSuccess={onNewManagedObjectSuccess} 
          onEditSuccess={onEditManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      {showMonitorComponent && managedObjectId && managedObjectDisplayName &&
        <MonitorOrganization
          organizationId={managedObjectId}
          organizationDisplayName={managedObjectDisplayName}
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
        />      
      }
      {showManageOrganizationUsersComponent && managedObjectId && managedObjectDisplayName &&
        <ManageSystemOrganizationUsers
          organizationEntityId={{ id: managedObjectId, displayName: managedObjectDisplayName }}
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          onSuccess={onSubComponentSuccessKeepState}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
          // onNavigateHere={onSetManageUsersComponentState}
        />
      }
    </div>
  );
}
