import React from "react";
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import { APSConnector } from "@solace-iot-team/apim-server-openapi-browser";
import { TAPRbacRoleList, APRbac } from '../../utils/APRbac';
import { ConfigHelper } from "./ConfigHelper";
import { APConnectorApiCalls, TAPConnectorInfo } from "../../utils/APConnectorApiCalls";
import { TAPPortalInfo } from "../../utils/Globals";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";

// const componentName: string = "ConfigContextProvider";

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

type ConfigContextAction = 
  | { type: 'SET_CONFIG_RBAC_ROLE_LIST', rbacRoleList: TAPRbacRoleList }
  | { type: 'SET_CONFIG_CONNECTOR', connector: APSConnector | undefined }
  | { type: 'SET_CONNECTOR_INFO', connectorInfo: TAPConnectorInfo | undefined }
  | { type: 'SET_PORTAL_INFO', portalInfo: TAPPortalInfo | undefined }
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
      case 'SET_CONNECTOR_INFO':
        return { 
          ...state,
          connectorInfo: action.connectorInfo
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
  const componentName='ConfigContextProvider';

  const [state, dispatch] = React.useReducer(configContextReducer, initialConfigContext);

  const getConfigRbacRoleList = async() => {
    const configRbacRoleList: TAPRbacRoleList = APRbac.getAPRbacRoleList();
    dispatch( { type: 'SET_CONFIG_RBAC_ROLE_LIST', rbacRoleList: configRbacRoleList });
  }

  const getActiveConnectorInstance = async(): Promise<APSConnector | undefined> => {
    const activeApsConnector: APSConnector | undefined = await ConfigHelper.apiGetActiveConnectorInstance();
    dispatch( { type: 'SET_CONFIG_CONNECTOR', connector: activeApsConnector });
    return activeApsConnector;
  }

  const getActiveConnectorInfo = async(apsConnector: APSConnector | undefined) => {
    // const funcName = 'getActiveConnectorInfo';
    // const logName= `${componentName}.${funcName}()`;
    let apConnectorInfo: TAPConnectorInfo | undefined = undefined;
    if(apsConnector) {
      apConnectorInfo = await APConnectorApiCalls.getConnectorInfo(apsConnector.connectorClientConfig);
    }
    dispatch( { type: 'SET_CONNECTOR_INFO', connectorInfo: apConnectorInfo });
  }

  const getPortalInfo = ()  => {
    const portalInfo: TAPPortalInfo = {
      connectorClientOpenApiInfo: APClientConnectorOpenApi.getOpenApiInfo(),
      portalServerClientOpenApiInfo: APSClientOpenApi.getOpenApiInfo()
    };
    dispatch( { type: 'SET_PORTAL_INFO', portalInfo: portalInfo });
  }

  const doInitialize = async () => {
    await getConfigRbacRoleList();
    const apsConnector: APSConnector | undefined = await getActiveConnectorInstance();
    await getActiveConnectorInfo(apsConnector);
    getPortalInfo();
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

