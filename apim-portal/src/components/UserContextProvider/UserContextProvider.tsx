import React from "react";
import { TAPOrganizationId, TAPOrganizationIdList, TAPUserMessage } from "../APComponentsCommon";
import { APSUser } from '@solace-iot-team/apim-server-openapi-browser';

export type TUserRunttimeSettings = {
  currentOrganizationName?: TAPOrganizationId,
  availableOrganizationNameList?: TAPOrganizationIdList
}
  
export type TUserContext = {
  user: APSUser,
  runtimeSettings: TUserRunttimeSettings,
  userMessage?: TAPUserMessage
}
  
export interface IUserContextProviderProps {
  children: any
}

const componentName: string = "UserContextProvider";

type UserContextAction = 
  | { type: 'SET_USER', user: APSUser }
  | { type: 'SET_CURRENT_ORGANIZATION_NAME', currentOrganizationName: TAPOrganizationId }
  | { type: 'SET_AVAILABLE_ORGANIZATION_NAME_LIST', availableOrganizationNameList: TAPOrganizationIdList }
  | { type: 'SET_USER_MESSAGE', userMessage: TAPUserMessage }
  | { type: 'CLEAR_USER_MESSAGE' }
  | { type: 'CLEAR_USER_CONTEXT' }
  | { type: 'default'};

const UserContextReducer = (state: TUserContext, action: UserContextAction): TUserContext => {
  const funcName: string = "UserContextReducer";
  const logName: string = `${componentName}.${funcName}()`;
  switch (action.type) {
    case 'CLEAR_USER_CONTEXT': 
      return initialUserContext;
    case 'SET_USER':
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.user = JSON.parse(JSON.stringify(action.user));
      return newState;
    case 'SET_CURRENT_ORGANIZATION_NAME': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.currentOrganizationName = action.currentOrganizationName;
      return newState;
    }
    case 'SET_USER_MESSAGE': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.userMessage = action.userMessage;
      return newState;
    }
    case 'CLEAR_USER_MESSAGE': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.userMessage = undefined;
      return newState;
    }
    case 'SET_AVAILABLE_ORGANIZATION_NAME_LIST': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.availableOrganizationNameList = action.availableOrganizationNameList;
      return newState;
    }
    default: 
      return state;  
  }
}
const emptyUser: APSUser = { 
  isActivated: false,
  userId: '',
  password: '',
  profile: {
    first: '',
    last: '',
    email: ''
  },
  roles: []
};
const initialUserContext: TUserContext = {
  user: emptyUser,
  runtimeSettings: {}
}
const initialAction: React.Dispatch<UserContextAction> = (value: UserContextAction) => {};

export const UserContext = React.createContext<[TUserContext, React.Dispatch<UserContextAction>]>([initialUserContext, initialAction]);

export const UserContextProvider: React.FC<IUserContextProviderProps> = (props: IUserContextProviderProps) => {

  const [state, dispatch] = React.useReducer(UserContextReducer, initialUserContext);

  return (
    <UserContext.Provider value={[state, dispatch]}>
      {props.children}
    </UserContext.Provider>
  );
}

