import './common/env';
import { ExpressServer } from './common/server';
import routes from './routes';
import ServerConfig from './common/ServerConfig';
import { EServerStatusCodes, ServerLogger } from './common/ServerLogger';
import { MongoDatabaseAccess } from './common/MongoDatabaseAccess';
import { ServerError, ServerErrorFromError } from './common/ServerError';
import APSConnectorsService from './api/services/apsConfig/APSConnectorsService';
import APSUsersService from './api/services/APSUsersService';
import APSLoginService from './api/services/APSLoginService';

const componentName = 'index';

const initializeComponents = async(): Promise<void> => {
  const funcName = 'initializeComponents';
  const logName = `${componentName}.${funcName}()`;
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
  try {

    // ServerConfig.initialize();
    // ServerLogger.initialize(ServerConfig.getServerLoggerConfig());
    // ServerConfig.logConfig();
    await MongoDatabaseAccess.initialize();
    await APSConnectorsService.initialize();
    await APSUsersService.initialize(ServerConfig.getRootUserConfig());
    await APSLoginService.initialize();

    // /* eslint-disable-next-line no-var */
    // const expressServer: ExpressServer = new ExpressServer(ServerConfig.getExpressServerConfig()).router(routes);
    // server = expressServer.start();
  } catch (e) {
    let serverError: ServerError;
    if (e instanceof ServerError ) serverError = e;
    else serverError = new ServerErrorFromError(e, logName);
    ServerLogger.fatal(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZE_ERROR, message: undefined , details: serverError }));
    throw e;
  }  
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
}

// initialize();
ServerConfig.initialize();
ServerLogger.initialize(ServerConfig.getServerLoggerConfig());
ServerConfig.logConfig();
var server = new ExpressServer(ServerConfig.getExpressServerConfig()).router(routes).start(initializeComponents);
// server = expressServer.start();



// console.log(`not waiting for initialize() - that's an issue for the tests`);

export default server;
