
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { TApiCallState } from "../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./ManageAppsCommon";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APAdminPortalAppsDisplayService, { 
  TAPAdminPortalAppDisplay, 
  TAPAdminPortalAppDisplay_AllowedActions 
} from "../../displayServices/APAdminPortalAppsDisplayService";
import { ListApps } from "./ListApps";
import { ViewApp } from "./ViewApp";
import { DeleteApp } from "./DeleteApp";
import { ManageAccess } from "./ManageAccess/ManageAccess";
import { MonitorApp } from "./MonitorApp";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IManageAppsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageApps: React.FC<IManageAppsProps> = (props: IManageAppsProps) => {
  const ComponentName = 'ManageApps';

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
  
  const ToolbarManagedAccessButtonLabel = "Manage Access";
  const ToolbarDeleteButtonLabel = 'Delete';
  const ToolbarMonitorButtonLabel = 'Monitor Stats';

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();
  const [managedObject_AllowedActions, setManagedObject_AllowedActions] = React.useState<TAPAdminPortalAppDisplay_AllowedActions>(APAdminPortalAppsDisplayService.get_Empty_AllowedActions());

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showManageAccessComponent, setShowManageAccessComponent] = React.useState<boolean>(false);
  const [showMonitorComponent, setShowMonitorComponent] = React.useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
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
          case E_CALL_STATE_ACTIONS.API_GET_APP_LIST:
          case E_CALL_STATE_ACTIONS.API_GET_APP:
            break;
          default:
            props.onSuccess(apiCallStatus);
          }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedObject = (apAdminPortalAppDisplay: TAPAdminPortalAppDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apAdminPortalAppDisplay.apEntityId);
    setManagedObject_AllowedActions(APAdminPortalAppsDisplayService.get_AllowedActions({
      apAppDisplay: apAdminPortalAppDisplay
    }));
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * Manage Access *
  const onManageAccessFromToolbar = () => {
    const funcName = 'onManageAccessFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_ACCESS);
  }
  // * Delete *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Monitor *
  const onMonitorFromToolbar = () => {
    const funcName = 'onMonitorFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_MONITOR);
  }
  
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showViewComponent) {          
      return (
        <React.Fragment>
          <Button 
            key={ComponentName+ToolbarManagedAccessButtonLabel} 
            label={ToolbarManagedAccessButtonLabel} 
            // icon="pi pi-pencil" 
            onClick={onManageAccessFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
          />
          <Button 
            key={ComponentName+ToolbarMonitorButtonLabel}
            label={ToolbarMonitorButtonLabel} 
            onClick={onMonitorFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
            disabled={!managedObject_AllowedActions.isMonitorStatsAllowed}
          />
        </React.Fragment>
      );
    }
    return undefined;
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showViewComponent) {
      return (
        <React.Fragment>
          <Button 
            key={ComponentName+ToolbarDeleteButtonLabel}
            label={ToolbarDeleteButtonLabel} 
            icon="pi pi-trash" 
            onClick={onDeleteManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
            style={{ color: "red", borderColor: 'red'}}
          />
        </React.Fragment>
      );
    }
    return undefined;
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarContent: JSX.Element | undefined = renderLeftToolbarContent();
    const rightToolbarContent: JSX.Element | undefined = renderRightToolbarContent();
    if(leftToolbarContent || rightToolbarContent) return (<Toolbar className="p-mb-4" left={leftToolbarContent} right={rightToolbarContent} />);
    else return (<></>);
  }
  
  // * prop callbacks *
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    setBreadCrumbItemList(itemList);
  }
  const onSetManageObjectComponentState_To_View = (appEntityId: TAPEntityId) => {
    setManagedObjectEntityId(appEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
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
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowDeleteComponent(false);
      setShowManageAccessComponent(false);
      setShowMonitorComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowDeleteComponent(false);
      setShowManageAccessComponent(false);
      setShowMonitorComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowDeleteComponent(false);
      setShowManageAccessComponent(false);
      setShowMonitorComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_ACCESS) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowDeleteComponent(false);
      setShowManageAccessComponent(true);
      setShowMonitorComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowDeleteComponent(true);
      setShowManageAccessComponent(false);
      setShowMonitorComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_MONITOR) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowDeleteComponent(false);
      setShowManageAccessComponent(false);
      setShowMonitorComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="ap-manage-apps">

      <CheckConnectorHealth />

      <Loading show={isLoading} />      
      
      { !isLoading && renderToolbar() }

      {showListComponent && 
        <ListApps      
          key={`${ComponentName}_ListApps_${refreshCounter}`}
          organizationId={props.organizationId}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onManagedObjectView={onViewManagedObject}
        />
      }

      {showViewComponent && managedObjectEntityId &&
        <ViewApp
          key={`${ComponentName}_ViewApp_${refreshCounter}`}
          organizationId={props.organizationId}
          appEntityId={managedObjectEntityId}
          onSuccess={onSubComponentUserNotification}
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageObjectComponentState_To_View}
        />
      }

      {showDeleteComponent && managedObjectEntityId &&
        <DeleteApp
          organizationId={props.organizationId}
          appEntityId={managedObjectEntityId}
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          onDeleteSuccess={onDeleteManagedObjectSuccess}
        />      
      }

      {showManageAccessComponent && managedObjectEntityId &&
        <ManageAccess
          organizationId={props.organizationId}
          appEntityId={managedObjectEntityId}
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateToCommand={onSetManageObjectComponentState_To_View}
          onSaveSuccess={onSubComponentUserNotification}
        />      
      }
      {showMonitorComponent && managedObjectEntityId &&
        <MonitorApp
          organizationId={props.organizationId}
          appEntityId={managedObjectEntityId}
          onError={onSubComponentError}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onLoadingChange={setIsLoading}
          onNavigateToApp={onSetManageObjectComponentState_To_View}
        />
      }

    </div>
  );
}
