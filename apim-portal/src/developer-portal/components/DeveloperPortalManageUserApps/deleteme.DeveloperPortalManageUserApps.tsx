
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import {
  AppListItem,
  CommonDisplayName,
  CommonName,
} from "@solace-iot-team/apim-connector-openapi-browser";
import { 
  APSUserId 
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import { TApiCallState } from "../../../utils/ApiCallState";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { APManagedUserAppDisplay, TAPDeveloperPortalUserAppDisplay, TApiEntitySelectItemList, TAPOrganizationId } from "../../../components/deleteme.APComponentsCommon";
import { DeveloperPortalListUserApps } from "./deleteme.DeveloperPortalListUserApps";
import { E_CALL_STATE_ACTIONS, E_MANAGE_USER_APP_COMPONENT_STATE, TAPDeveloperPortalApiProductCompositeId } from "./deleteme.DeveloperPortalManageUserAppsCommon";
import { DeveloperPortalViewUserApp } from "./deleteme.DeveloperPortalViewUserApp";
import { DeveloperPortalNewEditUserApp, EAction } from "./deleteme.DeveloperPortalNewEditUserApp";
import { DeveloperPortalDeleteUserApp } from "./deleteme.DeveloperPortalDeleteUserApp";
import { TManagedObjectId } from "../../../components/APApiObjectsCommon";
import { DeveloperPortalManageUserAppWebhooks } from "./DeveloperPortalManageUserAppWebhooks/deleteme.DeveloperPortalManageUserAppWebhooks";
import { APMonitorUserApp } from "../../../components/APMonitorApp/deleteme.APMonitorUserApp";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";

import '../../../components/APComponents.css';
import "./deleteme.DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalManageUserAppsProps {
  organizationName: TAPOrganizationId;
  userId: APSUserId;
  createAppWithApiProductCompositeId?: TAPDeveloperPortalApiProductCompositeId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const DeveloperPortalManageUserApps: React.FC<IDeveloperPortalManageUserAppsProps> = (props: IDeveloperPortalManageUserAppsProps) => {
  const componentName = 'DeveloperPortalManageUserApps';

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
  
  const transformApiProductCompositeIdToSelectItemIdList = (apiProductCompositeId: TAPDeveloperPortalApiProductCompositeId): TApiEntitySelectItemList => {
    return [
      {
        id: apiProductCompositeId.apiProductId,
        displayName: apiProductCompositeId.apiProductDisplayName
      }
    ];
  }
  
  const ToolbarNewManagedObjectButtonLabel = 'New App';
  const ToolbarEditManagedObjectButtonLabel = 'Edit App';
  const ToolbarManageWebhooksManagedObjectButtonLabel = 'Manage Webhooks';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete App';
  const ToolbarMonitorManagedObjectButtonLabel = 'Monitor Stats';
  
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectId, setManagedObjectId] = React.useState<TManagedObjectId>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [viewComponentManagedObjectDisplay, setViewComponentManagedObjectDisplay] = React.useState<TAPDeveloperPortalUserAppDisplay>();
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showManageWebhooksComponent, setShowManageWebhooksComponent] = React.useState<boolean>(false);
  const [showMonitorComponent, setShowMonitorComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [presetApiProductSelectItemList, setPresetApiProductSelectItemList] = React.useState<TApiEntitySelectItemList>([]);

  React.useEffect(() => {    
    if(props.createAppWithApiProductCompositeId) {
      setPresetApiProductSelectItemList(transformApiProductCompositeIdToSelectItemIdList(props.createAppWithApiProductCompositeId));
      setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_NEW);
    } else {
      setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    }    
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
  const onViewManagedObject = (id: TManagedObjectId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
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
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onEditManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onEditManagedObject = (id: TManagedObjectId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Edit Webhooks *
  const onManageWebhooksManagedObjectFromToolbar = () => {
    const funcName = 'onManageWebhooksManagedObjectFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onManageWebhooksManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onManageWebhooksManagedObject = (id: TManagedObjectId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_WEBHOOKS);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onDeleteManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onDeleteManagedObject = (id: TManagedObjectId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
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
      if(!viewComponentManagedObjectDisplay) return undefined;
      const jsxButtonList: Array<JSX.Element> = [
        <Button key={componentName+ToolbarNewManagedObjectButtonLabel} label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>,
        <Button key={componentName+ToolbarEditManagedObjectButtonLabel} label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>,
        <Button 
          key={componentName+ToolbarDeleteManagedObjectButtonLabel}
          label={ToolbarDeleteManagedObjectButtonLabel} 
          icon="pi pi-trash" 
          onClick={onDeleteManagedObjectFromToolbar} 
          className="p-button-text p-button-plain p-button-outlined"
        />,
        <Button 
        key={componentName+ToolbarManageWebhooksManagedObjectButtonLabel}
        label={ToolbarManageWebhooksManagedObjectButtonLabel} 
        // icon="pi pi-pencil" 
        onClick={onManageWebhooksManagedObjectFromToolbar} 
        className="p-button-text p-button-plain p-button-outlined"
        disabled={!viewComponentManagedObjectDisplay.isAppWebhookCapable}
      />
  ];
      return (
        <div className="p-grid">
          {jsxButtonList}
        </div>
      );
    }
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showViewComponent) {
      if(!viewComponentManagedObjectDisplay) return undefined;
      return (
        <React.Fragment>
          <Button 
            key={componentName+ToolbarMonitorManagedObjectButtonLabel}
            label={ToolbarMonitorManagedObjectButtonLabel} 
            // icon="pi pi-pencil" 
            onClick={onMonitorManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
            disabled={!APManagedUserAppDisplay.isAppLive(viewComponentManagedObjectDisplay.apiAppResponse_smf)}
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
  const onSetManageUserAppComponentState = (managedUserAppComponentState: E_MANAGE_USER_APP_COMPONENT_STATE, appid: CommonName, appDisplayName: CommonDisplayName) => {
    setManagedObjectId(appid);
    setManagedObjectDisplayName(appDisplayName);
    setNewComponentState(managedUserAppComponentState);
    setRefreshCounter(refreshCounter + 1);
  }
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, newId: TManagedObjectId, newDisplayName: string) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setManagedObjectId(newId);
      setManagedObjectDisplayName(newDisplayName);
      setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onEditManagedObjectSuccess = (apiCallState: TApiCallState, updatedDisplayName?: string) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      if(updatedDisplayName) setManagedObjectDisplayName(updatedDisplayName);
      setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onEditWebhooksManagedObjectSuccess = (apiCallState: TApiCallState) => {
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
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if(componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
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
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if(  componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
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
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_WEBHOOKS) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(true);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MONITOR) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(false);
      setShowMonitorComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
  }

  return (
    <div className="apd-manage-user-apps">

      <CheckConnectorHealth />
      
      <Loading show={isLoading} />      
      
      {!isLoading && renderToolbar() }
      
      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {showListComponent && 
        <DeveloperPortalListUserApps
          key={refreshCounter}
          organizationId={props.organizationName}
          userId={props.userId}
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
        <DeveloperPortalViewUserApp
          key={refreshCounter}
          organizationId={props.organizationName}
          userId={props.userId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          onLoadingStart={() => setIsLoading(true)}
          onLoadingFinished={(viewApp: TAPDeveloperPortalUserAppDisplay) => { setViewComponentManagedObjectDisplay(viewApp); setIsLoading(false); }}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageUserAppComponentState}
        />      
      }
      {showDeleteComponent && managedObjectId && managedObjectDisplayName &&
        <DeveloperPortalDeleteUserApp
          organizationId={props.organizationName}
          userId={props.userId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          onSuccess={onDeleteManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      { showNewComponent &&
        <DeveloperPortalNewEditUserApp
          action={EAction.NEW}
          organizationId={props.organizationName}
          userId={props.userId}
          onNewSuccess={onNewManagedObjectSuccess} 
          onEditSuccess={onEditManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          presetApiProductSelectItemList={presetApiProductSelectItemList}
        />
      }
      {showEditComponent && managedObjectId && managedObjectDisplayName &&
        <DeveloperPortalNewEditUserApp
          action={EAction.EDIT}
          organizationId={props.organizationName}
          userId={props.userId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          onNewSuccess={onNewManagedObjectSuccess} 
          onEditSuccess={onEditManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      {showManageWebhooksComponent && managedObjectId && managedObjectDisplayName &&
        <DeveloperPortalManageUserAppWebhooks
          key={refreshCounter}
          organizationId={props.organizationName}
          userId={props.userId}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          onSuccess={onEditWebhooksManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
          onNavigateHere={onSetManageUserAppComponentState}
        />
      }
      {showMonitorComponent && managedObjectId && managedObjectDisplayName &&
        <APMonitorUserApp
          key={refreshCounter}
          organizationId={props.organizationName}
          appId={managedObjectId}
          appDisplayName={managedObjectDisplayName}
          appType={AppListItem.appType.DEVELOPER}
          appOwnerId={props.userId}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        />
      }
    </div>
  );
}
