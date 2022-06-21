import { TExpressServerConfig, TRootUserConfig } from './ServerConfig';
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


export class ConnectorClient {
  private static protocol = 'http';
  private static host = 'localhost';
  private static expressServerConfig: TExpressServerConfig;
  private static rootUserConfig: TRootUserConfig;

  public static initialize = (expressServerConfig: TExpressServerConfig, rootUserConfig: TRootUserConfig) => {
    const funcName = 'initialize';
    const logName = `${ConnectorClient.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING } ));

    ConnectorClient.expressServerConfig = expressServerConfig;
    ConnectorClient.rootUserConfig = rootUserConfig;
    
    const base: URL = new URL(APSOpenAPI.BASE + "/connectorProxy" +  ConnectorOpenAPI.BASE, `${ConnectorClient.protocol}://${ConnectorClient.host}:${ConnectorClient.expressServerConfig.port}`);
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, details: { base: base.toString() } } ));
    ConnectorOpenAPI.BASE = base.toString();
    ConnectorOpenAPI.WITH_CREDENTIALS = true;
    ConnectorOpenAPI.TOKEN = APSAuthStrategyService.generateServiceAccountBearerToken_For_InternalAuth({ serviceAccountId: APSServiceAccountsService.getInternalApsServiceAccountId() });

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED, details: { ConnectorOpenAPI: ConnectorOpenAPI } } ));

    // throw Error(`${logName}: continue here`)
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


