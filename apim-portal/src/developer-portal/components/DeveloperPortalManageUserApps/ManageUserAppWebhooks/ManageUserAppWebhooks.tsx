
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { E_COMPONENT_STATE, E_CALL_STATE_ACTIONS } from "./ManageUserAppWebhooksCommon";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";
import { ListUserAppWebhooks } from "./ListUserAppWebhooks";
import { IAPAppWebhookDisplay } from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";

export interface IManageUserAppWebhooksProps {
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccessNotification: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateToApp: (appEntityId: TAPEntityId) => void;
  onNavigateToCommand: () => void;
}

export const ManageUserAppWebhooks: React.FC<IManageUserAppWebhooksProps> = (props: IManageUserAppWebhooksProps) => {
  const ComponentName = 'ManageUserAppWebhooks';

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

  const [userContext] = React.useContext(UserContext);

  // const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedApAppDisplay, setManagedApAppDisplay] = React.useState<TAPDeveloperPortalUserAppDisplay>();  
  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();
  // const [managedObject_AllowedActions, setManagedObject_AllowedActions] = React.useState<TAPDeveloperPortalUserAppDisplay_AllowedActions>(APDeveloperPortalUserAppsDisplayService.get_Empty_AllowedActions());

  // const [managedWebhook, setManagedWebhook] = React.useState<TAPManagedWebhook>();

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);

  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  // const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  const ManageUserAppWebhooks_onNavigateToAppCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToApp(props.appEntityId);
  }
  const ManageUserAppWebhooks_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand();
  }

  const apiGetManagedApAppDisplay = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedApAppDisplay';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve user app: ${props.appEntityId.displayName}`);
    try { 
      const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = await APDeveloperPortalUserAppsDisplayService.apiGet_ApDeveloperPortalUserAppDisplay({
        organizationId: props.organizationId,
        appId: props.appEntityId.id,
        userId: userContext.apLoginUserDisplay.apEntityId.id,
      });
      setManagedApAppDisplay(apDeveloperPortalUserAppDisplay);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedApAppDisplay();
    props.onLoadingChange(false);
  }

  const getBaseBreadCrumbItemList = (): Array<MenuItem> => {
    const funcName = 'getBaseBreadCrumbItemList';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedApAppDisplay === undefined) throw new Error(`${logName}: managedApAppDisplay === undefined`);

    return [
      {
        label: managedApAppDisplay.apEntityId.displayName,
        command: ManageUserAppWebhooks_onNavigateToAppCommand
      },
      {
        label: 'Manage Webhooks',
        command: ManageUserAppWebhooks_onNavigateToCommand
      }  
    ];
  }

  const setBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    props.setBreadCrumbItemList(getBaseBreadCrumbItemList().concat(itemList));
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if(managedApAppDisplay === undefined) return;
    setBreadCrumbItemList([]);
    setNewComponentState(E_COMPONENT_STATE.LIST_VIEW);
  }, [managedApAppDisplay]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   props.setBreadCrumbItemList(breadCrumbItemList);
  // }, [breadCrumbItemList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(refreshComponentCounter > 0) doRefreshComponentData();
  // }, [refreshComponentCounter]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_GET_USER_APP:
            break;
          default:
            props.onSuccessNotification(apiCallStatus);
          }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onView_FromToolbar = (): void => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.VIEW);
  }  
  // const onViewManagedObject = (apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay): void => {
  //   setApiCallStatus(null);
  //   setManagedObjectEntityId(apDeveloperPortalUserAppDisplay.apEntityId);
  //   setManagedObject_AllowedActions(APDeveloperPortalUserAppsDisplayService.get_AllowedActions({
  //     apAppDisplay: apDeveloperPortalUserAppDisplay
  //   }));
  //   setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  // }  

  const onNew_FromToolbar = (): void => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.NEW);
  }
  const onEdit_FromToolbar = (): void => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.EDIT);
  }
  const onDelete_FromToolbar = (): void => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.DELETE);
  }
  
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNew_FromToolbar} className="p-button-text p-button-plain p-button-outlined"/>
      </React.Fragment>
    );
    if(showViewComponent) {
      return (
        <React.Fragment>
          <Button key={ComponentName+ToolbarNewManagedObjectButtonLabel} label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNew_FromToolbar} className="p-button-text p-button-plain p-button-outlined"/>
          <Button key={ComponentName+ToolbarEditManagedObjectButtonLabel} label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEdit_FromToolbar} className="p-button-text p-button-plain p-button-outlined"/>
        </React.Fragment>
      );
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
            onClick={onDelete_FromToolbar} 
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
  const onListSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    // setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onView = (apAppWebhookDisplay: IAPAppWebhookDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apAppWebhookDisplay.apEntityId);
    // setManagedObject_AllowedActions(APDeveloperPortalUserAppsDisplayService.get_AllowedActions({
    //   apAppDisplay: apDeveloperPortalUserAppDisplay
    // }));
    setNewComponentState(E_COMPONENT_STATE.VIEW);
  }  


  // const onEditSuccess = (apiCallState: TApiCallState, updatedManagedWebhook: TAPManagedWebhook) => {
  //   setApiCallStatus(apiCallState);
  //   setManagedWebhook(updatedManagedWebhook);
  //   setRefreshComponentCounter(refreshComponentCounter + 1);
  //   setPreviousComponentState();
  // }
  // const onNewManagedWebhookSuccess = (apiCallState: TApiCallState, newManagedWebhook: TAPManagedWebhook) => {
  //   setApiCallStatus(apiCallState);
  //   setManagedWebhook(newManagedWebhook);
  //   setRefreshComponentCounter(refreshComponentCounter + 1);
  //   setPreviousComponentState();
  // }
  // const onDeleteManagedWebhookSuccess = (apiCallState: TApiCallState) => {
  //   // managedObject is now defunct
  //   setManagedObject(undefined);
  //   setApiCallStatus(apiCallState);
  //   setNewComponentState(E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  //   setRefreshComponentCounter(refreshComponentCounter + 1);
  // }
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
      setShowNewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowNewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.VIEW && 
      componentState.currentState === E_COMPONENT_STATE.DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="apd-manage-user-apps">

      {/* <Loading show={isLoading} /> */}
      
      { renderToolbar() }

      {showListComponent && managedApAppDisplay &&
        <ListUserAppWebhooks
          organizationId={props.organizationId}
          apDeveloperPortalUserAppDisplay={managedApAppDisplay}
          onError={props.onError}
          onLoadingChange={props.onLoadingChange}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onSuccess={onListSuccess}
          onManagedObjectView={onView}
        />
      }

      {showViewComponent && managedApAppDisplay && 
      <p>showViewComponent</p>
        // <DeveloperPortalViewUserAppWebhook
        //   managedAppWebhooks={managedObject}
        //   managedWebhook={managedWebhook}
        // />
      }
      {showDeleteComponent && managedApAppDisplay && 
      <p>showDeleteComponent</p>
        // <DeveloperPortalDeleteUserAppWebhook
        //   organizationId={props.organizationId}
        //   userId={props.userId}
        //   managedAppWebhooks={managedObject}
        //   deleteManagedWebhook={managedWebhook}
        //   onSuccess={onDeleteManagedWebhookSuccess}
        //   onError={onSubComponentError}
        //   onCancel={onSubComponentCancel}
        //   onLoadingChange={props.onLoadingChange} 
        // />
      }
      {showNewComponent && managedApAppDisplay && 
      <p>showNewComponent</p>
        // <DeveloperPortalNewEditUserAppWebhook 
        //   action={EAction.NEW}
        //   organizationId={props.organizationId}
        //   userId={props.userId}
        //   managedAppWebhooks={managedObject}
        //   managedWebhook={managedWebhook}
        //   onNewSuccess={onNewManagedWebhookSuccess}
        //   onEditSuccess={onEditManagedWebhookSuccess}
        //   onError={onSubComponentError}
        //   onCancel={onSubComponentCancel}
        //   onLoadingChange={props.onLoadingChange} 
        // />
      }
      {showEditComponent && managedApAppDisplay &&
      <p>showEditComponent</p>
        // <DeveloperPortalNewEditUserAppWebhook 
        //   action={EAction.EDIT}
        //   organizationId={props.organizationId}
        //   userId={props.userId}
        //   managedAppWebhooks={managedObject}
        //   managedWebhook={managedWebhook}
        //   onNewSuccess={onNewManagedWebhookSuccess}
        //   onEditSuccess={onEditManagedWebhookSuccess}
        //   onError={onSubComponentError}
        //   onCancel={onSubComponentCancel}
        //   onLoadingChange={props.onLoadingChange} 
        // />
      }

    </div>
  );
}
