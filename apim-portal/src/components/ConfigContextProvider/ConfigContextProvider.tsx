import React from "react";
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import { APSConnector } from "@solace-iot-team/apim-server-openapi-browser";
import { TAPRbacRoleList, APRbac } from '../../utils/APRbac';
import { ConfigHelper } from "./ConfigHelper";

// const componentName: string = "ConfigContextProvider";

export type TAPSConnectorList = Array<APSConnector>;
export type TAPConfigContext = {
  rbacRoleList: TAPRbacRoleList,
  connector?: APSConnector
}

export interface IConfigContextProviderProps {
  children: any
}

type ConfigContextAction = 
  | { type: 'SET_CONFIG_RBAC_ROLE_LIST', rbacRoleList: TAPRbacRoleList }
  | { type: 'SET_CONFIG_CONNECTOR', connector: APSConnector | undefined }
  | { type: 'default'};

const configContextReducer = (state: TAPConfigContext, action: ConfigContextAction): TAPConfigContext => {
  // const funcName: string = `configContextReducer`;
  // const logName: string = `${componentName}.${funcName}()`
  switch (action.type) {
    case 'SET_CONFIG_RBAC_ROLE_LIST':
      return {
        ...state,
        rbacRoleList: action.rbacRoleList
      }
      case 'SET_CONFIG_CONNECTOR':
        // console.log(`${logName}: SET_CONFIG_CONNECTOR: action.connector=${JSON.stringify(action.connector, null, 2)}`);
        if(action.connector) {
          APClientConnectorOpenApi.initialize(action.connector.connectorClientConfig);
        } else {
          APClientConnectorOpenApi.uninitialize();
        }
        return {
          ...state,
          connector: action.connector
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

  const getConfigRbacRoleList = async() => {
    const configRbacRoleList: TAPRbacRoleList = APRbac.getAPRbacRoleList();
    dispatch( { type: 'SET_CONFIG_RBAC_ROLE_LIST', rbacRoleList: configRbacRoleList });
  }

  const getActiveConnectorInstance = async() => {
    const activeApsConnector: APSConnector | undefined = await ConfigHelper.getActiveConnectorInstance();
    dispatch( { type: 'SET_CONFIG_CONNECTOR', connector: activeApsConnector });
  }

  const doInitialize = async () => {
    await getConfigRbacRoleList();
    await getActiveConnectorInstance();
  }

  React.useEffect(() => {
    doInitialize()
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <ConfigContext.Provider value={[state, dispatch]}>
      {props.children}
    </ConfigContext.Provider>
  );
}

