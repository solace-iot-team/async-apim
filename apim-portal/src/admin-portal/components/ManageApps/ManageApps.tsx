
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { 
  AppResponse, 
  AppStatus 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { TApiCallState } from "../../../utils/ApiCallState";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { TViewManagedApp } from '../../../components/APApiObjectsCommon';
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";
import { ListApps } from "./ListApps";
import { ViewApp } from "./ViewApp";
import { EditAppAttributes } from "./EditAppAttributes";
import { ApproveApp } from "./ApproveApp";
import { RevokeApp } from "./RevokeApp";
import { DeleteApp } from "./DeleteApp";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IManageAppsProps {
  organizationId: TAPOrganizationId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onBreadCrumbLabelList: (breadCrumbLableList: Array<string>) => void;
}

export const ManageApps: React.FC<IManageAppsProps> = (props: IManageAppsProps) => {
  const componentName = 'ManageApps';

  type TManagedObjectId = string;
  type TViewManagedObject = TViewManagedApp;

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
    MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
    MANAGED_OBJECT_EDIT_ATTRIBUTES = "MANAGED_OBJECT_EDIT_ATTRIBUTES",
    MANAGED_OBJECT_APPROVE = "MANAGED_OBJECT_APPROVE",
    MANAGED_OBJECT_REVOKE = "MANAGED_OBJECT_REVOKE",
    MANAGED_OBJECT_DELETE = "MANAGED_OBJECT_DELETE"
  }
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

  // /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  // const [configContext, dispatchConfigContext] = React.useContext(ConfigContext);
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectId, setManagedObjectId] = React.useState<TManagedObjectId>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  const [viewManagedObject, setViewManagedObject] = React.useState<TViewManagedObject>();
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [refreshViewComponentKey, setRefreshViewComponentKey] = React.useState<number>(0);
  const [viewAppApiAppResponse, setViewAppApiAppResponse] = React.useState<AppResponse>();
  const [showApproveComponent, setShowApproveComponent] = React.useState<boolean>(false);
  const [showRevokeComponent, setShowRevokeComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showEditAttributesComponent, setShowEditAttributesComponent] = React.useState<boolean>(false);

  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(!managedObjectDisplayName) return;
    if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW ||
        componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT_ATTRIBUTES
      ) props.onBreadCrumbLabelList([managedObjectDisplayName]);
    else props.onBreadCrumbLabelList([]);
  }, [componentState, managedObjectDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
  
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showViewComponent) {          
      if(viewAppApiAppResponse && viewAppApiAppResponse.status !== AppStatus.APPROVED) {
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
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} />);
    else return (<React.Fragment></React.Fragment>);
  }
  
  // * prop callbacks *
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
    setRefreshViewComponentKey(refreshViewComponentKey + 1);
  }
  const onRevokeManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    setRefreshViewComponentKey(refreshViewComponentKey + 1);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
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
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT_ATTRIBUTES) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditAttributesComponent(true);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_APPROVE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(true);
      setShowRevokeComponent(false);
      setShowDeleteComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_REVOKE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(true);
      setShowDeleteComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditAttributesComponent(false);
      setShowApproveComponent(false);
      setShowRevokeComponent(false);
      setShowDeleteComponent(true);
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
          key={componentState.previousState}
          organizationId={props.organizationId}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectEdit={onEditAttributesManagedObject}
          onManagedObjectView={onViewManagedObject}
        />
      }

      {showViewComponent && managedObjectId && managedObjectDisplayName && 
        viewManagedObject && viewManagedObject.appListItem.appType && viewManagedObject.appListItem.ownerId &&
        <ViewApp
          key={refreshViewComponentKey}
          organizationId={props.organizationId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          appType={viewManagedObject.appListItem.appType}
          appOwnerId={viewManagedObject.appListItem.ownerId}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          onLoadingFinished={onViewAppLoadingFinished}
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
    </div>
  );
}
