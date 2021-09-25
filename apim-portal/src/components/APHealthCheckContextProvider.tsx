import React from "react";
import { TAPConfigIssueList, THealthCheckResult } from "../utils/Globals";

export type TAPHealthCheckContext = {
  configIssueList?: TAPConfigIssueList,
  portalHealthCheckResult?: THealthCheckResult,
  connectorHealthCheckResult?: THealthCheckResult
}

export interface IAPHealthCheckContextProviderProps {
  children: any
}

type APHealthCheckContextAction = 
  | { type: 'SET_CONNECTOR_HEALTHCHECK_RESULT', connectorHealthCheckResult: THealthCheckResult }
  | { type: 'SET_CONFIG_ISSUE_LIST', configIssueList: TAPConfigIssueList }
  | { type: 'default'};

const apHealthCheckContextReducer = (state: TAPHealthCheckContext, action: APHealthCheckContextAction): TAPHealthCheckContext => {
  // const funcName: string = `configContextReducer`;
  // const logName: string = `${componentName}.${funcName}()`
  switch (action.type) {
    case 'SET_CONNECTOR_HEALTHCHECK_RESULT':
      return { 
        ...state,
        connectorHealthCheckResult: action.connectorHealthCheckResult
      };
    case 'SET_CONFIG_ISSUE_LIST':
      return { 
        ...state,
        configIssueList: action.configIssueList,
      };
    default: 
      return state;  
  }
}
const initialContext: TAPHealthCheckContext = {}

const initialAction: React.Dispatch<APHealthCheckContextAction> = (value: APHealthCheckContextAction) => {};

export const APHealthCheckContext = React.createContext<[TAPHealthCheckContext, React.Dispatch<APHealthCheckContextAction>]>([initialContext, initialAction]);

export const APHealthCheckContextProvider: React.FC<IAPHealthCheckContextProviderProps> = (props: IAPHealthCheckContextProviderProps) => {
  // const componentName='HealthCheckContextProvider';

  const [state, dispatch] = React.useReducer(apHealthCheckContextReducer, initialContext);

  return (
    <APHealthCheckContext.Provider value={[state, dispatch]}>
      {props.children}
    </APHealthCheckContext.Provider>
  );
}

