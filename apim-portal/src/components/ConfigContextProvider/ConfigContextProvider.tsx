import React from "react";
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import { 
  APSConnector 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { TAPRbacRoleList } from '../../utils/APRbac';
import { ConfigHelper } from "./ConfigHelper";
import { TAPConnectorInfo } from "../../utils/APConnectorApiCalls";
import { TAPPortalAppInfo } from "../../utils/Globals";

export type TAPSConnectorList = Array<APSConnector>;
export type TAPConfigContext = {
  isInitialized: boolean;
  rbacRoleList: TAPRbacRoleList,
  connector?: APSConnector,
  connectorInfo?: TAPConnectorInfo,
  portalAppInfo?: TAPPortalAppInfo
}

export interface IConfigContextProviderProps {
  children: any
}

export type ConfigContextAction = 
  | { type: 'UPDATE_CONFIG_CONTEXT', configContext: Partial<TAPConfigContext> }
  | { type: 'SET_CONFIG_RBAC_ROLE_LIST', rbacRoleList: TAPRbacRoleList }
  | { type: 'SET_CONFIG_CONNECTOR', connector: APSConnector | undefined }
  | { type: 'SET_PORTAL_APP_INFO', portalAppInfo: TAPPortalAppInfo | undefined }
  | { type: 'SET_IS_INITIALIZED', isInitialized: boolean }
  | { type: 'default'};

const configContextReducer = (state: TAPConfigContext, action: ConfigContextAction): TAPConfigContext => {
  switch (action.type) {
    case 'UPDATE_CONFIG_CONTEXT':
      const newState: TAPConfigContext = JSON.parse(JSON.stringify(state));
      if(action.configContext.rbacRoleList) newState.rbacRoleList = action.configContext.rbacRoleList;
      if(action.configContext.connector) {
        APClientConnectorOpenApi.initialize(action.configContext.connector.connectorClientConfig);
        newState.connector = action.configContext.connector;
      }
      if(action.configContext.connectorInfo) newState.connectorInfo = action.configContext.connectorInfo;
      if(action.configContext.portalAppInfo) newState.portalAppInfo = action.configContext.portalAppInfo;
      return newState;
    case 'SET_CONFIG_RBAC_ROLE_LIST':
      return {
        ...state,
        rbacRoleList: action.rbacRoleList
      }
      case 'SET_CONFIG_CONNECTOR':
        if(action.connector) {
          APClientConnectorOpenApi.initialize(action.connector.connectorClientConfig);
        } else {
          APClientConnectorOpenApi.uninitialize();
        }
        return {
          ...state,
          connector: action.connector
        }
      case 'SET_PORTAL_APP_INFO':
        return { 
          ...state,
          portalAppInfo: action.portalAppInfo
        }
      case 'SET_IS_INITIALIZED': 
        return {
          ...state,
          isInitialized: action.isInitialized
        }
      default: 
        return state;  
  }
}

const initialAction: React.Dispatch<ConfigContextAction> = (value: ConfigContextAction) => {};

export const ConfigContext = React.createContext<[TAPConfigContext, React.Dispatch<ConfigContextAction>]>([ConfigHelper.getEmptyContext(), initialAction]);

export const ConfigContextProvider: React.FC<IConfigContextProviderProps> = (props: IConfigContextProviderProps) => {

  const [state, dispatch] = React.useReducer(configContextReducer, ConfigHelper.getEmptyContext());

  React.useEffect(() => {
    ConfigHelper.doInitialize(dispatch);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <ConfigContext.Provider value={[state, dispatch]}>
      {props.children}
    </ConfigContext.Provider>
  );
}

