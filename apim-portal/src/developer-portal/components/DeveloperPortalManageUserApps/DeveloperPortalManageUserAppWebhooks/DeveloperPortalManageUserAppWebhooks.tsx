
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { 
  AppResponse,
  AppsService,
  CommonDisplayName, 
  CommonName,
  EnvironmentResponse,
  EnvironmentsService,
  WebHook
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APSUserId } from "@solace-iot-team/apim-server-openapi-browser";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APManagedWebhook, TApiEntitySelectItem, TAPOrganizationId, TAPViewManagedWebhook } from "../../../../components/APComponentsCommon";
import { 
  E_CALL_STATE_ACTIONS, 
  getNumberWebhooksUndefined4App, 
  TViewManagedAppWebhookList,
} from "./DeveloperPortalManageUserAppWebhooksCommon";
import { DeveloperPortalListUserAppWebhooks } from "./DeveloperPortalListUserAppWebhooks";
import { DeveloperPortalDeleteUserAppWebhook } from "./DeveloperPortalDeleteUserAppWebhook";
import { DeveloperPortalNewEditUserAppWebhook, EAction } from "./DeveloperPortalNewEditUserAppWebhook";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";
import { Globals } from "../../../../utils/Globals";
import { Loading } from "../../../../components/Loading/Loading";

export interface IDeveloperPortalManageUserAppWebhooksProps {
  organizationId: TAPOrganizationId;
  userId: APSUserId;
  appId: CommonName;
  appDisplayName: CommonDisplayName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  // TODO: required to set here?
  // onBreadCrumbLabelList: (breadCrumbLableList: Array<string>) => void;
}

