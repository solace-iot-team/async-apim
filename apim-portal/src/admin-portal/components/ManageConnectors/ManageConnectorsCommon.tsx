import { 
  APSConnector, 
  APSId 
} from '@solace-iot-team/apim-server-openapi-browser';

import { Globals, THealthCheckResult } from '../../../utils/Globals';
import { TAPConnectorInfo } from '../../../utils/APConnectorApiCalls';
import { APClientConnectorOpenApi } from '../../../utils/APClientConnectorOpenApi';

export type TViewManagedObject = {
  id: APSId;
  displayName: string;
  globalSearch: string;
  apsConnector: APSConnector;
  apConnectorInfo: TAPConnectorInfo | undefined;
  healthCheckResult: THealthCheckResult;
  healthCheckPassed: string;
  composedConnectorUrl: string;
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_CONNECTOR = "API_DELETE_CONNECTOR",
  API_GET_CONNECTOR_LIST = "API_GET_CONNECTOR_LIST",
  API_CREATE_CONNECTOR = "API_CREATE_CONNECTOR",
  API_GET_CONNECTOR = "API_GET_CONNECTOR",
  API_REPLACE_CONNECTOR = "API_REPLACE_CONNECTOR",
  API_SET_CONNECTOR_ACTIVE = "API_SET_CONNECTOR_ACTIVE",
}

export class ManageConnectorsCommon {

  private static generateGlobalSearchContent = (apsConnector: APSConnector): string => {
    const filteredViewApiObject = {
      ...apsConnector,
      connectorClientConfig: {
        ...apsConnector.connectorClientConfig,
        adminUserPwd: undefined,
        apiUserPwd: undefined
      }
    }
    return Globals.generateDeepObjectValuesString(filteredViewApiObject);
  }

  public static createViewManagedObject = (apsConnector: APSConnector, apConnectorInfo: TAPConnectorInfo | undefined, healthCheckResult: THealthCheckResult): TViewManagedObject => {
    return {
      id: apsConnector.connectorId,
      displayName: apsConnector.displayName,
      globalSearch: ManageConnectorsCommon.generateGlobalSearchContent(apsConnector),
      apsConnector: apsConnector,
      apConnectorInfo: apConnectorInfo,
      healthCheckResult: healthCheckResult,
      healthCheckPassed: healthCheckResult.summary.success ? 'passed' : 'failed',
      composedConnectorUrl: APClientConnectorOpenApi.constructOpenApiBase(apsConnector.connectorClientConfig)
    }
  }

  public static isActiveBodyTemplate = (viewManagedObject: TViewManagedObject) => {
    if(viewManagedObject.apsConnector.isActive) return (<span className="pi pi-check badge-active" />)
    else return (<span className="pi pi-times badge-active" />)
  }

}
