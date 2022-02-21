import './common/env';
import { ExpressServer } from './common/server';
import routes from './routes';
import ServerConfig from './common/ServerConfig';
import ServerStatus from './common/ServerStatus';
import { EServerStatusCodes, ServerLogger } from './common/ServerLogger';
import { MongoDatabaseAccess } from './common/MongoDatabaseAccess';
import { BootstrapErrorFromApiError, BootstrapErrorFromError, MigrateServerError, ServerError, ServerErrorFromError } from './common/ServerError';
import APSConnectorsService from './api/services/apsConfig/APSConnectorsService';
import APSUsersService from './api/services/APSUsersService/APSUsersService';
import APSLoginService from './api/services/APSLoginService';
import { ServerClient } from './common/ServerClient';
import APSAboutService from './api/services/apsConfig/APSAboutService';
import APSMonitorService from './api/services/APSMonitorService';
import ServerMonitor from './common/ServerMonitor';
import APSOrganizationsService from './api/services/apsAdministration/APSOrganizationsService';
import APSBusinessGroupsService from './api/services/apsOrganization/apsBusinessGroups/APSBusinessGroupsService';
import APSExternalSystemsService from './api/services/apsOrganization/apsExternalSystems/APSExternalSystemsService';

const componentName = 'index';

const migrateComponents = async(): Promise<void> => {
  const funcName = 'migrateComponents';
  const logName = `${componentName}.${funcName}()`;
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING }));
  try {
    await APSUsersService.migrate();
    await APSOrganizationsService.migrate();
    await APSBusinessGroupsService.migrate();
    await APSExternalSystemsService.migrate();
    ServerStatus.setIsMigrated();
  } catch(e: any) {
    if (e instanceof MigrateServerError) {
      ServerLogger.fatal(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATE_ERROR, details: { error: e } } ));
    } else {
      ServerLogger.fatal(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATE_ERROR, details: { error: e.toString() } } ));
    }
    // crash the server
    throw e;
  }
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED }));
}

const bootstrapComponents = async(): Promise<void> => {
  const funcName = 'bootstrapComponents';
  const logName = `${componentName}.${funcName}()`;
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING }));
  try {
    await APSConnectorsService.bootstrap();
    await APSUsersService.bootstrap();
    await APSOrganizationsService.bootstrap();
    await APSBusinessGroupsService.bootstrap();
    await APSExternalSystemsService.bootstrap();
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
    await APSOrganizationsService.initialize();
    await APSBusinessGroupsService.initialize();
    await APSExternalSystemsService.initialize();
    // must be the last one
    await ServerMonitor.initialize(ServerConfig.getMonitorConfig());
    // finally: set the server to initialized & ready
    ServerStatus.setIsInitialized();
    ServerStatus.setIsReady(true);
  } catch (e) {
    let serverError: ServerError;
    if (e instanceof ServerError ) serverError = e;
    else serverError = new ServerErrorFromError(e, logName);
    ServerLogger.fatal(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZE_ERROR, message: 'unrecoverable error, crashing ...' , details: serverError }));
    // crash the server
    throw e;
  }  
  ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  await migrateComponents();
  await bootstrapComponents();
}

// startup
ServerConfig.initialize();
ServerLogger.initialize(ServerConfig.getServerLoggerConfig());
ServerConfig.logConfig();
ServerClient.initialize(ServerConfig.getExpressServerConfig(), ServerConfig.getRootUserConfig());
const server = new ExpressServer(ServerConfig.getExpressServerConfig()).router(routes).start(initializeComponents);

export default server;
