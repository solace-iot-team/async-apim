
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { 
  E_CALL_STATE_ACTIONS, 
  E_MANAGE_USER_APP_COMPONENT_STATE 
} from "./DeveloperPortalManageUserAppsCommon";
import { DeveloperPortalListUserApps } from "./DeveloperPortalListUserApps";
import APDeveloperPortalUserAppsDisplayService, { 
  TAPDeveloperPortalUserAppDisplay, 
  TAPDeveloperPortalUserAppDisplay_AllowedActions 
} from "../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { DeveloperPortalViewUserApp } from "./DeveloperPortalViewUserApp";
import { ManageNewUserApp } from "./EditNewUserApp/ManageNewUserApp";
import { DeveloperPortalDeleteUserApp } from "./DeveloperPortalDeleteUserApp";
import { ManageEditUserApp } from "./EditNewUserApp/ManageEditUserApp";
import { ManageApiProducts } from "./ManageApiProducts/ManageApiProducts";

// import { APMonitorUserApp } from "../../../components/APMonitorUserApp/APMonitorUserApp";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalManageUserAppsProps {
  organizationEntityId: TAPEntityId;
  createAppWithApiProductEntityId?: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const DeveloperPortalManageUserApps: React.FC<IDeveloperPortalManageUserAppsProps> = (props: IDeveloperPortalManageUserAppsProps) => {
  const ComponentName = 'DeveloperPortalManageUserApps';

  type TComponentState = {
    previousState: E_MANAGE_USER_APP_COMPONENT_STATE,
    currentState: E_MANAGE_USER_APP_COMPONENT_STATE
  }
  const initialComponentState: TComponentState = {
    previousState: E_MANAGE_USER_APP_COMPONENT_STATE.UNDEFINED,
    currentState: E_MANAGE_USER_APP_COMPONENT_STATE.UNDEFINED
  }
  const setNewComponentState = (newState: E_MANAGE_USER_APP_COMPONENT_STATE) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  const setPreviousComponentState = () => {
    const newCurrentState: E_MANAGE_USER_APP_COMPONENT_STATE = (componentState.previousState === E_MANAGE_USER_APP_COMPONENT_STATE.UNDEFINED ? E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW : componentState.previousState);
    setComponentState({
      previousState: componentState.currentState,
      currentState: newCurrentState
    });
  }
  
  // const transformApiProductCompositeIdToSelectItemIdList = (apiProductCompositeId: TAPDeveloperPortalApiProductCompositeId): TApiEntitySelectItemList => {
  //   return [
  //     {
  //       id: apiProductCompositeId.apiProductId,
  //       displayName: apiProductCompositeId.apiProductDisplayName
  //     }
  //   ];
  // }
  
  const ToolbarNewManagedObjectButtonLabel = 'New App';
  const ToolbarEditManagedObjectButtonLabel = 'Edit App';
  const ToolbarManageApiProductsManagedObjectButtonLabel = "Manage API Products";
  const ToolbarManageWebhooksManagedObjectButtonLabel = 'Manage Webhooks';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete App';
  const ToolbarMonitorManagedObjectButtonLabel = 'Monitor Stats';
  
  const [userContext] = React.useContext(UserContext);
  const [authContext] = React.useContext(AuthContext);

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  
  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();
  const [managedObject_AllowedActions, setManagedObject_AllowedActions] = React.useState<TAPDeveloperPortalUserAppDisplay_AllowedActions>(APDeveloperPortalUserAppsDisplayService.get_Empty_AllowedActions());

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showManageApiProductsComponent, setShowManageApiProductsComponent] = React.useState<boolean>(false);
  const [showManageWebhooksComponent, setShowManageWebhooksComponent] = React.useState<boolean>(false);
  const [showMonitorComponent, setShowMonitorComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);

  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  
  React.useEffect(() => {    
    if(props.createAppWithApiProductEntityId !== undefined) {
      setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_NEW);
    } else {
      setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    }    
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    props.setBreadCrumbItemList(breadCrumbItemList);
  }, [breadCrumbItemList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_DELETE_USER_APP:
          case E_CALL_STATE_ACTIONS.API_CREATE_USER_APP:
          case E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP:
              props.onSuccess(apiCallStatus);
            break;
          default:
        }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedObject = (apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apDeveloperPortalUserAppDisplay.apEntityId);
    setManagedObject_AllowedActions(APDeveloperPortalUserAppsDisplayService.get_AllowedActions({
      apDeveloperPortalUserAppDisplay: apDeveloperPortalUserAppDisplay
    }));
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  
  // * New Object *
  const onNewManagedObject = () => {
    setApiCallStatus(null);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  // * Edit Object *
  const onEditManagedObjectFromToolbar = () => {
    const funcName = 'onEditManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Edit Api Products *
  const onManageApiProductssManagedObjectFromToolbar = () => {
    const funcName = 'onManageApiProductssManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_API_PRODUCTS);
  }
  // * Edit Webhooks *
  const onManageWebhooksManagedObjectFromToolbar = () => {
    const funcName = 'onManageWebhooksManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_WEBHOOKS);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Monitor *
  const onMonitorManagedObjectFromToolbar = () => {
    const funcName = 'onMonitorManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MONITOR);
  }

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
      </React.Fragment>
    );
    if(showViewComponent) {
      return (
        <React.Fragment>
          <Button key={ComponentName+ToolbarNewManagedObjectButtonLabel} label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
          <Button key={ComponentName+ToolbarEditManagedObjectButtonLabel} label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>
          <Button 
            key={ComponentName+ToolbarManageApiProductsManagedObjectButtonLabel}
            label={ToolbarManageApiProductsManagedObjectButtonLabel} 
            // icon="pi pi-pencil" 
            onClick={onManageApiProductssManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
          />
          <Button 
            key={ComponentName+ToolbarManageWebhooksManagedObjectButtonLabel}
            label={ToolbarManageWebhooksManagedObjectButtonLabel} 
            // icon="pi pi-pencil" 
            onClick={onManageWebhooksManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
            disabled={!managedObject_AllowedActions.isManageWebhooksAllowed}
          />
          <Button 
            key={ComponentName+ToolbarMonitorManagedObjectButtonLabel}
            label={ToolbarMonitorManagedObjectButtonLabel} 
            // icon="pi pi-pencil" 
            onClick={onMonitorManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
            disabled={!managedObject_AllowedActions.isMonitorStatsAllowed}
          />
        </React.Fragment>
      )
    }
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;
  }

  const renderRightToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showViewComponent) {
      return (
        <React.Fragment>
          <Button 
            key={ComponentName+ToolbarDeleteManagedObjectButtonLabel}
            label={ToolbarDeleteManagedObjectButtonLabel} 
            icon="pi pi-trash" 
            onClick={onDeleteManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
            style={{ color: "red", borderColor: 'red'}}
          />
        </React.Fragment>
      );
    }
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarContent: JSX.Element | undefined = renderLeftToolbarContent();
    const rightToolbarContent: JSX.Element | undefined = renderRightToolbarContent();
    if(leftToolbarContent || rightToolbarContent) return (<Toolbar className="p-mb-4" left={leftToolbarContent} right={rightToolbarContent} />);
    else return (<React.Fragment></React.Fragment>);
  }
  
  // * prop callbacks *
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    setBreadCrumbItemList(itemList);
  }
  // const onSubComponentAddBreadCrumbItemList = (itemList: Array<MenuItem>) => {
  //   const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
  //   props.setBreadCrumbItemList(newItemList);
  // }
  const onSetManageUserAppComponentState_To_View = (apAppEntityId: TAPEntityId) => {
    setManagedObjectEntityId(apAppEntityId);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    // setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, newMoEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    setManagedObjectEntityId(newMoEntityId);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }
  const onManageApiProductsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
  }
  const onEditWebhooksManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }
  const onSubComponentUserNotification = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentCancel = () => {
    setPreviousComponentState();
  }

  const calculateShowStates = (componentState: TComponentState) => {
    const funcName = 'calculateShowStates';
    const logName = `${ComponentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageApiProductsComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if(componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageApiProductsComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageApiProductsComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if(  componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowManageApiProductsComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowManageApiProductsComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowManageApiProductsComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_API_PRODUCTS) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageApiProductsComponent(true);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_WEBHOOKS) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageApiProductsComponent(false);
      setShowManageWebhooksComponent(true);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageApiProductsComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MONITOR) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageApiProductsComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="apd-manage-user-apps">

      <CheckConnectorHealth />
      
      <Loading show={isLoading} />      
      
      {!isLoading && renderToolbar() }
      
      {/* <ApiCallStatusError apiCallStatus={apiCallStatus} /> */}

      {showListComponent && 
        <DeveloperPortalListUserApps
          key={`${ComponentName}_DeveloperPortalListUserApps_${refreshCounter}`}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onManagedObjectView={onViewManagedObject}
        />
      }
      {showViewComponent && managedObjectEntityId &&
        <DeveloperPortalViewUserApp
          key={`${ComponentName}_DeveloperPortalViewUserApp_${refreshCounter}`}
          organizationEntityId={props.organizationEntityId}
          appEntityId={managedObjectEntityId}
          onSuccess={onSubComponentUserNotification}
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageUserAppComponentState_To_View}
        />      
      }
      {showDeleteComponent && managedObjectEntityId &&
        <DeveloperPortalDeleteUserApp
          organizationId={props.organizationEntityId.id}
          appEntityId={managedObjectEntityId}
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          onDeleteSuccess={onDeleteManagedObjectSuccess}
        />
      }
      { showNewComponent &&
        <ManageNewUserApp
          organizationId={props.organizationEntityId.id}
          onNewSuccess={onNewManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {showEditComponent && managedObjectEntityId &&
        <ManageEditUserApp
          organizationId={props.organizationEntityId.id}
          appEntityId={managedObjectEntityId}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateToCommand={onSetManageUserAppComponentState_To_View}
          onSaveSuccess={onSubComponentUserNotification}
        />
      }
      {showManageApiProductsComponent && managedObjectEntityId &&
        <ManageApiProducts
          organizationId={props.organizationEntityId.id}
          appEntityId={managedObjectEntityId}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateToCommand={onSetManageUserAppComponentState_To_View}
          onSaveSuccess={onManageApiProductsSuccess}
        />
      }
      {showManageWebhooksComponent && managedObjectEntityId &&
      <p>showManageWebhooksComponent</p>
        // <DeveloperPortalManageUserAppWebhooks
        //   key={refreshCounter}
        //   organizationId={props.organizationName}
        //   userId={props.userId}
        //   appId={managedObjectId}
        //   appDisplayName={managedObjectDisplayName}
        //   onSuccess={onEditWebhooksManagedObjectSuccess} 
        //   onError={onSubComponentError}
        //   onCancel={onSubComponentCancel}
        //   onLoadingChange={setIsLoading}
        //   setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        //   onNavigateHere={onSetManageUserAppComponentState}
        // />
      }
      {showMonitorComponent && managedObjectEntityId &&
      <p>showMonitorComponent</p>
        // <APMonitorUserApp
        //   key={refreshCounter}
        //   organizationId={props.organizationName}
        //   appId={managedObjectId}
        //   appDisplayName={managedObjectDisplayName}
        //   appType={AppListItem.appType.DEVELOPER}
        //   appOwnerId={props.userId}
        //   onError={onSubComponentError}
        //   onCancel={onSubComponentCancel}
        //   onLoadingChange={setIsLoading}
        //   setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        // />
      }
    </div>
  );
}
