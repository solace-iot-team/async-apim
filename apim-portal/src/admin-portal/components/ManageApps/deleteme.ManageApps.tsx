
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { 
  AppResponse, CommonDisplayName, CommonName, 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { TApiCallState } from "../../../utils/ApiCallState";
import { APManagedUserAppDisplay, TAPOrganizationId } from "../../../components/deleteme.APComponentsCommon";
import { TViewManagedApp } from '../../../components/APApiObjectsCommon';
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./deleteme.ManageAppsCommon";
import { ListApps } from "./deleteme.ListApps";
import { ViewApp } from "./deleteme.ViewApp";
import { EditAppAttributes } from "./deleteme.EditAppAttributes";
import { ApproveApp } from "./deleteme.ApproveApp";
import { RevokeApp } from "./deleteme.RevokeApp";
import { DeleteApp } from "./deleteme.DeleteApp";
import { APMonitorUserApp } from "../../../components/APMonitorApp/deleteme.APMonitorUserApp";

import '../../../components/APComponents.css';
import "./deleteme.ManageApps.css";

export interface IManageAppsProps {
  organizationId: TAPOrganizationId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageApps: React.FC<IManageAppsProps> = (props: IManageAppsProps) => {
  const componentName = 'ManageApps';

  type TManagedObjectId = string;
  type TViewManagedObject = TViewManagedApp;

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
  
  const ToolbarEditAttributesManagedObjectButtonLabel = 'Edit Attributes';
  const ToolbarApproveManagedObjectButtonLabel = 'Approve';
  // const ToolbarRevokeManagedObjectButtonLabel = 'Revoke';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete';
  const ToolbarMonitorManagedObjectButtonLabel = 'Monitor Stats';

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectId, setManagedObjectId] = React.useState<TManagedObjectId>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  const [viewManagedObject, setViewManagedObject] = React.useState<TViewManagedObject>();
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [viewAppApiAppResponse, setViewAppApiAppResponse] = React.useState<AppResponse>();
  const [showApproveComponent, setShowApproveComponent] = React.useState<boolean>(false);
  const [showRevokeComponent, setShowRevokeComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showEditAttributesComponent, setShowEditAttributesComponent] = React.useState<boolean>(false);
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

  // React.useEffect(() => {
  //   if(!managedObjectDisplayName) return;
  //   if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW ||
  //       componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT_ATTRIBUTES
  //     ) props.onBreadCrumbLabelList([managedObjectDisplayName]);
  //   else props.onBreadCrumbLabelList([]);
  // }, [componentState, managedObjectDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
  const onViewManagedObject = (id: TManagedObjectId, displayName: string, viewManagedObject: TViewManagedObject): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setViewManagedObject(viewManagedObject);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * Edit Attributes *
  const onEditAttributesFromToolbar = () => {
    const funcName = 'onEditAttributesFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onEditAttributesManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onEditAttributesManagedObject = (id: TManagedObjectId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT_ATTRIBUTES);
  }
  // * Approve *
  const onApproveFromToolbar = () => {
    const funcName = 'onApproveFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onApproveManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onApproveManagedObject = (id: TManagedObjectId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_APPROVE);
  }

  // // * Revoke  
  // const onRevokeFromToolbar = () => {
  //   const funcName = 'onRevokeFromToolbar';
  //   const logName = `${componentName}.${funcName}()`;
  //   if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
  //   if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
  //   onRevokeManagedObject(managedObjectId, managedObjectDisplayName);
  // }
  // const onRevokeManagedObject = (id: TManagedObjectId, displayName: string): void => {
  //   setApiCallStatus(null);
  //   setManagedObjectId(id);
  //   setManagedObjectDisplayName(displayName);
  //   setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_REVOKE);
  // }

  // * Delete
  const onDeleteFromToolbar = () => {
    const funcName = 'onDeleteFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onDeleteManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onDeleteManagedObject = (id: TManagedObjectId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  
  // * Monitor *
  const onMonitorManagedObjectFromToolbar = () => {
    const funcName = 'onMonitorManagedObjectFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onMonitorManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onMonitorManagedObject = (id: TManagedObjectId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_MONITOR);
  }
  
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showViewComponent) {          
      if(viewAppApiAppResponse && !APManagedUserAppDisplay.isAppLive(viewAppApiAppResponse)) {
        return (
          <React.Fragment>
            <Button 
              label={ToolbarDeleteManagedObjectButtonLabel} 
              icon="pi pi-trash" 
              onClick={onDeleteFromToolbar} 
              className="p-button-text p-button-plain p-button-outlined"
            />
            <Button 
              label={ToolbarEditAttributesManagedObjectButtonLabel} 
              icon="pi pi-pencil" 
              onClick={onEditAttributesFromToolbar} 
              className="p-button-text p-button-plain p-button-outlined"
            />
            <Button 
              label={ToolbarApproveManagedObjectButtonLabel} 
              icon="pi pi-check" 
              onClick={onApproveFromToolbar} 
              className="p-button-text p-button-plain p-button-outlined"
            />        
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment>
            <Button 
              label={ToolbarDeleteManagedObjectButtonLabel} 
              icon="pi pi-trash" 
              onClick={onDeleteFromToolbar} 
              className="p-button-text p-button-plain p-button-outlined"
            />
          </React.Fragment>
        );
      }
    }
    if(showEditAttributesComponent) {
      return undefined;
    }
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showViewComponent) {
      if(!viewAppApiAppResponse) return undefined;
      return (
        <React.Fragment>
          <Button 
            key={componentName+ToolbarMonitorManagedObjectButtonLabel}
            label={ToolbarMonitorManagedObjectButtonLabel} 
            // icon="pi pi-pencil" 
            onClick={onMonitorManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
            disabled={!APManagedUserAppDisplay.isAppLive(viewAppApiAppResponse)}
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
    props.setBreadCrumbItemList(itemList);
  }
  const onSubComponentAddBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
    props.setBreadCrumbItemList(newItemList);
  }
  const onSetManageAppComponentState = (managedAppComponentState: E_COMPONENT_STATE, appid: CommonName, appDisplayName: CommonDisplayName) => {
    setManagedObjectId(appid);
    setManagedObjectDisplayName(appDisplayName);
    setNewComponentState(managedAppComponentState);
    setRefreshCounter(refreshCounter + 1);
  }
  const onViewAppLoadingFinished = (apiAppResponse: AppResponse) => {
    setViewAppApiAppResponse(apiAppResponse);
  }
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onApproveManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onRevokeManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
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
    const funcName = 'calculateShowStates';
    const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
      setShowMonitorComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
      setShowMonitorComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
      setShowMonitorComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT_ATTRIBUTES) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditAttributesComponent(true);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
      setShowMonitorComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_APPROVE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(true);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
      setShowMonitorComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_REVOKE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(true);
      setShowDeleteComponent(false);
      setShowMonitorComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(true);
      setShowMonitorComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_MONITOR) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
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
          key={refreshCounter}
          organizationId={props.organizationId}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectEdit={onEditAttributesManagedObject}
          onManagedObjectView={onViewManagedObject}
          setBreadCrumbItemList={props.setBreadCrumbItemList}
        />
      }

      {showViewComponent && managedObjectId && managedObjectDisplayName && 
        viewManagedObject && viewManagedObject.appListItem.appType && viewManagedObject.appListItem.ownerId &&
        <ViewApp
          key={refreshCounter}
          organizationId={props.organizationId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          appType={viewManagedObject.appListItem.appType}
          appOwnerId={viewManagedObject.appListItem.ownerId}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          onLoadingFinished={onViewAppLoadingFinished}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageAppComponentState}
        />      
      }
      {showEditAttributesComponent && managedObjectId && managedObjectDisplayName &&
        viewManagedObject && viewManagedObject.appListItem.appType && viewManagedObject.appListItem.ownerId &&
        <EditAppAttributes
          organizationId={props.organizationId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          appType={viewManagedObject.appListItem.appType}
          appOwnerId={viewManagedObject.appListItem.ownerId}
          onEditSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        />      
      }
      {showApproveComponent && managedObjectId && managedObjectDisplayName &&
        viewManagedObject && viewManagedObject.appListItem.appType && viewManagedObject.appListItem.ownerId &&
        <ApproveApp
          organizationId={props.organizationId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          appType={viewManagedObject.appListItem.appType}
          appOwnerId={viewManagedObject.appListItem.ownerId}
          onSuccess={onApproveManagedObjectSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />      
      }
      {showRevokeComponent && managedObjectId && managedObjectDisplayName &&
        viewManagedObject && viewManagedObject.appListItem.appType && viewManagedObject.appListItem.ownerId &&
        <RevokeApp
          organizationId={props.organizationId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          appType={viewManagedObject.appListItem.appType}
          appOwnerId={viewManagedObject.appListItem.ownerId}
          onSuccess={onRevokeManagedObjectSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />      
      }
      {showDeleteComponent && managedObjectId && managedObjectDisplayName &&
        viewManagedObject && viewManagedObject.appListItem.appType && viewManagedObject.appListItem.ownerId &&
        <DeleteApp
          organizationId={props.organizationId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          appType={viewManagedObject.appListItem.appType}
          appOwnerId={viewManagedObject.appListItem.ownerId}
          onSuccess={onDeleteManagedObjectSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />      
      }
      {showMonitorComponent && managedObjectId && managedObjectDisplayName &&
        viewManagedObject && viewManagedObject.appListItem.appType && viewManagedObject.appListItem.ownerId &&
        <APMonitorUserApp
          key={refreshCounter}
          organizationId={props.organizationId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          appType={viewManagedObject.appListItem.appType}
          appOwnerId={viewManagedObject.appListItem.ownerId}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        />
      }

    </div>
  );
}
