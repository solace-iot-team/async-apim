
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APDeveloperPortalTeamAppsDisplayService, { TAPDeveloperPortalTeamAppDisplay } from "../../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { E_COMPONENT_STATE, E_CALL_STATE_ACTIONS } from "./ManageAppWebhooksCommon";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APAppWebhooksDisplayService, { IAPAppWebhookDisplay } from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import { Loading } from "../../../../components/Loading/Loading";
import { TAPAppEnvironmentDisplayList } from "../../../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import { EAction, EAppType } from "../DeveloperPortalManageAppsCommon";
import { Globals } from "../../../../utils/Globals";
import { ListAppWebhooks } from "./ListAppWebhooks";
import { ViewAppWebhook } from "./ViewAppWebhook";
import { DeleteAppWebhook } from "./DeleteAppWebhook";
import { EditNewAppWebhook } from "./EditNewAppWebhook";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface IManageAppWebhooksProps {
  appType: EAppType;
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccessNotification: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateToApp: (appEntityId: TAPEntityId) => void;
  onNavigateToCommand: () => void;
}

export const ManageAppWebhooks: React.FC<IManageAppWebhooksProps> = (props: IManageAppWebhooksProps) => {
  const ComponentName = 'ManageAppWebhooks';

  type TManagedManageAppDisplay = TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;

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
  const [organizationContext] = React.useContext(OrganizationContext);

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedApAppDisplay, setManagedApAppDisplay] = React.useState<TManagedManageAppDisplay>();  
  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();
  const [available_ApAppEnvironmentDisplayList, setAvailable_ApAppEnvironmentDisplayList] = React.useState<TAPAppEnvironmentDisplayList>([]);

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);

  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isLoadingHeader, setIsLoadingHeader] = React.useState<JSX.Element>();

  const ManageUserAppWebhooks_onNavigateToAppCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToApp(props.appEntityId);
  }
  const ManageUserAppWebhooks_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand();
  }

  const apiGet_Entities = async(): Promise<TApiCallState> => {
    const funcName = 'apiGet_Entities';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP, `retrieve user app: ${props.appEntityId.displayName}`);
    try { 
      switch(props.appType) {
        case EAppType.USER:
          const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = await APDeveloperPortalUserAppsDisplayService.apiGet_ApDeveloperPortalUserAppDisplay({
            organizationId: props.organizationId,
            userId: userContext.apLoginUserDisplay.apEntityId.id,
            appId: props.appEntityId.id,
            apOrganizationAppSettings: { apAppCredentialsExpiryDuration_millis: organizationContext.apAppCredentialsExpiryDuration_millis },
          });
          const user_apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList = await APAppWebhooksDisplayService.apiGetList_WebhookAvailableApEnvironmentDisplayList_For_ApAppDisplay({
            organizationId: props.organizationId,
            apAppDisplay: apDeveloperPortalUserAppDisplay,
            webhookId: undefined
          });
          setAvailable_ApAppEnvironmentDisplayList(user_apAppEnvironmentDisplayList);
          setManagedApAppDisplay(apDeveloperPortalUserAppDisplay);
          break;
        case EAppType.TEAM:
          if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: props.appType === EAppType.TEAM && userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
          const apDeveloperPortalTeamAppDisplay: TAPDeveloperPortalTeamAppDisplay = await APDeveloperPortalTeamAppsDisplayService.apiGet_ApDeveloperPortalTeamAppDisplay({
            organizationId: props.organizationId,
            teamId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
            appId: props.appEntityId.id,
            apOrganizationAppSettings: { apAppCredentialsExpiryDuration_millis: organizationContext.apAppCredentialsExpiryDuration_millis },
          });
          const team_apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList = await APAppWebhooksDisplayService.apiGetList_WebhookAvailableApEnvironmentDisplayList_For_ApAppDisplay({
            organizationId: props.organizationId,
            apAppDisplay: apDeveloperPortalTeamAppDisplay,
            webhookId: undefined
          });
          setAvailable_ApAppEnvironmentDisplayList(team_apAppEnvironmentDisplayList);
          setManagedApAppDisplay(apDeveloperPortalTeamAppDisplay);
          break;
        default:
          Globals.assertNever(logName, props.appType);
      }

    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  
  const apiGetAvailable_ApAppEnvironmentDisplayList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetAvailable_ApAppEnvironmentDisplayList';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedApAppDisplay === undefined) throw new Error(`${logName}: managedApAppDisplay === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_WEBHOOK_AVAILABLE_ENVIRONMENTS, `retrieve list of available webhook environments for app: ${managedApAppDisplay.apEntityId.displayName}`);
    try { 
      const apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList = await APAppWebhooksDisplayService.apiGetList_WebhookAvailableApEnvironmentDisplayList_For_ApAppDisplay({
        organizationId: props.organizationId,
        apAppDisplay: managedApAppDisplay,
        webhookId: undefined
      });
      setAvailable_ApAppEnvironmentDisplayList(apAppEnvironmentDisplayList);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    onLoadingChange(true);
    await apiGet_Entities();
    onLoadingChange(false);
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
    if(refreshCounter === 0) return;
    apiGetAvailable_ApAppEnvironmentDisplayList();
  }, [refreshCounter]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if(managedApAppDisplay === undefined) return;
    setBreadCrumbItemList([]);
    setNewComponentState(E_COMPONENT_STATE.LIST_VIEW);
  }, [managedApAppDisplay]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_GET_APP:
            break;
          default:
            props.onSuccessNotification(apiCallStatus);
          }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
    const funcName = 'renderLeftToolbarContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedApAppDisplay === undefined) throw new Error(`${logName}: managedApAppDisplay === undefined`);
    if(!componentState.currentState) return undefined;

    const isNewAvailable: boolean = available_ApAppEnvironmentDisplayList.length > 0;

    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNew_FromToolbar} className="p-button-text p-button-plain p-button-outlined" disabled={!isNewAvailable} />
      </React.Fragment>
    );
    if(showViewComponent) {
      return (
        <React.Fragment>
          <Button key={ComponentName+ToolbarNewManagedObjectButtonLabel} label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNew_FromToolbar} className="p-button-text p-button-plain p-button-outlined" disabled={!isNewAvailable} />
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
  const onLoadingChange = (isLoading: boolean, header?: JSX.Element) => {
    setIsLoading(isLoading);
    setIsLoadingHeader(header);
  }
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    setBreadCrumbItemList(itemList);
  }
  const onSetManageUserAppComponentState_To_View = (apAppWebhookDisplayEntityId: TAPEntityId) => {
    setManagedObjectEntityId(apAppWebhookDisplayEntityId);
    setNewComponentState(E_COMPONENT_STATE.VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onListSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onView = (apAppWebhookDisplay: IAPAppWebhookDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apAppWebhookDisplay.apEntityId);
    // setManagedObject_AllowedActions(APDeveloperPortalUserAppsDisplayService.get_AllowedActions({
    //   apAppDisplay: apDeveloperPortalUserAppDisplay
    // }));
    setNewComponentState(E_COMPONENT_STATE.VIEW);
  }  
  const onNewSuccess = (apiCallState: TApiCallState, apAppWebhookDisplayEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    setManagedObjectEntityId(apAppWebhookDisplayEntityId);
    setNewComponentState(E_COMPONENT_STATE.VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onEditSuccess = (apiCallState: TApiCallState, apAppWebhookDisplayEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    setManagedObjectEntityId(apAppWebhookDisplayEntityId);
    setNewComponentState(E_COMPONENT_STATE.VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onDeleteSuccess = (apiCallState: TApiCallState) => {
    // managedObject is now defunct
    setManagedObjectEntityId(undefined);
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
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

      <Loading show={isLoading} header={isLoadingHeader}/>
      
      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedApAppDisplay && renderToolbar() }

      {showListComponent && managedApAppDisplay &&
        <ListAppWebhooks
          organizationId={props.organizationId}
          apDeveloperPortalAppDisplay={managedApAppDisplay}
          onError={props.onError}
          onLoadingChange={onLoadingChange}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onSuccess={onListSuccess}
          onManagedObjectView={onView}
        />
      }

      {showViewComponent && managedApAppDisplay && managedObjectEntityId &&
        <ViewAppWebhook
          key={`${ComponentName}_ViewAppWebhook_${refreshCounter}`}
          organizationId={props.organizationId}
          apDeveloperPortalAppDisplay={managedApAppDisplay}
          apAppWebhookDisplayEntityId={managedObjectEntityId}
          onError={props.onError}
          onLoadingChange={onLoadingChange}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHereCommand={onSetManageUserAppComponentState_To_View}
        />
      }
      {showDeleteComponent && managedApAppDisplay && managedObjectEntityId &&
        <DeleteAppWebhook
          organizationId={props.organizationId}
          apDeveloperPortalAppDisplay={managedApAppDisplay}
          apAppWebhookDisplayEntityId={managedObjectEntityId}
          onError={onSubComponentError}
          onLoadingChange={onLoadingChange}
          onCancel={onSubComponentCancel}
          onDeleteSuccess={onDeleteSuccess}
        />
      }
      {showNewComponent && managedApAppDisplay && 
        <EditNewAppWebhook
          action={EAction.NEW}
          organizationId={props.organizationId}
          apDeveloperPortalAppDisplay={managedApAppDisplay}
          onCancel={onSubComponentCancel}
          onError={onSubComponentError}
          onLoadingChange={onLoadingChange}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onEditNewSuccess={onNewSuccess}
        />
      }
      {showEditComponent && managedApAppDisplay && managedObjectEntityId &&
        <EditNewAppWebhook
          action={EAction.EDIT}
          organizationId={props.organizationId}
          apDeveloperPortalAppDisplay={managedApAppDisplay}
          onCancel={onSubComponentCancel}
          onError={onSubComponentError}
          onLoadingChange={onLoadingChange}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onEditNewSuccess={onEditSuccess}
          apAppWebhookDisplayEntityId={managedObjectEntityId}
          onNavigateToCommand={onSetManageUserAppComponentState_To_View}
        />
      }

    </div>
  );
}
