import './common/env';
import { ExpressServer } from './common/server';
import routes from './routes';
import ServerConfig from './common/ServerConfig';
import ServerStatus from './common/ServerStatus';
import { EServerStatusCodes, ServerLogger } from './common/ServerLogger';
import { MongoDatabaseAccess } from './common/MongoDatabaseAccess';
import { BootstrapErrorFromApiError, BootstrapErrorFromError, ServerError, ServerErrorFromError } from './common/ServerError';
import APSConnectorsService from './api/services/apsConfig/APSConnectorsService';
import APSUsersService from './api/services/APSUsersService';
import APSLoginService from './api/services/APSLoginService';
import { ServerClient } from './common/ServerClient';
import APSAboutService from './api/services/apsConfig/APSAboutService';
import APSMonitorService from './api/services/APSMonitorService';
import ServerMonitor from './common/ServerMonitor';

const componentName = 'index';

const bootstrapComponents = async(): Promise<void> => {
  const funcName = 'bootstrapComponents';
  const logName = `${componentName}.${funcName}()`;
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING }));
  try {
    await APSConnectorsService.bootstrap();
    await APSUsersService.bootstrap();
    ServerStatus.setIsBootstrapped();
  } catch(e: any) {
    if (e instanceof BootstrapErrorFromApiError || e instanceof BootstrapErrorFromError) {
      ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAP_ERROR, details: { error: e } } ));
    } else {
      ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAP_ERROR, details: { error: e.toString() } } ));
    }
  }
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPED }));
}

export const initializeComponents = async(): Promise<void> => {
  const funcName = 'initializeComponents';
  const logName = `${componentName}.${funcName}()`;
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
  try {
    if(ServerStatus.getStatus().isInitialized) await MongoDatabaseAccess.initializeWithRetry(-1, 30000);
    else await MongoDatabaseAccess.initialize();
    // must be first, loads the root user
    await APSUsersService.initialize(ServerConfig.getRootUserConfig());
    await APSMonitorService.initialize();
    await APSConnectorsService.initialize();
    await APSLoginService.initialize();
    await APSAboutService.initialize(ServerConfig.getExpressServerConfig().rootDir);
    // must be the last one
    await ServerMonitor.initialize(ServerConfig.getMonitorConfig());
    // finally: set the server to initialized & ready
    ServerStatus.setIsInitialized();
    ServerStatus.setIsReady();
  } catch (e) {
    let serverError: ServerError;
    if (e instanceof ServerError ) serverError = e;
    else serverError = new ServerErrorFromError(e, logName);
    ServerLogger.fatal(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZE_ERROR, message: 'unrecoverable error, crashing ...' , details: serverError }));
    // crash the server
    throw e;
  }  
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  await bootstrapComponents();
}

// startup
ServerConfig.initialize();
ServerLogger.initialize(ServerConfig.getServerLoggerConfig());
ServerConfig.logConfig();
ServerClient.initialize(ServerConfig.getExpressServerConfig(), ServerConfig.getRootUserConfig());
const server = new ExpressServer(ServerConfig.getExpressServerConfig()).router(routes).start(initializeComponents);

export default server;
