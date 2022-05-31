
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";
import { OrganizationContext } from "../../../components/APContextProviders/APOrganizationContextProvider";
import APSystemOrganizationsDisplayService from "../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./ManageApisCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { ListApis } from "./ListApis";
import APApisDisplayService, { IAPApiDisplay, TAPApiDisplay_AllowedActions } from "../../../displayServices/APApisDisplayService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { ViewApi } from "./ViewApi";
import { ManageNewApi } from "./EditNewApi/ManageNewApi";
import { E_Edit_Scope, ManageEditApi } from "./EditNewApi/ManageEditApi";
import { DeleteApi } from "./DeleteApi";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IManageApisProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageApis: React.FC<IManageApisProps> = (props: IManageApisProps) => {
  const ComponentName = 'ManageApis';

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
  const ToolbarButtonLabelImportEventPortal = 'Import from Event Portal';

  const [configContext] = React.useContext(ConfigContext);
  const [userContext] = React.useContext(UserContext);
  const [authContext] = React.useContext(AuthContext);
  const [organizationContext] = React.useContext(OrganizationContext);
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();
  const [managedObject_AllowedActions, setManagedObject_AllowedActions] = React.useState<TAPApiDisplay_AllowedActions>(APApisDisplayService.get_Empty_AllowedActions());

  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showImportEventPortalComponent, setShowImportEventPortalComponent] = React.useState<boolean>(false);


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
    if(apiCallStatus === null) return;
    if(apiCallStatus.success) {
      switch (apiCallStatus.context.action) {
        case E_CALL_STATE_ACTIONS.API_GET_API_NAME_LIST:
        case E_CALL_STATE_ACTIONS.API_GET_API:
          break;
        default:
          props.onSuccess(apiCallStatus);
        }
    } else props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * initialized object *
  const onInitializedManagedObject = (apApiDisplay: IAPApiDisplay) => {
    const apApiDisplay_AllowedActions: TAPApiDisplay_AllowedActions = APApisDisplayService.get_AllowedActions({
      apApiDisplay: apApiDisplay,
      authorizedResourcePathAsString: authContext.authorizedResourcePathsAsString,
      userId: userContext.apLoginUserDisplay.apEntityId.id,
      userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id,
      hasEventPortalConnectivity: APSystemOrganizationsDisplayService.has_EventPortalConnectivity({ 
        apOrganizationDisplay: organizationContext
      }),
      isEventPortalApisProxyMode: configContext.connectorInfo?.connectorAbout.portalAbout.isEventPortalApisProxyMode !== undefined && configContext.connectorInfo?.connectorAbout.portalAbout.isEventPortalApisProxyMode,
    });
    setManagedObject_AllowedActions(apApiDisplay_AllowedActions);
  }

  // * Changed object *
  const onChangedManagedObject = (apApiDisplay: IAPApiDisplay) => {
    const apApiDisplay_AllowedActions: TAPApiDisplay_AllowedActions = APApisDisplayService.get_AllowedActions({
      apApiDisplay: apApiDisplay,
      authorizedResourcePathAsString: authContext.authorizedResourcePathsAsString,
      userId: userContext.apLoginUserDisplay.apEntityId.id,
      userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id,
      hasEventPortalConnectivity: APSystemOrganizationsDisplayService.has_EventPortalConnectivity({ 
        apOrganizationDisplay: organizationContext
      }),
      isEventPortalApisProxyMode: configContext.connectorInfo?.connectorAbout.portalAbout.isEventPortalApisProxyMode !== undefined && configContext.connectorInfo?.connectorAbout.portalAbout.isEventPortalApisProxyMode,
    });
    setManagedObject_AllowedActions(apApiDisplay_AllowedActions);
    setRefreshCounter(refreshCounter + 1);
  }

  //  * View Object *
  const onViewManagedObject = (apApiDisplay: IAPApiDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apApiDisplay.apEntityId);
    const apApiDisplay_AllowedActions: TAPApiDisplay_AllowedActions = APApisDisplayService.get_AllowedActions({
      apApiDisplay: apApiDisplay,
      authorizedResourcePathAsString: authContext.authorizedResourcePathsAsString,
      userId: userContext.apLoginUserDisplay.apEntityId.id,
      userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id,
      hasEventPortalConnectivity: APSystemOrganizationsDisplayService.has_EventPortalConnectivity({ 
        apOrganizationDisplay: organizationContext
      }),
      isEventPortalApisProxyMode: configContext.connectorInfo?.connectorAbout.portalAbout.isEventPortalApisProxyMode !== undefined && configContext.connectorInfo?.connectorAbout.portalAbout.isEventPortalApisProxyMode,
    });
    setManagedObject_AllowedActions(apApiDisplay_AllowedActions);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * New Object *
  const onNewManagedObject = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  // * Import from Event Portal *
  const onImportManagedObjectEventPortal = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_EVENT_PORTAL);
  }
  // * Edit Object *
  const onEditManagedObjectFromToolbar = () => {
    const funcName = 'onEditManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    const funcName = 'renderLeftToolbarContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(componentState.currentState === E_COMPONENT_STATE.UNDEFINED) return undefined;
    if(managedObject_AllowedActions === undefined) throw new Error(`${logName}: managedObject_AllowedActions === undefined`);
    // const eventPortalConnectivity: boolean  = APSystemOrganizationsDisplayService.has_EventPortalConnectivity({ 
    //   apOrganizationDisplay: organizationContext
    // });
    // const showImportEventPortalButton: boolean = (!configContext.connectorInfo?.connectorAbout.portalAbout.isEventPortalApisProxyMode) && (eventPortalConnectivity);
    const showImportEventPortalButton: boolean = false;
    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
        {showImportEventPortalButton && 
          <Button disabled={true} label={ToolbarButtonLabelImportEventPortal} icon="pi pi-cloud-download" onClick={onImportManagedObjectEventPortal} className="p-button-text p-button-plain p-button-outlined"/>
        }
      </React.Fragment>
    );
    if(showViewComponent) {          
      return (
        <React.Fragment>
          <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
          <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined" disabled={!managedObject_AllowedActions.isEditAllowed} />        
        </React.Fragment>
      );
    }
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    const funcName = 'renderRightToolbarContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(componentState.currentState === E_COMPONENT_STATE.UNDEFINED) return undefined;
    if(managedObject_AllowedActions === undefined) throw new Error(`${logName}: managedObject_AllowedActions === undefined`);
    if(showViewComponent) {
      return (
        <React.Fragment>
          <Button 
            label={ToolbarDeleteManagedObjectButtonLabel} 
            icon="pi pi-trash" 
            onClick={onDeleteManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined" 
            // disabled={!managedObject_AllowedActions.isDeleteAllowed} 
            disabled={!managedObject_AllowedActions.isDeleteAllowed} 
            style={{ color: "red", borderColor: 'red'}} 
          />        
        </React.Fragment>
      );
    }
  }
  const renderToolbar = (): JSX.Element => {
    const rightToolbarTemplate: JSX.Element | undefined = renderRightToolbarContent();
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate || rightToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />);
    else return (<></>);
  }
  
  // * prop callbacks *
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    setBreadCrumbItemList(itemList);
  }
  const onSetManageObjectComponentState_To_View = (apiEntityId: TAPEntityId) => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apiEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, newMoEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    // always go to view the new api product
    setManagedObjectEntityId(newMoEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }
  const onEditSaveManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setRefreshCounter(refreshCounter + 1);
  }
  // const onEventPortalImportEventApiProductSuccess = (apiCallState: TApiCallState) => {
  //   setApiCallStatus(apiCallState);
  //   setPreviousComponentState();
  // }
  const onSubComponentUserNotification = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentError_Notification = (apiCallState: TApiCallState) => {
    props.onError(apiCallState);
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
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowImportEventPortalComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowImportEventPortalComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowImportEventPortalComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
      setShowImportEventPortalComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowImportEventPortalComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowImportEventPortalComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
      setShowImportEventPortalComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_EVENT_PORTAL) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowImportEventPortalComponent(true);
    } 
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="manage-apis">

      <CheckConnectorHealth />

      <Loading key={ComponentName} show={isLoading} />      
      
      { !isLoading && renderToolbar() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {showListComponent && 
        <ListApis
          key={`${ComponentName}_ListApiProducts_${refreshCounter}`}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError_Notification} 
          onManagedObjectView={onViewManagedObject}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {showViewComponent && managedObjectEntityId &&
        <ViewApi
          key={`${ComponentName}_showViewComponent_${refreshCounter}`}
          organizationId={props.organizationEntityId.id}
          apiEntityId={managedObjectEntityId}
          onInitialized={onInitializedManagedObject}
          onSuccess={onSubComponentUserNotification} 
          onError={onSubComponentError_Notification} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageObjectComponentState_To_View}
        />      
      }
      {showDeleteComponent && managedObjectEntityId &&
        <DeleteApi
          organizationId={props.organizationEntityId.id}
          apiEntityId={managedObjectEntityId}
          onError={onSubComponentError_Notification} 
          onLoadingChange={setIsLoading}
          onCancel={onSubComponentCancel}
          onDeleteSuccess={onDeleteManagedObjectSuccess}
        />
      }
      { showNewComponent &&
        <ManageNewApi
          organizationId={props.organizationEntityId.id}
          onError={onSubComponentError_Notification}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNewSuccess={onNewManagedObjectSuccess}
          onUserNotification={onSubComponentUserNotification}
        />
      }
      {showEditComponent && managedObjectEntityId &&
        <ManageEditApi
          scope={E_Edit_Scope.MANAGE}
          organizationId={props.organizationEntityId.id}
          apiEntityId={managedObjectEntityId}
          onError={onSubComponentError_Notification}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onSaveSuccessNotification={onEditSaveManagedObjectSuccess}
          onNavigateToCommand={onSetManageObjectComponentState_To_View}    
          onChanged={onChangedManagedObject}
        />
      }
      { showImportEventPortalComponent &&      
        <p>showImportEventPortalComponent</p>
        // <EventPortalImportApi
        // organizationId={props.organizationEntityId.id}
        // apiProductEntityId={managedObjectEntityId}
        // onError={onSubComponentError_Notification}
        // onCancel={onSubComponentCancel}
        // onLoadingChange={setIsLoading}
        // setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        // onSaveSuccess={onCloneManagedObjectSuccess}
        // onNavigateToCommand={onSetManageObjectComponentState_To_View}

        // // organizationId={props.organizationId}
        // //   onBreadCrumbLabelList={props.onBreadCrumbLabelList}
        // //   onSuccess={onEventPortalImportEventApiProductSuccess}
        // //   onError={onSubComponentError}
        // //   onCancel={onSubComponentCancel}
        // //   onLoadingChange={setIsLoading} 
        // />
      }
    </div>
  );
}
