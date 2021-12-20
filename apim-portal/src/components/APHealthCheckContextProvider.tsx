import React from "react";
import { TAPConnectorHealthCheckResult, TAPHealthCheckSummary, TAPServerHealthCheckResult } from "../utils/APHealthCheck";
import { TAPConfigIssueList } from "../utils/Globals";

export type TAPHealthCheckContext = {
  configIssueList?: TAPConfigIssueList;
  connectorHealthCheckResult?: TAPConnectorHealthCheckResult;
  serverHealthCheckResult?: TAPServerHealthCheckResult;
  systemHealthCheckSummary?: TAPHealthCheckSummary;
}

export interface IAPHealthCheckContextProviderProps {
  children: any
}

type APHealthCheckContextAction = 
  | { type: 'SET_CONNECTOR_HEALTHCHECK_RESULT', connectorHealthCheckResult: TAPConnectorHealthCheckResult }
  | { type: 'SET_SERVER_HEALTHCHECK_RESULT', serverHealthCheckResult: TAPServerHealthCheckResult }
  | { type: 'SET_SYSTEM_HEALTHCHECK_SUMMARY', systemHealthCheckSummary: TAPHealthCheckSummary }
  | { type: 'SET_CONFIG_ISSUE_LIST', configIssueList: TAPConfigIssueList }
  | { type: 'default'};

const apHealthCheckContextReducer = (state: TAPHealthCheckContext, action: APHealthCheckContextAction): TAPHealthCheckContext => {
  switch (action.type) {
    case 'SET_SERVER_HEALTHCHECK_RESULT':
      return { 
        ...state,
        serverHealthCheckResult: action.serverHealthCheckResult
      };
    case 'SET_CONNECTOR_HEALTHCHECK_RESULT':
      return { 
        ...state,
        connectorHealthCheckResult: action.connectorHealthCheckResult
      };
    case 'SET_SYSTEM_HEALTHCHECK_SUMMARY':
      return { 
        ...state,
        systemHealthCheckSummary: action.systemHealthCheckSummary
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

  const [state, dispatch] = React.useReducer(apHealthCheckContextReducer, initialContext);

  return (
    <APHealthCheckContext.Provider value={[state, dispatch]}>
      {props.children}
    </APHealthCheckContext.Provider>
  );
}

