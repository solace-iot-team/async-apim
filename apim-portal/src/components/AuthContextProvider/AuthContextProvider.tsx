import React from "react";

import { AuthHelper } from "../../auth/AuthHelper";

// const componentName: string = "AuthContextProvider";

export interface IAuthContextProviderProps {
  children: any
}

export type TAPAuthContext = {
  isLoggedIn: boolean,
  authorizedResourcePathsAsString: string,
  // roles?: TAPRbacRoleList
}

type AuthContextAction = 
  | { type: 'SET_AUTH_CONTEXT', authContext: TAPAuthContext }
  | { type: 'SET_IS_LOGGED_IN' }
  | { type: 'CLEAR_AUTH_CONTEXT' }
  | { type: 'default'};

const authContextReducer = (state: TAPAuthContext, action: AuthContextAction): TAPAuthContext => {
  // const funcName: string = `authContextReducer`;
  // const logName: string = `${componentName}.${funcName}()`
  switch (action.type) {
    case 'SET_AUTH_CONTEXT':
      // console.log(`${logName}: SET_AUTH_CONTEXT with ${JSON.stringify(action.authContext)}`);
      return action.authContext
    case 'SET_IS_LOGGED_IN':
      let newState: TAPAuthContext = JSON.parse(JSON.stringify(state));
      newState.isLoggedIn = true;
      return newState;
    case 'CLEAR_AUTH_CONTEXT':
      // console.log(`${logName}: SET_AUTH_CONTEXT with ${JSON.stringify(action.authContext)}`);
      return AuthHelper.getEmptyAuthContext();
    default: 
      return state;  
  }
}

const initialAction: React.Dispatch<AuthContextAction> = (value: AuthContextAction) => {};

export const AuthContext = React.createContext<[TAPAuthContext, React.Dispatch<AuthContextAction>]>([AuthHelper.getEmptyAuthContext(), initialAction]);

export const AuthContextProvider: React.FC<IAuthContextProviderProps> = (props: IAuthContextProviderProps) => {

  const [state, dispatch] = React.useReducer(authContextReducer, AuthHelper.getEmptyAuthContext());

  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {props.children}
    </AuthContext.Provider>
  );
}

