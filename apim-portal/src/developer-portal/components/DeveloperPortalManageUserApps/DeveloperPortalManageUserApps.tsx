
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import {
  ApiError,
  CommonDisplayName,
  CommonName,
  Developer, 
  DevelopersService 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { 
  APSUser, 
  APSUserId 
} from "@solace-iot-team/apim-server-openapi-browser";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { UserContext } from "../../../components/UserContextProvider/UserContextProvider";
import { Loading } from "../../../components/Loading/Loading";
import { TAPDeveloperPortalUserAppDisplay, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { DeveloperPortalListUserApps } from "./DeveloperPortalListUserApps";
import { E_CALL_STATE_ACTIONS, E_MANAGE_USER_APP_COMPONENT_STATE } from "./DeveloperPortalManageUserAppsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { DeveloperPortalViewUserApp } from "./DeveloperPortalViewUserApp";
import { DeveloperPortalNewEditUserApp, EAction } from "./DeveloperPortalNewEditUserApp";
import { DeveloperPortalDeleteUserApp } from "./DeveloperPortalDeleteUserApp";
import { TManagedObjectId } from "../../../components/APApiObjectsCommon";
import { DeveloperPortalManageUserAppWebhooks } from "./DeveloperPortalManageUserAppWebhooks/DeveloperPortalManageUserAppWebhooks";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalManageUserAppsProps {
  organizationName: TAPOrganizationId;
  userId: APSUserId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  // addBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
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
    setComponentState({
      previousState: componentState.currentState,
      currentState: componentState.previousState
    });
  }
  
  const transformAPSUserToApiDeveloper = (apsUser: APSUser): Developer => {
    return {
      email: apsUser.profile.email,
      firstName: apsUser.profile.first,
      lastName: apsUser.profile.last,
      userName: apsUser.userId
    }
  }

  const ToolbarNewManagedObjectButtonLabel = 'New App';
  const ToolbarEditManagedObjectButtonLabel = 'Edit App';
  const ToolbarManageWebhooksManagedObjectButtonLabel = 'Manage Webhooks';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete App';

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
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  // * Api Calls *  
  const apiCreateDeveloper = async(): Promise<TApiCallState> => {
    const funcName = 'apiCreateDeveloper';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_DEVELOPER, `create developer: ${props.userId}`);
    let existApiDeveloper: boolean = true;
    let anyError: any = undefined;
    try {
      const apiDeveloper: Developer = await DevelopersService.getDeveloper({
        organizationName: props.organizationName, 
        developerUsername: props.userId
      });
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) existApiDeveloper = false;
        else anyError = e;
      } else anyError = e;
    }
    if(!anyError && !existApiDeveloper) {
      try { 
        const apiDeveloper: Developer = await DevelopersService.createDeveloper({
          organizationName: props.organizationName, 
          requestBody: transformAPSUserToApiDeveloper(userContext.user)
        });
      } catch(e: any) {
        anyError = e;
      }  
    }
    if(anyError) {
      APClientConnectorOpenApi.logError(logName, anyError);
      callState = ApiCallState.addErrorToApiCallState(anyError, callState);
    }    
    setApiCallStatus(callState);
    return callState;
  }

  const initialize = async() => {
    setIsLoading(true);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.CREATE_API_DEVELOPER);
    const apiCallState: TApiCallState = await apiCreateDeveloper();
    if(!apiCallState.success) setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.INTERNAL_ERROR);
    else setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setIsLoading(false);
  }


  // * useEffect Hooks *
  React.useEffect(() => {
    initialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // const testCommandFunc = (e: MenuItemCommandParams): void => {
  //   const funcName = 'testCommandFunc';
  //   const logName = `${componentName}.${funcName}()`;
  //   alert(`${logName}: e.item = ${JSON.stringify(e.item, null, 2)}, managedObjectDisplayName=${managedObjectDisplayName}`);
  // }

  // React.useEffect(() => {
  //   if(!managedObjectDisplayName) return;
  //   if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW ||
  //       componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT ||
  //       componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT_WEBHOOKS
  //     ) 
  //     // props.onBreadCrumbLabelList([managedObjectDisplayName]);
  //     props.onBreadCrumbItemList([{
  //       label: `App: ${managedObjectDisplayName}`,
  //       command: testCommandFunc
  //     }]);
  //   // else props.onBreadCrumbLabelList([]);
  // }, [componentState, managedObjectDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    const funcName = 'renderLeftToolbarContent';
    const logName = `${componentName}.${funcName}()`;

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
            key={componentName+ToolbarManageWebhooksManagedObjectButtonLabel}
            label={ToolbarManageWebhooksManagedObjectButtonLabel} 
            // icon="pi pi-pencil" 
            onClick={onManageWebhooksManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
            disabled={!viewComponentManagedObjectDisplay.isAppWebhookCapable}
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
  const onSetManageUserAppComponentState = (manageUserAppComponentState: E_MANAGE_USER_APP_COMPONENT_STATE, appid: CommonName, appDisplayName: CommonDisplayName) => {
    const funcName = 'onSetManageUserAppComponentState';
    const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: TODO with componentState: ${componentState}, appdId=${appid}, appDisplayName=${appDisplayName}`);
    setManagedObjectId(appid);
    setManagedObjectDisplayName(appDisplayName);
    setNewComponentState(manageUserAppComponentState);
    setRefreshCounter(refreshCounter + 1);
  }
  // const onSetManageWebhookComponentState

  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
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
    if(!componentState.currentState || 
        componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.INTERNAL_ERROR ||
        componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.CREATE_API_DEVELOPER ) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if(componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if(  componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowManageWebhooksComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_MANAGE_WEBHOOKS) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowManageWebhooksComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
    }
  }

  return (
    <div className="apd-manage-user-apps">

      <Loading show={isLoading} />      
      
      {!isLoading && renderToolbar() }
      
      {showListComponent && 
        <DeveloperPortalListUserApps
          key={componentState.previousState}
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
    </div>
  );
}
