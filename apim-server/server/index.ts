import './common/env';
import { ExpressServer } from './common/server';
import routes from './routes';
import ServerConfig from './common/ServerConfig';
import { EServerStatusCodes, ServerLogger } from './common/ServerLogger';
import { MongoDatabaseAccess } from './common/MongoDatabaseAccess';
import { BootstrapErrorFromApiError, BootstrapErrorFromError, ServerError, ServerErrorFromError } from './common/ServerError';
import APSConnectorsService from './api/services/apsConfig/APSConnectorsService';
import APSUsersService from './api/services/APSUsersService';
import APSLoginService from './api/services/APSLoginService';
import { ServerClient } from './common/ServerClient';

const componentName = 'index';

const bootstrapServer = async(): Promise<void> => {
  const funcName = 'bootstrapServer';
  const logName = `${componentName}.${funcName}()`;
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING }));
  try {
    await APSConnectorsService.bootstrap();
  } catch(e: any) {
    if (e instanceof BootstrapErrorFromApiError || e instanceof BootstrapErrorFromError) {
      ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAP_ERROR, details: { error: e } } ));
    } else {
      ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAP_ERROR, details: { error: e.toString() } } ));
    }
  }
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPED }));
}

const initializeComponents = async(): Promise<void> => {
  const funcName = 'initializeComponents';
  const logName = `${componentName}.${funcName}()`;
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
  try {
    await MongoDatabaseAccess.initialize();
    // must be first, loads the root user
    await APSUsersService.initialize(ServerConfig.getRootUserConfig());
    await APSConnectorsService.initialize();
    await APSLoginService.initialize();
  } catch (e) {
    let serverError: ServerError;
    if (e instanceof ServerError ) serverError = e;
    else serverError = new ServerErrorFromError(e, logName);
    ServerLogger.fatal(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZE_ERROR, message: undefined , details: serverError }));
    throw e;
  }  
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  await bootstrapServer();
}

// initialize();
ServerConfig.initialize();
ServerLogger.initialize(ServerConfig.getServerLoggerConfig());
ServerConfig.logConfig();
ServerClient.initialize(ServerConfig.getExpressServerConfig(), ServerConfig.getRootUserConfig());
var server = new ExpressServer(ServerConfig.getExpressServerConfig()).router(routes).start(initializeComponents);
// server = expressServer.start();



// console.log(`not waiting for initialize() - that's an issue for the tests`);

export default server;
