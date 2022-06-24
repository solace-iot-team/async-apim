import { TExpressServerConfig, TRootUserConfig } from './ServerConfig';
import { EServerStatusCodes, ServerLogger } from './ServerLogger';
import { 
  OpenAPI 
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import APSAuthStrategyService from './authstrategies/APSAuthStrategyService';
import APSServiceAccountsService from '../api/services/apsAdministration/APSServiceAccountsService';


export class ServerClient {
  private static protocol = 'http';
  private static host = 'localhost';
  private static expressServerConfig: TExpressServerConfig;
  private static rootUserConfig: TRootUserConfig;

  public static initialize = (expressServerConfig: TExpressServerConfig, rootUserConfig: TRootUserConfig) => {
    const funcName = 'initialize';
    const logName = `${ServerClient.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING } ));

    ServerClient.expressServerConfig = expressServerConfig;
    ServerClient.rootUserConfig = rootUserConfig;
    
    const base: URL = new URL(OpenAPI.BASE, `${ServerClient.protocol}://${ServerClient.host}:${ServerClient.expressServerConfig.port}${OpenAPI.BASE}`);
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, details: { base: base.toString() } } ));
    OpenAPI.BASE = base.toString();
    // initialize with service account token for bootstrap calls
    OpenAPI.WITH_CREDENTIALS = true;
    OpenAPI.TOKEN = APSAuthStrategyService.generateServiceAccountBearerToken_For_InternalAuth({ serviceAccountId: APSServiceAccountsService.getInternalApsServiceAccountId() });

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED, details: { OpenAPI: OpenAPI } } ));
  }

}


