import { TExpressServerConfig } from './ServerConfig';
import { EServerStatusCodes, ServerLogger } from './ServerLogger';
import {
  OpenAPI as ConnectorOpenAPI,
  ApiError
} from '@solace-iot-team/apim-connector-openapi-node';
import { 
  OpenAPI as APSOpenAPI
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import APSAuthStrategyService from './authstrategies/APSAuthStrategyService';
import APSServiceAccountsService from '../api/services/apsAdministration/APSServiceAccountsService';

/**
 * Always goes through the proxy, so we have transaction logging
 */
export class ConnectorClient {
  private static protocol = 'http';
  private static host = 'localhost';
  private static apsSessionUserId: string | undefined = undefined;

  private static getToken = async(): Promise<string> => {
    if(ConnectorClient.apsSessionUserId) {
      return APSAuthStrategyService.generateUserAccountBearerToken_For_InternalAuth({ userId: ConnectorClient.apsSessionUserId });
    }
    // if no user session use the internal service account
    return APSAuthStrategyService.generateServiceAccountBearerToken_For_InternalAuth({ serviceAccountId: APSServiceAccountsService.getInternalApsServiceAccountId() });
  }

  public static setApsSessionUserId = (apsSessionUserId: string | undefined) => {
    ConnectorClient.apsSessionUserId = apsSessionUserId;
  }

  public static initialize = (expressServerConfig: TExpressServerConfig) => {
    const funcName = 'initialize';
    const logName = `${ConnectorClient.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING } ));

    const base: URL = new URL(APSOpenAPI.BASE + "/connectorProxy" +  ConnectorOpenAPI.BASE, `${ConnectorClient.protocol}://${ConnectorClient.host}:${expressServerConfig.port}`);
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, details: { base: base.toString() } } ));
    ConnectorOpenAPI.BASE = base.toString();
    ConnectorOpenAPI.WITH_CREDENTIALS = true;
    ConnectorOpenAPI.TOKEN = async() => { return await ConnectorClient.getToken(); }

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED, details: { ConnectorOpenAPI: ConnectorOpenAPI } } ));

  }

  public static isInstanceOfApiError(error: Error): boolean {
    return (error instanceof ApiError);
  }

  public static getErrorAsString = (e: Error) => {
    let errString: string;
    if(ConnectorClient.isInstanceOfApiError(e)) errString = JSON.stringify(e, null, 2);
    else errString = `${e.name}: ${e.message}`;
    return errString;
  }

}


