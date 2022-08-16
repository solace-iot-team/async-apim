import { EServerStatusCodes, ServerLogger } from "./ServerLogger";
import { ConnectorProxyError } from "./ServerError";
import { APSConnectorStatus } from "../../src/@solace-iot-team/apim-server-openapi-node";
import APSConnectorsService from "../api/services/apsConfig/APSConnectorsService";

export class ConnectorMonitor {
  private connectorTestTimeoutId: NodeJS.Timeout;

  private setupMonitor = (intervalMillis: number) => {
    this.connectorTestTimeoutId = setTimeout(this.testActiveConnector, intervalMillis);
  }

  public testActiveConnector = async() => {
    const funcName = 'testActiveConnector';
    const logName = `${ConnectorMonitor.name}.${funcName}()`;

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.ACTIVE_CONNECTOR_TESTING, details: {}}));

    try {
      // get the active connector status
      const apsConnectorStatus: APSConnectorStatus = await APSConnectorsService.connectorStatus({});
      if(apsConnectorStatus.connectorHealthCheckStatus !== "ok") {
        throw new ConnectorProxyError(logName, undefined, {
          connectorError: {
            apsConnectorStatus: apsConnectorStatus
          }
        });
      }
      ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.ACTIVE_CONNECTOR_TESTED, details: {
        apsConnectorStatus: apsConnectorStatus
      }}));
    } catch(err: any) {
      if(err instanceof ConnectorProxyError) {
        ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.ACTIVE_CONNECTOR_TEST_ERROR, details: { error: err }}));
      } else {
        ServerLogger.fatal(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.ACTIVE_CONNECTOR_TEST_ERROR, details: { error: err.toString() }}));
        throw err;
      }
    }
  }

  public initialize = async(activeConnectorTestInterval_secs: number) => {
    const funcName = 'initialize';
    const logName = `${ConnectorMonitor.name}.${funcName}()`;
    
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING, details: {
      activeConnectorTestInterval_secs: activeConnectorTestInterval_secs
    } }));

    this.setupMonitor(activeConnectorTestInterval_secs * 1000);

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

}

export default new ConnectorMonitor();