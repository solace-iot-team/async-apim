import React from "react";
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import { 
  APSConnector 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { TAPRbacRoleList } from '../../utils/APRbac';
import { ConfigHelper } from "./ConfigHelper";
import { TAPConnectorInfo } from "../../utils/APConnectorApiCalls";
import { TAPPortalInfo } from "../../utils/Globals";

export type TAPSConnectorList = Array<APSConnector>;
export type TAPConfigContext = {
  rbacRoleList: TAPRbacRoleList,
  connector?: APSConnector,
  connectorInfo?: TAPConnectorInfo,
  portalInfo?: TAPPortalInfo
}

export interface IConfigContextProviderProps {
  children: any
}

export type ConfigContextAction = 
  | { type: 'SET_CONFIG_RBAC_ROLE_LIST', rbacRoleList: TAPRbacRoleList }
  | { type: 'SET_CONFIG_CONNECTOR', connector: APSConnector | undefined }
  | { type: 'SET_PORTAL_INFO', portalInfo: TAPPortalInfo | undefined }
  | { type: 'default'};

const configContextReducer = (state: TAPConfigContext, action: ConfigContextAction): TAPConfigContext => {
  switch (action.type) {
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
      case 'SET_PORTAL_INFO':
        return { 
          ...state,
          portalInfo: action.portalInfo
        }
      default: 
        return state;  
  }
}
const initialConfigContext: TAPConfigContext = {
  rbacRoleList: []
}

const initialAction: React.Dispatch<ConfigContextAction> = (value: ConfigContextAction) => {};

export const ConfigContext = React.createContext<[TAPConfigContext, React.Dispatch<ConfigContextAction>]>([initialConfigContext, initialAction]);

export const ConfigContextProvider: React.FC<IConfigContextProviderProps> = (props: IConfigContextProviderProps) => {

  const [state, dispatch] = React.useReducer(configContextReducer, initialConfigContext);

  React.useEffect(() => {
    ConfigHelper.doInitialize(dispatch);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <ConfigContext.Provider value={[state, dispatch]}>
      {props.children}
    </ConfigContext.Provider>
  );
}

