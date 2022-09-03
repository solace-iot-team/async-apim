
import React from "react";
import { useHistory } from 'react-router-dom';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";
import { BreadCrumb } from "primereact/breadcrumb";

import { TApiCallState } from "../../../../utils/ApiCallState";
import { Loading } from "../../../../components/Loading/Loading";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../../components/AuthContextProvider/AuthContextProvider";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { DoLogoutAllUsers, EAction, EManageEpSettingsScope, E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./ManageEpSettingsCommon";
import APEpSettingsDisplayService, { IAPEpSettingsDisplay, TAPEpSettingsDisplay_AllowedActions } from "../../../../displayServices/APEpSettingsDisplayService";
import APSystemOrganizationsDisplayService from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { ListEpSettings } from "./ListEpSettings";
import { ManageEditNewEpSetting } from "./EditNewEpSetting/ManageEditNewEpSetting";
import { ViewEpSetting } from "./ViewEpSetting";
import { DeleteEpSetting } from "./DeleteEpSetting";
import { EUICommonResourcePaths, GlobalElementStyles } from "../../../../utils/Globals";
import APContextsDisplayService from "../../../../displayServices/APContextsDisplayService";
import { SessionContext } from "../../../../components/APContextProviders/APSessionContextProvider";
import { RunEpImporterJob } from "./RunEpImporterJob";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IManageEpSettingsProps {
  scope: EManageEpSettingsScope;
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  // setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  // apPageNavigationInfo?: TAPPageNavigationInfo;
}

