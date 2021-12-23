import React from "react";
import { EAPHealthCheckSuccess } from "../utils/APHealthCheck";

export type TAPHealthCheckSummaryState = {
  connectorHealthCheckSuccess: EAPHealthCheckSuccess;
  serverHealthCheckSuccess: EAPHealthCheckSuccess;
}

export interface IAPHealthCheckSummaryContextProviderProps {
  children: any
}

type APHealthCheckSummaryAction = 
  | { type: 'SET_CONNECTOR_HEALTHCHECK_SUCCESS', connectorHealthCheckSuccess: EAPHealthCheckSuccess }
  | { type: 'SET_SERVER_HEALTHCHECK_SUCCESS', serverHealthCheckSuccess: EAPHealthCheckSuccess }
  | { type: 'default'};

const apHealthCheckSummaryContextReducer = (state: TAPHealthCheckSummaryState, action: APHealthCheckSummaryAction): TAPHealthCheckSummaryState => {
  switch (action.type) {
    case 'SET_CONNECTOR_HEALTHCHECK_SUCCESS':
      return { 
        ...state,
        connectorHealthCheckSuccess: action.connectorHealthCheckSuccess
      };
    case 'SET_SERVER_HEALTHCHECK_SUCCESS':
      return { 
        ...state,
        serverHealthCheckSuccess: action.serverHealthCheckSuccess
      };
    default: 
      return state;  
  }
}
const initialState: TAPHealthCheckSummaryState = {
  connectorHealthCheckSuccess: EAPHealthCheckSuccess.UNDEFINED,
  serverHealthCheckSuccess: EAPHealthCheckSuccess.UNDEFINED
}

const initialAction: React.Dispatch<APHealthCheckSummaryAction> = (value: APHealthCheckSummaryAction) => {};

export const APHealthCheckSummaryContext = React.createContext<[TAPHealthCheckSummaryState, React.Dispatch<APHealthCheckSummaryAction>]>([initialState, initialAction]);

export const APHealthCheckSummaryContextProvider: React.FC<IAPHealthCheckSummaryContextProviderProps> = (props: IAPHealthCheckSummaryContextProviderProps) => {

  const [state, dispatch] = React.useReducer(apHealthCheckSummaryContextReducer, initialState);

  return (
    <APHealthCheckSummaryContext.Provider value={[state, dispatch]}>
      {props.children}
    </APHealthCheckSummaryContext.Provider>
  );
}

