
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
import { TAPOrganizationId } from "../../../../components/APComponentsCommon";
import { 
  E_CALL_STATE_ACTIONS, 
  TViewManagedAppWebhookList,
  TViewManagedWebhook
} from "./DeveloperPortalManageUserAppWebhooksCommon";
import { DeveloperPortalListUserAppWebhooks } from "./DeveloperPortalListUserAppWebhooks";
// import { DeveloperPortalNewEditUserAppWebhook, EAction } from "./DeveloperPortalNewEditUserAppWebhook";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";
import { DeveloperPortalNewEditUserAppWebhook, EAction } from "./DeveloperPortalNewEditUserAppWebhook";

export interface IDeveloperPortalManageUserAppWebhooksProps {
  organizationId: TAPOrganizationId;
  userId: APSUserId;
  appId: CommonName;
  appDisplayName: CommonDisplayName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
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
  
  const ToolbarNewManagedObjectButtonLabel = 'New';
  const ToolbarEditManagedObjectButtonLabel = 'Edit';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete';

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedWebhook, setManagedWebhook] = React.useState<TViewManagedWebhook>();

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  // const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [refreshViewComponentKey, setRefreshViewComponentKey] = React.useState<number>(0);
  // const [viewAppApiAppResponse, setViewAppApiAppResponse] = React.useState<AppResponse>();
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);

  // * transformations *
  const transformGetApiObjectToManagedObject = (apiAppResponse: AppResponse, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): TManagedObject => {
    const createManagedWebhook = (apiWebHook: WebHook, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): TViewManagedWebhook => {
      const funcName = 'createManagedWebhook';
      const logName = `${componentName}.${funcName}()`;
      let _webhookApiEnvironmentResponseList: Array<EnvironmentResponse> = [];
      apiWebHook.environments?.forEach( (envName: string) => {
        const found: EnvironmentResponse | undefined = apiAppEnvironmentResponseList.find( (envResponse: EnvironmentResponse) => {
          return (envResponse.name === envName)
        });
        if(!found) throw new Error(`${logName}: cound not find webhook env=${envName} in app environment list: ${JSON.stringify(apiAppEnvironmentResponseList)}`);
        _webhookApiEnvironmentResponseList.push(found);
      });
      const viewManagedWebhook: TViewManagedWebhook = {
        apSynthId: JSON.stringify(apiWebHook),
        apiWebHook: apiWebHook,
        webhookApiEnvironmentResponseList: _webhookApiEnvironmentResponseList
      }
      return viewManagedWebhook;
    }
    // main
    const apiAppWebhookList: Array<WebHook> = apiAppResponse.webHooks ? apiAppResponse.webHooks : [];
    let _managedWebhookList: Array<TViewManagedWebhook> = [];
    apiAppWebhookList.forEach( (apiAppWebHook: WebHook) => {
      const viewManagedWebhook: TViewManagedWebhook = createManagedWebhook(apiAppWebHook, apiAppEnvironmentResponseList);
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
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
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
            break;
          default:
            props.onSuccess(apiCallStatus);
          }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedWebhook = (mwh: TViewManagedWebhook): void => {
    setApiCallStatus(null);
    setManagedWebhook(mwh);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  
  // * New *
  const onNewManagedWebhook = (): void => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  // * Edit *
  const onEditManagedWebhookFromToolbar = () => {
    const funcName = 'onEditManagedWebhookFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedWebhook) throw new Error(`${logName}: managedWebhook is undefined for componentState=${componentState}`);
    onEditManagedWebhook(managedWebhook);
  }
  const onEditManagedWebhook = (mwh: TViewManagedWebhook): void => {
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
  const onDeleteManagedWebhook = (mwh: TViewManagedWebhook): void => {
    setApiCallStatus(null);
    setManagedWebhook(mwh);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    const funcName = 'renderLeftToolbarContent';
    const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState) return undefined;
    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedWebhook} className="p-button-text p-button-plain p-button-outlined"/>
      </React.Fragment>
    );
    if(showViewComponent) {          
      return (
        <React.Fragment>
          <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedWebhook} className="p-button-text p-button-plain p-button-outlined"/>
          <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedWebhookFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
          <Button label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedWebhookFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
        </React.Fragment>
      );
    }
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} />);
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
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
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

      {/* <Loading show={isLoading} /> */}
      
      {/* { !isLoading && renderToolbar() } */}

      { renderToolbar() }

      {showListComponent && managedObject &&
        <DeveloperPortalListUserAppWebhooks
          organizationId={props.organizationId}
          userId={props.userId}
          viewManagedAppWebhookList={managedObject}
          // appId={props.appId}
          // appDisplayName={props.appDisplayName}
          // onError={onSubComponentError} 
          // onSuccess={onListManagedObjectsSuccess}
          onViewManagedWebhook={onViewManagedWebhook}
          // onLoadingChange={setIsLoading} 
        />
      }

      {showViewComponent && managedWebhook &&
        <p>TODO: showViewComponent </p>
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
      {/* {showDeleteComponent && managedObjectId && managedObjectDisplayName &&
        <p>TODO: showDeleteComponent </p>
        // <DeleteApiProduct
        //   organizationId={props.organizationId}
        //   apiProductId={managedObjectId}
        //   apiProductDisplayName={managedObjectDisplayName}
        //   onSuccess={onDeleteManagedObjectSuccess} 
        //   onError={onSubComponentError}
        //   onCancel={onSubComponentCancel}
        //   onLoadingChange={setIsLoading}
        // />
      } */}
      {showNewComponent && managedObject &&
        <DeveloperPortalNewEditUserAppWebhook 
          action={EAction.NEW}
          organizationId={props.organizationId}
          userId={props.userId}
          viewManagedAppWebhookList={managedObject}
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
        <h1>managedWebhook:</h1>
        <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedWebhook, null, 2)}
        </pre>
        <hr/> 
        <h1>managedObject:</h1>
        <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObject, null, 2)}
        </pre>
      </React.Fragment>

    </div>
  );
}