export const DeveloperPortalManageUserAppWebhooks: React.FC<IDeveloperPortalManageUserAppWebhooksProps> = (props: IDeveloperPortalManageUserAppWebhooksProps) => {
  const componentName = 'DeveloperPortalManageUserAppWebhooks';

  type TManagedObject = TViewManagedAppWebhookList;

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
    MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
    MANAGED_OBJECT_NEW = "MANAGED_OBJECT_NEW",
    MANAGED_OBJECT_EDIT = "MANAGED_OBJECT_EDIT",
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
  
  const ToolbarBackToAppButtonLabel = 'Back to App';
  const ToolbarNewManagedObjectButtonLabel = 'New Webhook';
  const ToolbarEditManagedObjectButtonLabel = 'Edit';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete';

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedWebhook, setManagedWebhook] = React.useState<TAPViewManagedWebhook>();

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [refreshViewComponentKey, setRefreshViewComponentKey] = React.useState<number>(0);
  const [refreshComponentCounter, setRefreshComponentCounter] = React.useState<number>(0);
  // const [viewAppApiAppResponse, setViewAppApiAppResponse] = React.useState<AppResponse>();
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [newPresetEnvSelectItem, setNewPresetEnvSelectItem] = React.useState<TApiEntitySelectItem>();
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);

  // * transformations *
  const transformGetApiObjectToManagedObject = (apiAppResponse: AppResponse, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): TManagedObject => {
    // const createManagedWebhook = (apiAppResponse: AppResponse, apiWebHook: WebHook, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): TAPViewManagedWebhook => {
    //   const funcName = 'createManagedWebhook';
    //   const logName = `${componentName}.${funcName}()`;
    //   let _webhookApiEnvironmentResponseList: Array<EnvironmentResponse> = [];
    //   apiWebHook.environments?.forEach( (envName: string) => {
    //     const found: EnvironmentResponse | undefined = apiAppEnvironmentResponseList.find( (envResponse: EnvironmentResponse) => {
    //       return (envResponse.name === envName)
    //     });
    //     if(!found) throw new Error(`${logName}: cound not find webhook env=${envName} in app environment list: ${JSON.stringify(apiAppEnvironmentResponseList)}`);
    //     _webhookApiEnvironmentResponseList.push(found);
    //   });
    //   const viewManagedWebhook: TAPViewManagedWebhook = {
    //     apSynthId: JSON.stringify(apiWebHook),
    //     apiWebHook: {
    //       ...apiWebHook,
    //         // TODO
    //         // when connector api ready: tlsOptions.trustedCNs(list of strings) - map to list of objects in TAPTrustedCNList
    //       trustedCNList: [{name: 'api-one'}, {name:'api-two'}]
    //     },
    //     webhookApiEnvironmentResponseList: _webhookApiEnvironmentResponseList,
    //     apiAppResponse: apiAppResponse
    //   }
    //   return viewManagedWebhook;
    // }
    // main
    const apiAppWebhookList: Array<WebHook> = apiAppResponse.webHooks ? apiAppResponse.webHooks : [];
    let _managedWebhookList: Array<TAPViewManagedWebhook> = [];
    apiAppWebhookList.forEach( (apiAppWebHook: WebHook) => {
      const viewManagedWebhook: TAPViewManagedWebhook = APManagedWebhook.createManagedWebhook(apiAppResponse, apiAppWebHook, apiAppEnvironmentResponseList);
      // viewManagedWebhook.apWebhookStatus = {
      //    summaryStatus: false,
      //    details: { todo: 'get the status from broker service'} 
      // }
      _managedWebhookList.push(viewManagedWebhook);
    });
    return {
      appId: apiAppResponse.name,
      appDisplayName: apiAppResponse.displayName ? apiAppResponse.displayName : apiAppResponse.name,
      apiAppResponse: apiAppResponse,
      apiAppEnvironmentResponseList: apiAppEnvironmentResponseList,
      managedWebhookList: _managedWebhookList
    };
  }

  // * Api Calls *
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
      // get all the environments
      if(!_apiAppResponse.environments) throw new Error(`${logName}: _apiAppResponse.environments is undefined`);
      let _apiAppEnvironmentResponseList: Array<EnvironmentResponse> = [];
      for(const _apiAppEnvironment of _apiAppResponse.environments) {
        if(!_apiAppEnvironment.name) throw new Error(`${logName}: _apiAppEnvironment.name is undefined`);
        const _apiEnvironmentResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({
          organizationName: props.organizationId,
          envName: _apiAppEnvironment.name
        });
        _apiAppEnvironmentResponseList.push(_apiEnvironmentResponse);
      }
      // TODO: get the status for all webhooks
      setManagedObject(transformGetApiObjectToManagedObject(_apiAppResponse, _apiAppEnvironmentResponseList));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  
  // * useEffect Hooks *
  const doInitialize = async () => {
    // const funcName = 'doInitialize';
    // const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doRefreshComponentData = async () => {
    const funcName = 'doRefreshComponentData';
    const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: refreshing ...`);
    setIsLoading(true);
    // props.onLoadingChange(true);
    await apiGetManagedObject();
    // props.onLoadingChange(false);
    setIsLoading(false);
  }
  React.useEffect(() => {
    if(refreshComponentCounter > 0) doRefreshComponentData();
  }, [refreshComponentCounter]); /* eslint-disable-line react-hooks/exhaustive-deps */



  // TODO: set the app display name + manage webhooks?
  // TODO: if so, app display name needs a command/link: page+app-name+view
  // React.useEffect(() => {
  //   if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW ||
  //       componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT_ATTRIBUTES
  //     ) props.onBreadCrumbLabelList([managedObjectDisplayName]);
  //   else props.onBreadCrumbLabelList([]);
  // }, [componentState, managedObjectDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const onBackToApp = (): void => {
    props.onCancel();
  }
  //  * View Object *
  const onViewManagedWebhook = (mwh: TAPViewManagedWebhook): void => {
    setApiCallStatus(null);
    setManagedWebhook(mwh);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  
  // * New *
  const onNewManagedWebhook = (): void => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  const onNewManagedWebhookAnyEnv = () => {
    setNewPresetEnvSelectItem(undefined);
    onNewManagedWebhook();
  }
  const onCreateNewWebhook4Env = (envName: CommonName, envDisplayName: CommonDisplayName): void => {
    setNewPresetEnvSelectItem({ id: envName, displayName: envDisplayName});
    onNewManagedWebhook();
  }
  // * Edit *
  const onEditManagedWebhookFromToolbar = () => {
    const funcName = 'onEditManagedWebhookFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedWebhook) throw new Error(`${logName}: managedWebhook is undefined for componentState=${componentState}`);
    onEditManagedWebhook(managedWebhook);
  }
  const onEditManagedWebhook = (mwh: TAPViewManagedWebhook): void => {
    setApiCallStatus(null);
    setManagedWebhook(mwh);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete
  const onDeleteManagedWebhookFromToolbar = () => {
    const funcName = 'onDeleteManagedWebhookFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedWebhook) throw new Error(`${logName}: managedWebhook is undefined for componentState=${componentState}`);
    onDeleteManagedWebhook(managedWebhook);
  }
  const onDeleteManagedWebhook = (mwh: TAPViewManagedWebhook): void => {
    setApiCallStatus(null);
    setManagedWebhook(mwh);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  
  // * Toolbar *
  const getLeftToolbarContent = (): Array<JSX.Element> | undefined => {
    const funcName = 'getLeftToolbarContent';
    const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState || !managedObject) return undefined;
    let jsxButtonList: Array<JSX.Element> = [
      <Button key={componentName+ToolbarBackToAppButtonLabel} label={ToolbarBackToAppButtonLabel} icon="pi pi-chevron-left" onClick={onBackToApp} className="p-button-text p-button-plain p-button-outlined"/>
    ];
    if(showListComponent) {
      if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
      // TODO:HERE
      // managedObject?.managedWebhookList
      jsxButtonList.push(
        <Button 
          key={componentName+ToolbarNewManagedObjectButtonLabel} 
          label={ToolbarNewManagedObjectButtonLabel} 
          icon="pi pi-plus" 
          onClick={onNewManagedWebhookAnyEnv} 
          className="p-button-text p-button-plain p-button-outlined"
          disabled={getNumberWebhooksUndefined4App(managedObject.managedWebhookList, managedObject.apiAppEnvironmentResponseList) === 0}
        />
      );
      return jsxButtonList;
    }
    if(showViewComponent) {          
      // jsxButtonList.push(
      //   <Button key={componentName+ToolbarNewManagedObjectButtonLabel} label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedWebhook} className="p-button-text p-button-plain p-button-outlined"/>
      // );
      jsxButtonList.push(
        <Button key={componentName+ToolbarEditManagedObjectButtonLabel} label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedWebhookFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>
      );
      jsxButtonList.push(
        <Button key={componentName+ToolbarDeleteManagedObjectButtonLabel} label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedWebhookFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
      ); 
      return jsxButtonList;
    }
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarContent: Array<JSX.Element> | undefined = getLeftToolbarContent();
    if(leftToolbarContent) return (<Toolbar className="p-mb-4" left={leftToolbarContent} />);
    else return (<React.Fragment></React.Fragment>);
  }
  
  // * prop callbacks *
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onEditManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
  }
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
  }
  const onDeleteManagedWebhookSuccess = (apiCallState: TApiCallState) => {
    // alert(`delete success - should re-initialize webhooks`);
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
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
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowNewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowNewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
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
      
      {/* { !isLoading && renderToolbar() } */}

      { renderToolbar() }

      {showListComponent && managedObject &&
        <DeveloperPortalListUserAppWebhooks
          // key={componentState.previousState}
          organizationId={props.organizationId}
          userId={props.userId}
          viewManagedAppWebhookList={managedObject}
          // appId={props.appId}
          // appDisplayName={props.appDisplayName}
          // onError={onSubComponentError} 
          // onSuccess={onListManagedObjectsSuccess}
          onViewManagedWebhook={onViewManagedWebhook}
          onDeleteManagedWebhook={onDeleteManagedWebhook}
          // onCreateNewWebhook: (envName: CommonName, envDisplayName: CommonDisplayName) => void;
          onCreateNewWebhook={onCreateNewWebhook4Env}
          // onLoadingChange={setIsLoading} 
        />
      }

      {showViewComponent && managedWebhook &&
        <React.Fragment>
          <p>TODO: showViewComponent </p>
        </React.Fragment>
        // <ViewApp
        //   key={refreshViewComponentKey}
        //   organizationId={props.organizationId}
        //   appId={managedObjectId}
        //   appDisplayName={managedObjectDisplayName}
        //   appType={viewManagedObject.appListItem.appType}
        //   appOwnerId={viewManagedObject.appListItem.ownerId}
        //   onSuccess={onSubComponentSuccess} 
        //   onError={onSubComponentError} 
        //   onLoadingChange={setIsLoading}
        //   onLoadingFinished={onViewAppLoadingFinished}
        // />      
      }
      {showDeleteComponent && managedObject && managedWebhook && 
        <DeveloperPortalDeleteUserAppWebhook
          organizationId={props.organizationId}
          userId={props.userId}
          viewManagedAppWebhookList={managedObject}
          deleteManagedWebhook={managedWebhook}
          onSuccess={onDeleteManagedWebhookSuccess}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={props.onLoadingChange} 
        />
        // <DeleteApiProduct
        //   organizationId={props.organizationId}
        //   apiProductId={managedObjectId}
        //   apiProductDisplayName={managedObjectDisplayName}
        //   onSuccess={onDeleteManagedObjectSuccess} 
        //   onError={onSubComponentError}
        //   onCancel={onSubComponentCancel}
        //   onLoadingChange={setIsLoading}
        // />
      }
      {showNewComponent && managedObject &&
        <DeveloperPortalNewEditUserAppWebhook 
          action={EAction.NEW}
          organizationId={props.organizationId}
          userId={props.userId}
          viewManagedAppWebhookList={managedObject}
          presetEnvSelectItem={newPresetEnvSelectItem}
          onNewSuccess={onNewManagedObjectSuccess}
          onEditSuccess={onEditManagedObjectSuccess}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={props.onLoadingChange} 
        />
      }
      {showEditComponent && managedWebhook &&
        <p>TODO: showEditComponent </p>
        // <EditNewApiProduct
        //   action={EAction.EDIT}
        //   organizationId={props.organizationId}
        //   apiProductId={managedObjectId}
        //   apiProductDisplayName={managedObjectDisplayName}
        //   onNewSuccess={onNewManagedObjectSuccess} 
        //   onEditSuccess={onEditManagedObjectSuccess} 
        //   onError={onSubComponentError}
        //   onCancel={onSubComponentCancel}
        //   onLoadingChange={setIsLoading}
        // />
      }

      {/* DEBUG */}
      <React.Fragment>
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
      </React.Fragment>

    </div>
  );
}
