
import React from "react";
import { useInterval } from 'react-use';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../utils/APEntityIdsService";
import APAppsDisplayService, { IAPAppDisplay } from "../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./APMonitorUserAppCommon";
import APAppStatusDisplayService, { IAPAppStatusDisplay } from "../../displayServices/APAppsDisplayService/APAppStatusDisplayService";
import { APMonitorAppViewStats } from "./APMonitorAppViewStats";
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";

import '../APComponents.css';
import "./APMonitorApp.css";

export interface IAPMonitorAppProps {
  organizationId: string;
  appEntityId: TAPEntityId;
  className?: string;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const APMonitorApp: React.FC<IAPMonitorAppProps> = (props: IAPMonitorAppProps) => {
  const ComponentName = 'APMonitorApp';

  enum E_MONITOR_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
  }  
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
  type TManagedObject = IAPAppStatusDisplay;

  const ToolbarRefreshManagedObjectButtonLabel = 'Refresh Stats';
  const RefreshInterval_ms: number = 30000;

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedApAppDisplay, setManagedApAppDisplay] = React.useState<IAPAppDisplay>();  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);  
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [organizationContext] = React.useContext(OrganizationContext);

  // * Api Calls *

  const apiGet_ManagedObjects = async(): Promise<TApiCallState> => {
    const funcName = 'apiGet_ManagedObjects';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP, `retrieve app: ${props.appEntityId.displayName}`);
    try {
      const apAppDisplay: IAPAppDisplay = await APAppsDisplayService.apiGet_ApAppDisplay({ 
        organizationId: props.organizationId,
        appId: props.appEntityId.id,
        apOrganizationAppSettings: { apAppCredentialsExpiryDuration_millis: organizationContext.apAppCredentialsExpiryDuration_millis }
      });
      const apAppStatusDisplay: IAPAppStatusDisplay = await APAppStatusDisplayService.apiGet_ApAppStatusDisplay({
        organizationId: props.organizationId,
        apAppDisplay: apAppDisplay
      });
      setManagedApAppDisplay(apAppDisplay);
      setManagedObject(apAppStatusDisplay);
      // test error handling
      // throw new Error(`${logName}: test error handling`);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_STATUS, `retrieve stats for app: ${props.appEntityId.displayName}`);
    if(managedApAppDisplay === undefined) throw new Error(`${logName}: managedApAppDisplay === undefined`);
    try { 
      const apAppStatusDisplay: IAPAppStatusDisplay = await APAppStatusDisplayService.apiGet_ApAppStatusDisplay({
        organizationId: props.organizationId,
        apAppDisplay: managedApAppDisplay
      });
      setManagedObject(apAppStatusDisplay);
      // test error handling
      // throw new Error(`${logName}: test error handling`);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  
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

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGet_ManagedObjects();
    setNewComponentState(E_MONITOR_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    props.onLoadingChange(false);
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

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
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
          key={ComponentName+ToolbarRefreshManagedObjectButtonLabel} 
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

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="ap-app-view">
          <div className="ap-app-view-detail-left">
            <div><b>Status: </b>{mo.apAppStatus}</div>
          </div>
          <div className="ap-app-view-detail-right">
            <div>Id: {mo.apEntityId.id}</div>
          </div>            
        </div>
      </div>  
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      <div className="ap-monitor-app">

        { managedObject && renderHeader(managedObject) }
        
        { renderToolbar() }

        <ApiCallStatusError apiCallStatus={apiCallStatus} />


        {showViewComponent && managedObject && 
          <APMonitorAppViewStats
            key={`${ComponentName}_APMonitorAppViewStats_${refreshCounter}`}
            apAppStatusDisplay={managedObject}
          />
        }

      </div>
    </div>
  );
}
