import { 
  APSConnector, 
  APSId 
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import { Globals } from '../../../utils/Globals';
import { TAPConnectorInfo } from '../../../utils/APConnectorApiCalls';
import { APClientConnectorOpenApi } from '../../../utils/APClientConnectorOpenApi';
import { EAPConnectorHealthCheckLogEntryType, EAPHealthCheckSuccess, TAPConnectorHealthCheckLogEntry_About, TAPConnectorHealthCheckResult } from '../../../utils/APHealthCheck';
import { SystemHealthCommon } from '../../../components/SystemHealth/SystemHealthCommon';

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
  API_USER_LOGOUT = "API_USER_LOGOUT"
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

  public static getApConnectorInfo = ({ apConnectorHealthCheckResult }:{
    apConnectorHealthCheckResult: TAPConnectorHealthCheckResult;
  }): TAPConnectorInfo | undefined => {

    if(apConnectorHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL) return undefined;

    // console.log(`${logName}: healthCheckResult = ${JSON.stringify(healthCheckResult, null, 2)}`);
    // find "entryType": "GET_CONNECTOR_ABOUT",
    for(const apConnectorHealthCheckLogEntry of apConnectorHealthCheckResult.healthCheckLog) {
      if(apConnectorHealthCheckLogEntry.entryType === EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_ABOUT) {
        const apConnectorHealthCheckLogEntry_About: TAPConnectorHealthCheckLogEntry_About = apConnectorHealthCheckLogEntry;
        if(apConnectorHealthCheckLogEntry_About.about !== undefined) {
          const apConnectorInfo: TAPConnectorInfo = {
            connectorAbout: {
              apiAbout: apConnectorHealthCheckLogEntry_About.about,
              portalAbout: {
                isEventPortalApisProxyMode: apConnectorHealthCheckLogEntry_About.about.APIS_PROXY_MODE ? apConnectorHealthCheckLogEntry_About.about.APIS_PROXY_MODE : false,
                eventPortalVersion: apConnectorHealthCheckLogEntry_About.about.EVENT_PORTAL_VERSION,
                connectorOpenApiVersionStr: apConnectorHealthCheckLogEntry_About.about.version.version["platform-api-openapi"],
                connectorServerVersionStr: apConnectorHealthCheckLogEntry_About.about.version.version["platform-api-server"],
              }
            }
          };
          return apConnectorInfo;  
        }
      }
    }
    return undefined;
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

  public static healthCheckSuccessDisplay = (healthCheckResult: TAPConnectorHealthCheckResult) : JSX.Element => {
    if(healthCheckResult.summary.performed) {
      return (<span style={ {color: SystemHealthCommon.getColor(healthCheckResult.summary.success) }}>{healthCheckResult.summary.success}</span>);
      // if(healthCheckResult.summary.success === EAPHealthCheckSuccess.PASS) {
      //   return (<span style={ {color: 'green' }}>pass</span>);
      // } else return (<span style={ {color: 'red' }}>fail</span>);
    } else {
      return (
        <span>not performed</span>
      );
    }
  }
  public static healthCheckBodyTemplate = (viewManagedObject: TViewManagedObject): JSX.Element => {
    return ManageConnectorsCommon.healthCheckSuccessDisplay(viewManagedObject.healthCheckResult);
  }
  public static isActiveBodyTemplate = (viewManagedObject: TViewManagedObject) => {
    if(viewManagedObject.apsConnector.isActive) return (<span className="pi pi-check badge-active" />);
    else return (<span className="pi pi-times badge-active" />);
  }

}
