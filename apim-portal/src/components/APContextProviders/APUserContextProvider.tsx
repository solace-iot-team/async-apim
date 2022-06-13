import React from "react";
import { TAPUserMessage } from "../deleteme.APComponentsCommon";
import { EAppState } from "../../utils/Globals";
import { TAPEntityId, TAPEntityIdList } from '../../utils/APEntityIdsService';
import APLoginUsersDisplayService, { TAPLoginUserDisplay } from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { TAPMemberOfBusinessGroupDisplayTreeNodeList } from "../../displayServices/APUsersDisplayService/APMemberOfService";

export type TUserRunttimeSettings = {
  currentOrganizationEntityId?: TAPEntityId;
  currentBusinessGroupEntityId?: TAPEntityId;
  currentRolesEntityIdList?: TAPEntityIdList;
  apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
}

export type TUserContext = {
  apLoginUserDisplay: TAPLoginUserDisplay;
  currentAppState: EAppState;
  originAppState: EAppState;
  runtimeSettings: TUserRunttimeSettings;
  userMessage?: TAPUserMessage;
  showIsLoading?: boolean;
}
  
export interface IUserContextProviderProps {
  children: any
}

// const componentName: string = "UserContextProvider";

export type UserContextAction = 
  | { type: 'SET_USER', apLoginUserDisplay: TAPLoginUserDisplay }
  | { type: 'SET_CURRENT_ORGANIZATION_ENTITY_ID', currentOrganizationEntityId: TAPEntityId }
  | { type: 'SET_CURRENT_BUSINESS_GROUP_ENTITY_ID', currentBusinessGroupEntityId: TAPEntityId }
  | { type: 'CLEAR_CURRENT_BUSINESS_GROUP_ENTITY_ID' }
  | { type: 'SET_CURRENT_ROLES', currentRolesEntityIdList: TAPEntityIdList }
  | { type: 'CLEAR_CURRENT_ROLES' }
  | { type: 'SET_AP_MEMBER_OF_BUSINESS_GROUP_DISPLAY_TREE_NODE_LIST', apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList }
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
      newState.apLoginUserDisplay = JSON.parse(JSON.stringify(action.apLoginUserDisplay));
      return newState;
    }
    case 'SET_CURRENT_ORGANIZATION_ENTITY_ID': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.currentOrganizationEntityId = action.currentOrganizationEntityId;
      return newState;
    }
    case 'SET_CURRENT_BUSINESS_GROUP_ENTITY_ID': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.currentBusinessGroupEntityId = action.currentBusinessGroupEntityId;
      return newState;
    }
    case 'CLEAR_CURRENT_BUSINESS_GROUP_ENTITY_ID': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.currentBusinessGroupEntityId = undefined;
      return newState;
    }
    case 'SET_CURRENT_ROLES': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.currentRolesEntityIdList = action.currentRolesEntityIdList;
      return newState;
    }
    case 'CLEAR_CURRENT_ROLES': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.currentRolesEntityIdList = undefined;
      return newState;
    }
    case 'SET_AP_MEMBER_OF_BUSINESS_GROUP_DISPLAY_TREE_NODE_LIST': {
      const newState: TUserContext = JSON.parse(JSON.stringify(state));
      newState.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList = action.apMemberOfBusinessGroupDisplayTreeNodeList;
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
    // case 'SET_AVAILABLE_ORGANIZATION_ENTITY_ID_LIST': {
    //   const newState: TUserContext = JSON.parse(JSON.stringify(state));
    //   newState.runtimeSettings.availableOrganizationEntityIdList = action.availableOrganizationEntityIdList;
    //   return newState;
    // }
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
const initialUserContext: TUserContext = {
  apLoginUserDisplay: APLoginUsersDisplayService.create_Empty_ApLoginUserDisplay(),
  currentAppState: EAppState.UNDEFINED,
  originAppState: EAppState.UNDEFINED,
  runtimeSettings: {
    apMemberOfBusinessGroupDisplayTreeNodeList: []
  }
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