export const ManageEpSettings: React.FC<IManageEpSettingsProps> = (props: IManageEpSettingsProps) => {
  const ComponentName = 'ManageEpSettings';

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
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [loadingHeader, setLoadingHeader] = React.useState<string>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();
  const [managedObject_AllowedActions, setManagedObject_AllowedActions] = React.useState<TAPEpSettingsDisplay_AllowedActions>(APEpSettingsDisplayService.get_Empty_AllowedActions());

  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [breadCrumbsRefreshCounter, setBreadCrumbsRefreshCounter] = React.useState<number>(0);

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showRunComponent, setShowRunComponent] = React.useState<boolean>(false);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  const [sessionContext, dispatchSessionContextAction] = React.useContext(SessionContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  
  const history = useHistory();

  const navigateTo = (path: string): void => { history.push(path); }

  const doLogoutThisUser = async(organizationId: string) => {
    if(!DoLogoutAllUsers) return;
    if(userContext.runtimeSettings.currentOrganizationEntityId !== undefined) {
      if(userContext.runtimeSettings.currentOrganizationEntityId.id === organizationId) {
        APContextsDisplayService.clear_LoginContexts({
          dispatchAuthContextAction: dispatchAuthContextAction,
          dispatchUserContextAction: dispatchUserContextAction,
          dispatchOrganizationContextAction: dispatchOrganizationContextAction,
          dispatchSessionContextAction: dispatchSessionContextAction,
        });
        navigateTo(EUICommonResourcePaths.Home);    
      }
    }
  }

  const setListView = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }

  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'Configurations',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { setListView() }
      }
    ];
    breadCrumbItemList.forEach( (item: MenuItem) => {
      breadcrumbItems.push({
        ...item,
        style: (item.command ? GlobalElementStyles.breadcrumbLink() : {})
      });
    });
    return (
      <React.Fragment>
        <BreadCrumb 
          key={`${ComponentName}_Breadcrumbs_${breadCrumbsRefreshCounter}`}
          model={breadcrumbItems} 
        />
      </React.Fragment>
    )
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   props.setBreadCrumbItemList(breadCrumbItemList);
  // }, [breadCrumbItemList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(apiCallStatus.success) {
      switch (apiCallStatus.context.action) {
        case E_CALL_STATE_ACTIONS.API_GET_LIST:
        case E_CALL_STATE_ACTIONS.API_GET:
        case E_CALL_STATE_ACTIONS.API_CHECK_ID_EXISTS:
          break;
        case E_CALL_STATE_ACTIONS.API_CREATE:
        case E_CALL_STATE_ACTIONS.API_UPDATE:
        case E_CALL_STATE_ACTIONS.API_DELETE:
          doLogoutThisUser(props.organizationId);
          break;
        default:
          props.onSuccess(apiCallStatus);
        }
    }
    // propagation of the error causes re-rendering - cannot find where
    // switch off for now (side effect: no error toast)
    // else props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const setAllowedActions = (apEpSettingsDisplay: IAPEpSettingsDisplay) => {
    const apEpSettingsDisplay_AllowedActions: TAPEpSettingsDisplay_AllowedActions = APEpSettingsDisplayService.get_AllowedActions({
      apEpSettingsDisplay: apEpSettingsDisplay,
      authorizedResourcePathAsString: authContext.authorizedResourcePathsAsString,
      userId: userContext.apLoginUserDisplay.apEntityId.id,
      userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id,
      hasEventPortalConnectivity: APSystemOrganizationsDisplayService.has_EventPortalConnectivity({ 
        apOrganizationDisplay: organizationContext
      }),
    });
    setManagedObject_AllowedActions(apEpSettingsDisplay_AllowedActions);
  }
  // * initialized object *
  const onInitializedManagedObject = (apEpSettingsDisplay: IAPEpSettingsDisplay) => {
    setAllowedActions(apEpSettingsDisplay);
  }

  // * Changed object *
  const onChangedManagedObject = (apEpSettingsDisplay: IAPEpSettingsDisplay) => {
    setAllowedActions(apEpSettingsDisplay);
    setRefreshCounter(refreshCounter + 1);
  }

  // const onSubComponentAddBreadCrumbItemList = (itemList: Array<MenuItem>) => {
  //   const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
  //   setBreadCrumbItemList(newItemList);
  //   setBreadCrumbsRefreshCounter(breadCrumbsRefreshCounter + 1)
  // }

  const onRunManagedObject = (apEpSettingsDisplay: IAPEpSettingsDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apEpSettingsDisplay.apEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_RUN);
  }  

  //  * View Object *
  const onViewManagedObject = (apEpSettingsDisplay: IAPEpSettingsDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apEpSettingsDisplay.apEntityId);
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
    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
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
    if(props.scope === EManageEpSettingsScope.VIEW) return (<></>);
    const rightToolbarTemplate: JSX.Element | undefined = renderRightToolbarContent();
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate || rightToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />);
    else return (<></>);
  }
  
  // * prop callbacks *
  const onRunImporterJobSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(null);
    setPreviousComponentState();
  }
  const onRunImporterJobError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
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
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, apEpSettingsDisplay: IAPEpSettingsDisplay) => {
    setApiCallStatus(apiCallState);
    setManagedObjectEntityId(apEpSettingsDisplay.apEntityId);
    // always go to view the new entity
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onEditSaveManagedObjectSuccess = (apiCallState: TApiCallState, apEpSettingsDisplay: IAPEpSettingsDisplay) => {
    setApiCallStatus(apiCallState);
    setManagedObjectEntityId(apEpSettingsDisplay.apEntityId);
    onChangedManagedObject(apEpSettingsDisplay);
    setRefreshCounter(refreshCounter + 1);
  }
  const onSubComponentUserNotification = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentError_Notification = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    // props.onError(apiCallState);
  }
  const onSubComponentCancel = () => {
    setPreviousComponentState();
  }
  const onLoadingChange = (isLoading: boolean, loadingHeader?: string) => {
    setLoadingHeader(loadingHeader);
    setIsLoading(isLoading);
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
      setShowRunComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowRunComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowRunComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
      setShowRunComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowRunComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowRunComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
      setShowRunComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW &&
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_RUN) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowRunComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="manage-organizations">

      <Loading key={ComponentName} show={isLoading} header={loadingHeader} />      
      
      { !isLoading && renderBreadcrumbs() }
      { !isLoading && renderToolbar() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {showListComponent && 
        <ListEpSettings
          key={`${ComponentName}_ListEpSettings_${refreshCounter}`}
          organizationId={props.organizationId}
          scope={props.scope}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError_Notification} 
          onManagedObjectView={onViewManagedObject}
          onManagedObjectRun={onRunManagedObject}
        />
      }
      {showViewComponent && managedObjectEntityId &&
        <ViewEpSetting
          key={`${ComponentName}_showViewComponent_${refreshCounter}`}
          organizationId={props.organizationId}
          apEpSettingEntityId={managedObjectEntityId}
          onError={onSubComponentError_Notification}
          onLoadingChange={onLoadingChange}
          onLoadSuccess={onInitializedManagedObject}
        />
      }
      {showDeleteComponent && managedObjectEntityId &&
        <DeleteEpSetting
          organizationId={props.organizationId}
          apEpSettingDisplayEntityId={managedObjectEntityId}
          onSuccess={onDeleteManagedObjectSuccess}
          onError={onSubComponentError_Notification}
          onCancel={onSubComponentCancel}
          onLoadingChange={onLoadingChange}
        />
      }
      { showNewComponent &&
        <ManageEditNewEpSetting
          action={EAction.NEW}
          organizationId={props.organizationId}
          onError={onSubComponentError_Notification}
          onCancel={onSubComponentCancel}
          onLoadingChange={onLoadingChange}
          onNewSuccess={onNewManagedObjectSuccess}
          onSuccessNotification={onSubComponentUserNotification}
          // setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {showEditComponent && managedObjectEntityId &&
        <ManageEditNewEpSetting
          action={EAction.EDIT}
          organizationId={props.organizationId}
          apEpSettingDisplayEntityId={managedObjectEntityId}
          onError={onSubComponentError_Notification}
          onCancel={onSubComponentCancel}
          onLoadingChange={onLoadingChange}
          onEditSuccess={onEditSaveManagedObjectSuccess}
          onSuccessNotification={onSubComponentUserNotification}
          // setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {showRunComponent && managedObjectEntityId &&
        <RunEpImporterJob
          organizationId={props.organizationId}
          apEpSettingDisplayEntityId={managedObjectEntityId}
          onError={onRunImporterJobError}
          onSuccess={onRunImporterJobSuccess}
          onLoadingChange={onLoadingChange}
        />
      }
    </div>
  );
}
