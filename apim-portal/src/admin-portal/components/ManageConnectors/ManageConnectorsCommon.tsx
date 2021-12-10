import { 
  APSConnector, 
  APSId 
} from '@solace-iot-team/apim-server-openapi-browser';

import { Globals } from '../../../utils/Globals';
import { TAPConnectorInfo } from '../../../utils/APConnectorApiCalls';
import { APClientConnectorOpenApi } from '../../../utils/APClientConnectorOpenApi';
import { TAPConnectorHealthCheckResult } from '../../../utils/APHealthCheck';

export type TViewManagedObject = {
  id: APSId;
  displayName: string;
  globalSearch: string;
  apsConnector: APSConnector;
  apConnectorInfo: TAPConnectorInfo | undefined;
  healthCheckResult: TAPConnectorHealthCheckResult;
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

  public static createViewManagedObject = (apsConnector: APSConnector, apConnectorInfo: TAPConnectorInfo | undefined, healthCheckResult: TAPConnectorHealthCheckResult): TViewManagedObject => {
    return {
      id: apsConnector.connectorId,
      displayName: apsConnector.displayName,
      globalSearch: ManageConnectorsCommon.generateGlobalSearchContent(apsConnector),
      apsConnector: apsConnector,
      apConnectorInfo: apConnectorInfo,
      healthCheckResult: healthCheckResult,
      composedConnectorUrl: APClientConnectorOpenApi.constructOpenApiBase(apsConnector.connectorClientConfig)
    }
  }

  public static healthCheckPassDisplay = (healthCheckResult: TAPConnectorHealthCheckResult) : JSX.Element => {
    if(healthCheckResult.summary.performed) {
      if(healthCheckResult.summary.success) {
        return (<span style={ {color: 'green' }}>pass</span>);
      } else return (<span style={ {color: 'red' }}>fail</span>);
    } else {
      return (
        <span>not performed</span>
      );
    }
  }
  public static healthCheckBodyTemplate = (viewManagedObject: TViewManagedObject): JSX.Element => {
    return ManageConnectorsCommon.healthCheckPassDisplay(viewManagedObject.healthCheckResult);
  }
  public static isActiveBodyTemplate = (viewManagedObject: TViewManagedObject) => {
    if(viewManagedObject.apsConnector.isActive) return (<span className="pi pi-check badge-active" />);
    else return (<span className="pi pi-times badge-active" />);
  }

}
