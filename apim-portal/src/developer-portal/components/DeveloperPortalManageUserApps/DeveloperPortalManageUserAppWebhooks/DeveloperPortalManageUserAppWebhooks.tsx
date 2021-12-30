
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { 
  AppConnectionStatus,
  AppResponse,
  AppsService,
  CommonDisplayName, 
  CommonName,
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { 
  APSUserId 
} from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { 
  APManagedWebhook, 
  TAPManagedAppWebhooks, 
  TAPManagedWebhook, 
  TAPOrganizationId, 
} from "../../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageUserAppWebhooksCommon";
import { DeveloperPortalListUserAppWebhooks } from "./DeveloperPortalListUserAppWebhooks";
import { DeveloperPortalDeleteUserAppWebhook } from "./DeveloperPortalDeleteUserAppWebhook";
import { DeveloperPortalNewEditUserAppWebhook, EAction } from "./DeveloperPortalNewEditUserAppWebhook";
import { Loading } from "../../../../components/Loading/Loading";
import { DeveloperPortalViewUserAppWebhook } from "./DeveloperPortalViewUserAppWebhook";
import { E_MANAGE_USER_APP_COMPONENT_STATE, E_MANAGE_WEBHOOK_COMPONENT_STATE } from "../DeveloperPortalManageUserAppsCommon";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalManageUserAppWebhooksProps {
  organizationId: TAPOrganizationId;
  userId: APSUserId;
  appId: CommonName;
  appDisplayName: CommonDisplayName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  // parentBreadCrumbItemList: Array<MenuItem>;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (manageUserAppComponentState: E_MANAGE_USER_APP_COMPONENT_STATE, appId: CommonName, appDisplayName: CommonDisplayName) => void;
}

export const DeveloperPortalManageUserAppWebhooks: React.FC<IDeveloperPortalManageUserAppWebhooksProps> = (props: IDeveloperPortalManageUserAppWebhooksProps) => {
  const componentName = 'DeveloperPortalManageUserAppWebhooks';

  type TManagedObject = TAPManagedAppWebhooks;

  type TComponentState = {
    previousState: E_MANAGE_WEBHOOK_COMPONENT_STATE,
    currentState: E_MANAGE_WEBHOOK_COMPONENT_STATE
  }
  const initialComponentState: TComponentState = {
    previousState: E_MANAGE_WEBHOOK_COMPONENT_STATE.UNDEFINED,
    currentState: E_MANAGE_WEBHOOK_COMPONENT_STATE.UNDEFINED
  }
  const setNewComponentState = (newState: E_MANAGE_WEBHOOK_COMPONENT_STATE) => {
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
  
  const ToolbarEditManagedObjectButtonLabel = 'Edit';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete';

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedWebhook, setManagedWebhook] = React.useState<TAPManagedWebhook>();

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [refreshComponentCounter, setRefreshComponentCounter] = React.useState<number>(0);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);

  // * transformations *
  const transformGetApiObjectToManagedObject = (apiAppResponse: AppResponse, apiAppConnectionStatus: AppConnectionStatus): TManagedObject => {
    return {
      appId: apiAppResponse.name,
      appDisplayName: apiAppResponse.displayName ? apiAppResponse.displayName : apiAppResponse.name,
      apiAppResponse: apiAppResponse,
      apManagedWebhookList: APManagedWebhook.createAPManagedWebhookListFromApiEntities(apiAppResponse, apiAppConnectionStatus),
      apiAppConnectionStatus: apiAppConnectionStatus
    };
  }

  // * Api Calls *
  // const apiGetWebhookStatus = async(apMWH: TAPManagedWebhook): Promise<TAPWebhookStatus> => {
  //   // TODO actually get the status
  //   return {
  //     summaryStatus: true,
  //     details: {
  //       hello: 'world',
  //       envName: apMWH.webhookEnvironmentReference.entityRef.name
  //     }
  //   }
  // }
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve webhook details for app: ${props.appDisplayName}`);
    try { 
      const _apiAppResponse: AppResponse = await AppsService.getDeveloperApp({
        organizationName: props.organizationId, 
        developerUsername: props.userId,
        appName: props.appId
      });
      const _apiAppConnectionStatus: AppConnectionStatus = await AppsService.getAppStatus({
        organizationName: props.organizationId,
        appName: props.appId
      });
      let _mo: TManagedObject = transformGetApiObjectToManagedObject(_apiAppResponse, _apiAppConnectionStatus);
      // // get the status for each webhook
      // for( const _apManagedWebhook of _mo.apManagedWebhookList) {
      //   _apManagedWebhook.webhookStatus = 
      //   _apManagedWebhook.webhookStatus = await apiGetWebhookStatus(_apManagedWebhook);
      // }      
      setManagedObject(_mo);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  
  const DeveloperPortalManageUserAppWebhooks_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_WEBHOOKS, props.appId, props.appDisplayName);
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    await doRefreshComponentData();
    setNewComponentState(E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: `Manage Webhooks`,
      command: DeveloperPortalManageUserAppWebhooks_onNavigateHereCommand
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doRefreshComponentData = async () => {
    setIsLoading(true);
    await apiGetManagedObject();
    setIsLoading(false);
  }
  React.useEffect(() => {
    if(refreshComponentCounter > 0) doRefreshComponentData();
  }, [refreshComponentCounter]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_GET_USER_APP:
          case E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP:
              break;
          default:
            props.onSuccess(apiCallStatus);
          }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedWebhook = (mwh: TAPManagedWebhook): void => {
    setApiCallStatus(null);
    setManagedWebhook(mwh);
    setNewComponentState(E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  
  // * New *
  const onNewManagedWebhook = (mwh: TAPManagedWebhook): void => {
    setManagedWebhook(mwh);
    setApiCallStatus(null);
    setNewComponentState(E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  // * Edit *
  const onEditManagedWebhookFromToolbar = () => {
    const funcName = 'onEditManagedWebhookFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedWebhook) throw new Error(`${logName}: managedWebhook is undefined for componentState=${componentState}`);
    onEditManagedWebhook(managedWebhook);
  }
  const onEditManagedWebhook = (mwh: TAPManagedWebhook): void => {
    setApiCallStatus(null);
    setManagedWebhook(mwh);
    setNewComponentState(E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete
  const onDeleteManagedWebhookFromToolbar = () => {
    const funcName = 'onDeleteManagedWebhookFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedWebhook) throw new Error(`${logName}: managedWebhook is undefined for componentState=${componentState}`);
    onDeleteManagedWebhook(managedWebhook);
  }
  const onDeleteManagedWebhook = (mwh: TAPManagedWebhook): void => {
    setApiCallStatus(null);
    setManagedWebhook(mwh);
    setNewComponentState(E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  
  // * Toolbar *
  const getLeftToolbarContent = (): Array<JSX.Element> | undefined => {
    if(!componentState.currentState || !managedObject) return undefined;
    let jsxButtonList: Array<JSX.Element> = [
    ];
    if(showViewComponent) {          
      jsxButtonList.push(
        <Button key={componentName+ToolbarEditManagedObjectButtonLabel} label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedWebhookFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>
      );
      jsxButtonList.push(
        <Button key={componentName+ToolbarDeleteManagedObjectButtonLabel} label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedWebhookFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
      ); 
    }
    if(jsxButtonList.length > 0 ) return jsxButtonList;
    else return undefined;
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarContent: Array<JSX.Element> | undefined = getLeftToolbarContent();
    if(leftToolbarContent) return (<Toolbar className="p-mb-4" left={leftToolbarContent} />);
    else return (<React.Fragment></React.Fragment>);
  }
  
  // * prop callbacks *
  const onEditManagedWebhookSuccess = (apiCallState: TApiCallState, updatedManagedWebhook: TAPManagedWebhook) => {
    setApiCallStatus(apiCallState);
    setManagedWebhook(updatedManagedWebhook);
    setRefreshComponentCounter(refreshComponentCounter + 1);
    setPreviousComponentState();
  }
  const onNewManagedWebhookSuccess = (apiCallState: TApiCallState, newManagedWebhook: TAPManagedWebhook) => {
    setApiCallStatus(apiCallState);
    setManagedWebhook(newManagedWebhook);
    setRefreshComponentCounter(refreshComponentCounter + 1);
    setPreviousComponentState();
  }
  const onDeleteManagedWebhookSuccess = (apiCallState: TApiCallState) => {
    // managedObject is now defunct
    setManagedObject(undefined);
    setApiCallStatus(apiCallState);
    setNewComponentState(E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshComponentCounter(refreshComponentCounter + 1);
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
    if(!componentState.currentState || componentState.currentState === E_MANAGE_WEBHOOK_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowNewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
    }
    else if(componentState.currentState === E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowNewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
    }
    else if(  componentState.previousState === E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if(  componentState.currentState === E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_WEBHOOK_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
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

      <Loading show={isLoading} />
      
      { renderToolbar() }

      {showListComponent && managedObject &&
        <DeveloperPortalListUserAppWebhooks
          managedAppWebhooks={managedObject}
          onViewManagedWebhook={onViewManagedWebhook}
          onDeleteManagedWebhook={onDeleteManagedWebhook}
          onNewManagedWebhook={onNewManagedWebhook}
        />
      }

      {showViewComponent && managedObject && managedWebhook && 
        <DeveloperPortalViewUserAppWebhook
          managedAppWebhooks={managedObject}
          managedWebhook={managedWebhook}
        />
      }
      {showDeleteComponent && managedObject && managedWebhook && 
        <DeveloperPortalDeleteUserAppWebhook
          organizationId={props.organizationId}
          userId={props.userId}
          managedAppWebhooks={managedObject}
          deleteManagedWebhook={managedWebhook}
          onSuccess={onDeleteManagedWebhookSuccess}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={props.onLoadingChange} 
        />
      }
      {showNewComponent && managedObject && managedWebhook &&
        <DeveloperPortalNewEditUserAppWebhook 
          action={EAction.NEW}
          organizationId={props.organizationId}
          userId={props.userId}
          managedAppWebhooks={managedObject}
          managedWebhook={managedWebhook}
          onNewSuccess={onNewManagedWebhookSuccess}
          onEditSuccess={onEditManagedWebhookSuccess}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={props.onLoadingChange} 
        />
      }
      {showEditComponent && managedObject && managedWebhook &&
        <DeveloperPortalNewEditUserAppWebhook 
          action={EAction.EDIT}
          organizationId={props.organizationId}
          userId={props.userId}
          managedAppWebhooks={managedObject}
          managedWebhook={managedWebhook}
          onNewSuccess={onNewManagedWebhookSuccess}
          onEditSuccess={onEditManagedWebhookSuccess}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={props.onLoadingChange} 
        />
      }

      {/* DEBUG */}
      {/* <React.Fragment>
        <hr/> 
        <h1>{componentName}.managedWebhook:</h1>
        <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedWebhook, null, 2)}
        </pre>
        <hr/> 
        <h1>{componentName}.managedObject:</h1>
        <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObject, null, 2)}
        </pre>
      </React.Fragment> */}

    </div>
  );
}
