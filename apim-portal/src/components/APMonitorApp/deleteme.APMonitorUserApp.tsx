
import React from "react";
import { useInterval } from 'react-use';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { 
  AppConnectionStatus,
  AppListItem,
  AppResponse,
  AppsService,
  CommonDisplayName, 
  CommonName,
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { EApiTopicSyntax } from "../APApiObjectsCommon";
import { Globals } from "../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { 
  APManagedWebhook, 
  TAPManagedAppWebhooks, 
  TAPOrganizationId, 
} from "../deleteme.APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./deleteme.APMonitorUserAppCommon";
import { APMonitorUserAppViewStats } from "./deleteme.APMonitorUserAppViewStats";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";

import '../APComponents.css';
// import "../APMonitorUserApps.css";

export interface IAPMonitorUserAppProps {
  organizationId: TAPOrganizationId;
  appId: CommonName;
  appDisplayName: CommonDisplayName;
  appType: AppListItem.appType;
  appOwnerId: string;  
  className?: string;
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const APMonitorUserApp: React.FC<IAPMonitorUserAppProps> = (props: IAPMonitorUserAppProps) => {
  const componentName = 'APMonitorUserApp';

  enum E_MONITOR_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
  }
  
  type TManagedObject = TAPManagedAppWebhooks;

  type TComponentState = {
    previousState: E_MONITOR_COMPONENT_STATE,
    currentState: E_MONITOR_COMPONENT_STATE
  }
  const initialComponentState: TComponentState = {
    previousState: E_MONITOR_COMPONENT_STATE.UNDEFINED,
    currentState: E_MONITOR_COMPONENT_STATE.UNDEFINED
  }
  const setNewComponentState = (newState: E_MONITOR_COMPONENT_STATE) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  // const setPreviousComponentState = () => {
  //   setComponentState({
  //     previousState: componentState.currentState,
  //     currentState: componentState.previousState
  //   });
  // }
  
  const ToolbarRefreshManagedObjectButtonLabel = 'Refresh Stats';
  const RefreshInterval_ms: number = 30000;

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [viewComponentState, setViewComponentState] = React.useState<any>();
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

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
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve stats for app: ${props.appDisplayName}`);
    try { 
      let _apiAppResponse_smf: AppResponse | undefined = undefined;
      switch(props.appType) {
        case AppListItem.appType.DEVELOPER:
          _apiAppResponse_smf = await AppsService.getDeveloperApp({
            organizationName: props.organizationId, 
            developerUsername: props.appOwnerId, 
            appName: props.appId,
            topicSyntax: EApiTopicSyntax.SMF
          });    
          break;
        case AppListItem.appType.TEAM:
          _apiAppResponse_smf = await AppsService.getTeamApp({
            organizationName: props.organizationId, 
            teamName: props.appOwnerId,
            appName: props.appId,
            topicSyntax: EApiTopicSyntax.SMF
          });
          break;
        default:
          Globals.assertNever(logName, props.appType);
      }
      const _apiAppConnectionStatus: AppConnectionStatus = await AppsService.getAppStatus({
        organizationName: props.organizationId,
        appName: props.appId
      });
      if(_apiAppResponse_smf === undefined) throw new Error(`${logName}: _apiAppResponse_smf is undefined`);
      let _mo: TManagedObject = transformGetApiObjectToManagedObject(_apiAppResponse_smf, _apiAppConnectionStatus);
      setManagedObject(_mo);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  
  // * useEffect Hooks *
  const doInitialize = async () => {
    await doRefreshComponentData();
    setNewComponentState(E_MONITOR_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: `Monitor`
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useInterval( () => 
    {
      doRefreshComponentData();
    },
    RefreshInterval_ms
  );

  const doRefreshComponentData = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    setRefreshCounter(refreshCounter + 1);
    props.onLoadingChange(false);
  }
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
            break;
          }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  const onRefreshStatusFromToolbar = () => {
    doRefreshComponentData();
  }

  // * Toolbar *
  const getLeftToolbarContent = (): Array<JSX.Element> | undefined => {
    if(!componentState.currentState || !managedObject) return undefined;
    let jsxButtonList: Array<JSX.Element> = [
    ];
    if(showViewComponent) {          
      jsxButtonList.push(
        <Button 
          key={componentName+ToolbarRefreshManagedObjectButtonLabel} 
          label={ToolbarRefreshManagedObjectButtonLabel} 
          icon="pi pi-refresh" 
          onClick={onRefreshStatusFromToolbar} 
          className="p-button-text p-button-plain p-button-outlined"
        />
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
  
  const calculateShowStates = (componentState: TComponentState) => {
    if(!componentState.currentState || componentState.currentState === E_MONITOR_COMPONENT_STATE.UNDEFINED) {
      setShowViewComponent(false);
    }
    else if(componentState.currentState === E_MONITOR_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowViewComponent(true);
    }
  }

  return (
    <div className={props.className ? props.className : 'card'}>

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { renderToolbar() }

      {showViewComponent && managedObject && 
        <APMonitorUserAppViewStats
          key={refreshCounter}
          managedAppWebhooks={managedObject}
          state={viewComponentState}
          onStateChange={setViewComponentState}
        />
      }
    </div>
  );
}
