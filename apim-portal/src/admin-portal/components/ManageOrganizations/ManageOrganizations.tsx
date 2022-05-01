
import React from "react";
import { useHistory } from 'react-router-dom';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { EUICommonResourcePaths, Globals } from "../../../utils/Globals";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { 
  E_CALL_STATE_ACTIONS,
  E_CALL_STATE_ACTIONS_USERS,
  E_COMPONENT_STATE, 
  E_ManageOrganizations_Scope, 
  TManageOrganizationSettingsScope, 
  TManageOrganizationsScope, 
  TMonitorOrganizationStatusScope 
} from "./ManageOrganizationsCommon";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import APContextsDisplayService from "../../../displayServices/APContextsDisplayService";
import { OrganizationContext } from "../../../components/APContextProviders/APOrganizationContextProvider";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { ListSystemOrganizations } from "./ListSystemOrganizations";
import { ViewOrganization } from "./ViewOrganization";
import { ManageEditOrganization } from "./EditNewOrganization/ManageEditOrganization";
import APLoginUsersDisplayService from "../../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { ListImportableSystemOrganizations } from "./ImportOrganizations/ListImportableSystemOrganizations";
import { ManageNewOrganization } from "./EditNewOrganization/ManageNewOrganization";
import { DeleteOrganization } from "./DeleteOrganization";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { ManageSystemOrganizationUsers } from "./ManageSystemOrganizationUsers/ManageSystemOrganizationUsers";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

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
  const ToolbarImportOrganizationsButtonLabel = 'Import Organizations';

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();

  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showMonitorComponent, setShowMonitorComponent] = React.useState<boolean>(false);
  const [showManageOrganizationUsersComponent, setShowManageOrganizationUsersComponent] = React.useState<boolean>(false);
  const [showManageImportOrganizationsComponent, setShowManageImportOrganizationsComponent] = React.useState<boolean>(false);
  const [showImportEditComponent, setShowImportEditComponent] = React.useState<boolean>(false);

  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  
  const history = useHistory();

  const navigateTo = (path: string): void => { history.push(path); }

  
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
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${ComponentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
    const _type = props.scope.type;
    switch(_type) {
      case E_ManageOrganizations_Scope.SYSTEM_ORGS:
        setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
        break;
      case E_ManageOrganizations_Scope.ORG_SETTINGS:
        const orgSettingsScope = props.scope as TManageOrganizationSettingsScope;
        onViewManagedObject(orgSettingsScope.organizationEntityId);
        break;
      case E_ManageOrganizations_Scope.ORG_STATUS:
        const orgStatusScope = props.scope as TMonitorOrganizationStatusScope;
        onMonitorManagedObject(orgStatusScope.organizationEntityId);
        break;
      case E_ManageOrganizations_Scope.IMPORT_ORGANIZATION:  
        throw new Error(`${logName}: unsupported props.scope.type=${props.scope.type}`);
      default:
        Globals.assertNever(logName, _type);
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
  const onViewManagedObject = (organizationEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(organizationEntityId);
    // setIsManagedObjectDeleteAllowed(APAdminPortalApiProductsDisplayService.get_IsDeleteAllowed({
    //   apApiProductDisplay: apAdminPortalApiProductDisplay
    // }));
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  //  * Monitor Object *
  const onMonitorManagedObject = (organizationEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(organizationEntityId);
    setNewComponentState(E_COMPONENT_STATE.MONITOR_OBJECT);
  }  
  // * New Object *
  const onNewManagedObject = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  // * Edit Object *
  const onEditManagedObjectFromToolbar = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Manage Organization Users *
  const onManageOrganizationUsersFromToolbar = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGE_ORGANIZATION_USERS);
  }
  // * Import Organizations *
  const onImportOrganizationsFromToolbar = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGE_IMPORT_ORGANIZATIONS);
  }
  // const onSetManageUsersComponentState = (manageUsersComponentState: E_COMPONENT_STATE, organizationEntityId: TAPEntityId) => {
  //   setManagedObjectId(organizationEntityId.id);
  //   setManagedObjectDisplayName(organizationEntityId.displayName);
  //   setNewComponentState(manageUsersComponentState);
  //   setRefreshCounter(refreshCounter + 1);
  // }

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
        case E_ManageOrganizations_Scope.SYSTEM_ORGS:
          return (
            <React.Fragment>
              <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
              <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
              <Button label={ToolbarManagedOrganizationUsersButtonLabel} onClick={onManageOrganizationUsersFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
            </React.Fragment>
          );    
        case E_ManageOrganizations_Scope.ORG_SETTINGS:
          return (
            <React.Fragment>
              <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
            </React.Fragment>
          );
        case E_ManageOrganizations_Scope.ORG_STATUS:
        case E_ManageOrganizations_Scope.IMPORT_ORGANIZATION:
          throw new Error(`${logName}: viewComponent: unsupported props.scope.type=${props.scope.type}`);
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
    if(showListComponent) {
      if(props.scope.type === E_ManageOrganizations_Scope.SYSTEM_ORGS) {
        return(
          <Button label={ToolbarImportOrganizationsButtonLabel} icon="pi pi-cog" onClick={onImportOrganizationsFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
        );
      }
    }
    if(showViewComponent) {
      const _type = props.scope.type;
      switch(_type) {
        case E_ManageOrganizations_Scope.SYSTEM_ORGS:
          return (
            <React.Fragment>
              <Button label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined" style={{ color: "red", borderColor: 'red'}}/>        
            </React.Fragment>
          );    
        case E_ManageOrganizations_Scope.ORG_SETTINGS:
        case E_ManageOrganizations_Scope.ORG_STATUS:
        case E_ManageOrganizations_Scope.IMPORT_ORGANIZATION:
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
  const onSetManageObjectComponentState_To_View = (organizationEntityId: TAPEntityId) => {
    setManagedObjectEntityId(organizationEntityId);
    setRefreshCounter(refreshCounter + 1);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }
  const onSetManageObjectComponentState_To_Import = () => {
    setRefreshCounter(refreshCounter + 1);
    setNewComponentState(E_COMPONENT_STATE.MANAGE_IMPORT_ORGANIZATIONS);
  }
  
  // const onSetManageObjectComponentState_From_Edit = (organizationEntityId: TAPEntityId) => {
  //   if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {

  //   } else if(componentState.previousState === E_COMPONENT_STATE.MANAGE_IMPORT_ORGANIZATIONS)
  // }
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    // setApiCallStatus(apiCallState);
  }  
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    const funcName = 'onDeleteManagedObjectSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined`);
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
    doLogoutAllOrganizationUsers(managedObjectEntityId.id);
  }
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, newMoEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setManagedObjectEntityId(newMoEntityId);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onEditSaveManagedObjectSuccess = (apiCallState: TApiCallState) => {
    const funcName = 'onEditSaveManagedObjectSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined`);
    setApiCallStatus(apiCallState);
    setRefreshCounter(refreshCounter + 1);
    doLogoutAllOrganizationUsers(managedObjectEntityId.id);
  }
  const onImportManagedObject = (organizationEntityId: TAPEntityId) => {
    setApiCallStatus(null);
    setManagedObjectEntityId(organizationEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_EDIT);
  }
  const onSubComponentSuccessNoChange = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentCancel = () => {
    setPreviousComponentState();
  }
  const onSubComponentSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
  }

  const calculateShowStates = (componentState: TComponentState) => {
    const funcName = 'calculateShowStates';
    const logName = `${ComponentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
      setShowManageImportOrganizationsComponent(false);
      setShowImportEditComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
      setShowManageImportOrganizationsComponent(false);
      setShowImportEditComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
      setShowManageImportOrganizationsComponent(false);
      setShowImportEditComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
      setShowManageImportOrganizationsComponent(false);
      setShowImportEditComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
      setShowManageImportOrganizationsComponent(false);
      setShowImportEditComponent(false);
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
      setShowManageImportOrganizationsComponent(false);
      setShowImportEditComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MONITOR_OBJECT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(true);
      setShowManageOrganizationUsersComponent(false);
      setShowManageImportOrganizationsComponent(false);
      setShowImportEditComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGE_ORGANIZATION_USERS) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(true);
      setShowManageImportOrganizationsComponent(false);
      setShowImportEditComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGE_IMPORT_ORGANIZATIONS) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
      setShowManageImportOrganizationsComponent(true);
      setShowImportEditComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowMonitorComponent(false);
      setShowManageOrganizationUsersComponent(false);
      setShowManageImportOrganizationsComponent(false);
      setShowImportEditComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="manage-organizations">

      <CheckConnectorHealth />
      
      <Loading show={isLoading} />      
      
      {!isLoading && renderToolbar() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {showListComponent && 
        <ListSystemOrganizations
          key={`${ComponentName}_ListSystemOrganizations_${refreshCounter}`}
          onSuccess={() => {}}
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectView={onViewManagedObject}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {showViewComponent && managedObjectEntityId &&
        <ViewOrganization
          key={`${ComponentName}_showViewComponent_${refreshCounter}`}
          organizationEntityId={managedObjectEntityId}
          scope={props.scope}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageObjectComponentState_To_View}
        />      
      }
      {showDeleteComponent && managedObjectEntityId &&
        <DeleteOrganization
          organizationEntityId={managedObjectEntityId}
          onSuccess={onDeleteManagedObjectSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          onCancel={onSubComponentCancel}
        />
      }
      { showNewComponent &&
        <ManageNewOrganization
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNewSuccess={onNewManagedObjectSuccess}
          onSuccessNotification={props.onSuccess}
        />
      }
      {showEditComponent && managedObjectEntityId &&
        <ManageEditOrganization
          // key={`${ComponentName}_ManageEditOrganization_${refreshCounter}`}
          organizationEntityId={managedObjectEntityId}
          scope={props.scope}
          onSaveSuccess={onEditSaveManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateToCommand={onSetManageObjectComponentState_To_View}
          onNavigateToImportList={onSetManageObjectComponentState_To_Import}
        />
      }
      {showMonitorComponent && managedObjectEntityId &&
      <p>showMonitorComponent</p>
        // <MonitorOrganization
        //   organizationId={managedObjectId}
        //   organizationDisplayName={managedObjectDisplayName}
        //   onError={onSubComponentError} 
        //   onLoadingChange={setIsLoading}
        // />      
      }
      {showManageOrganizationUsersComponent && managedObjectEntityId &&
        <ManageSystemOrganizationUsers
          organizationEntityId={managedObjectEntityId}
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          onSuccess={props.onSuccess}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
          // onNavigateHere={onSetManageUsersComponentState}
        />
      }
      {showManageImportOrganizationsComponent && 
        <ListImportableSystemOrganizations
          key={`${ComponentName}_ListImportableSystemOrganizations_${refreshCounter}`}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectOpen={onImportManagedObject}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHereCommand={onSetManageObjectComponentState_To_Import}
        />
      }
      {showImportEditComponent && managedObjectEntityId &&
        <ManageEditOrganization
          // key={`${ComponentName}_ManageEditOrganization_${refreshCounter}`}
          organizationEntityId={managedObjectEntityId}
          scope={{ type: E_ManageOrganizations_Scope.IMPORT_ORGANIZATION }}
          onSaveSuccess={onEditSaveManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateToCommand={onSetManageObjectComponentState_To_View}
          onNavigateToImportList={onSetManageObjectComponentState_To_Import}
        />
      }
    </div>
  );
}
