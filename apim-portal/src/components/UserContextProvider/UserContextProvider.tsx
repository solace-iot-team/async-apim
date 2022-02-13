import React from "react";
import { 
  APSUser 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { TAPUserMessage } from "../APComponentsCommon";
import { EAppState } from "../../utils/Globals";
import { TAPEntityId, TAPEntityIdList } from '../../utils/APEntityIdsService';

export type TUserRunttimeSettings = {
  currentOrganizationEntityId?: TAPEntityId;
  availableOrganizationEntityIdList?: TAPEntityIdList;
}

export type TUserContext = {
  user: APSUser,
  currentAppState: EAppState,
  originAppState: EAppState,
  runtimeSettings: TUserRunttimeSettings,
  userMessage?: TAPUserMessage
}
  
export interface IUserContextProviderProps {
  children: any
}

// const componentName: string = "UserContextProvider";

type UserContextAction = 
  | { type: 'SET_USER', user: APSUser }
  | { type: 'SET_CURRENT_ORGANIZATION_ENTITY_ID', currentOrganizationEntityId: TAPEntityId }
  | { type: 'SET_AVAILABLE_ORGANIZATION_ENTITY_ID_LIST', availableOrganizationEntityIdList: TAPEntityIdList }
  | { type: 'SET_USER_MESSAGE', userMessage: TAPUserMessage }
  | { type: 'CLEAR_USER_MESSAGE' }
  | { type: 'CLEAR_USER_CONTEXT' }
  | { type: 'SET_CURRENT_APP_STATE', appState: EAppState }
  | { type: 'SET_ORIGIN_APP_STATE', appState: EAppState }
  | { type: 'default'};

const UserContextReducer = (state: TUserContext, action: UserContextAction): TUserContext => {
  // const funcName: string = "UserContextReducer";
  // const logName: string = `${componentName}.${funcName}()`;
  switch (action.type) {
    case 'CLEAR_USER_CONTEXT': {
      const newState: TUserContext = JSON.parse(JSON.stringify(initialUserContext));
      newState.originAppState = EAppState.UNDEFINED;
      return newState;
    }
    case 'SET_USER': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.user = JSON.parse(JSON.stringify(action.user));
      return newState;
    }
    case 'SET_CURRENT_ORGANIZATION_ENTITY_ID': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.currentOrganizationEntityId = action.currentOrganizationEntityId;
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
    case 'SET_AVAILABLE_ORGANIZATION_ENTITY_ID_LIST': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.availableOrganizationEntityIdList = action.availableOrganizationEntityIdList;
      return newState;
    }
    case 'SET_ORIGIN_APP_STATE': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.originAppState = action.appState;
      return newState;
    }
    case 'SET_CURRENT_APP_STATE': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.currentAppState = action.appState;
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
  systemRoles: [],
  memberOfOrganizations: []
};
const initialUserContext: TUserContext = {
  user: emptyUser,
  currentAppState: EAppState.UNDEFINED,
  originAppState: EAppState.UNDEFINED,
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

