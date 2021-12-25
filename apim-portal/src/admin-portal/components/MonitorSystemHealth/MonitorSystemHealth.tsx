
import React from "react";

import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";

import { SystemHealthOverview } from "./SystemHealthOverview";

import '../../../components/APComponents.css';
import "./MonitorSystemHealth.css";

export interface IMonitorSystemHealthProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const MonitorSystemHealth: React.FC<IMonitorSystemHealthProps> = (props: IMonitorSystemHealthProps) => {
  // const componentName = 'MonitorSystemHealth';

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    SYSTEM_HEALTH_OVERVIEW = "SYSTEM_HEALTH_OVERVIEW",
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
  // const setPreviousComponentState = () => {
  //   setComponentState({
  //     previousState: componentState.currentState,
  //     currentState: componentState.previousState
  //   });
  // }
  
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showSystemHealthOverviewComponent, setShowSystemHealthOverviewComponent] = React.useState<boolean>(false);
  
  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.SYSTEM_HEALTH_OVERVIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        // switch (apiCallStatus.context.action) {
        //   case E_CALL_STATE_ACTIONS.API_DELETE_CONNECTOR:
        //   case E_CALL_STATE_ACTIONS.API_CREATE_CONNECTOR:
        //   case E_CALL_STATE_ACTIONS.API_REPLACE_CONNECTOR:
        //       props.onSuccess(apiCallStatus);
        //     break;
        //   default:
        // }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * Overview  *
  // const onSystemHealthOverview = (): void => {
  //   setNewComponentState(E_COMPONENT_STATE.SYSTEM_HEALTH_OVERVIEW);
  // }  

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showSystemHealthOverviewComponent) return (
      <React.Fragment>
      </React.Fragment>
    );
    return undefined;
  }
  
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} />);
    else return (<React.Fragment></React.Fragment>);
  }

  // * prop callbacks *
  // const onSystemHealthOverviewSuccess = (apiCallState: TApiCallState) => {
  //   setApiCallStatus(apiCallState);
  //   setNewComponentState(E_COMPONENT_STATE.SYSTEM_HEALTH_OVERVIEW);
  // }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const calculateShowStates = (componentState: TComponentState) => {
    if(!componentState.currentState) {
      setShowSystemHealthOverviewComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.SYSTEM_HEALTH_OVERVIEW) {
      setShowSystemHealthOverviewComponent(true);
    }
  }

  return (
    <div className="ap-monitor-system-health">

      <Loading show={isLoading} />      
      
      {!isLoading && renderToolbar() }

      {showSystemHealthOverviewComponent && 
        <SystemHealthOverview
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
        />
      }
    </div>
  );
}
