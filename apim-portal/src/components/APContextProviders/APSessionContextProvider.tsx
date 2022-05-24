import React from "react";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";

export type TAPSessionContext = {
  apsApiToken: string | undefined;
  organizationId: string | undefined;
}

export interface ISessionContextProviderProps {
  children: any
}

export type TSessionContextAction = 
  | { type: 'SET_SESSION_CONTEXT', apSessionContext: TAPSessionContext }
  | { type: 'CLEAR_SESSION_CONTEXT' }
  | { type: 'default'};

const SessionContextReducer = (state: TAPSessionContext, action: TSessionContextAction): TAPSessionContext => {
  switch (action.type) {
    case 'SET_SESSION_CONTEXT': {
      APSClientOpenApi.setToken(action.apSessionContext.apsApiToken);
      return JSON.parse(JSON.stringify(action.apSessionContext));
    }
    case 'CLEAR_SESSION_CONTEXT': {
      return JSON.parse(JSON.stringify(EmptySessionContext));
    }
    default: 
      return state;  
  }
}
export const EmptySessionContext: TAPSessionContext = {
  apsApiToken: undefined,
  organizationId: undefined,
};

const initialAction: React.Dispatch<TSessionContextAction> = (value: TSessionContextAction) => {};

export const SessionContext = React.createContext<[TAPSessionContext, React.Dispatch<TSessionContextAction>]>([EmptySessionContext, initialAction]);

export const SessionContextProvider: React.FC<ISessionContextProviderProps> = (props: ISessionContextProviderProps) => {

  const [state, dispatch] = React.useReducer(SessionContextReducer, EmptySessionContext);

  return (
    <SessionContext.Provider value={[state, dispatch]}>
      {props.children}
    </SessionContext.Provider>
  );
}

