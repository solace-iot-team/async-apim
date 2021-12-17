import { MongoPersistenceService } from "./MongoPersistenceService";

import { TMonitorConfig } from "./ServerConfig";
import { EServerStatusCodes, ServerLogger } from "./ServerLogger";
import ServerStatus, { TConnectionTestDetails } from "./ServerStatus";
import { ApiKeyNotFoundServerError } from "./ServerError";
import { MongoDatabaseAccess } from "./MongoDatabaseAccess";

export class ServerMonitor {
  private collectionName = "apsMonitor";
  private persistenceService: MongoPersistenceService;
  private connectionTestTimeoutId: NodeJS.Timeout;
  private config: TMonitorConfig;

  public testDBConnection = async() => {
    const funcName = 'testDBConnection';
    const logName = `${ServerMonitor.name}.${funcName}()`;

    const timestamp = Date.now();
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MONITOR_DB_CONNECTION,  message: 'monitor db connection', details: {
      timestamp: timestamp
    }}));

    const connectionTestResult: TConnectionTestDetails = await MongoDatabaseAccess.isConnected();
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MONITOR_DB_CONNECTION,  message: 'check if is connected to db', details: {connectionTestResult: connectionTestResult} }));
    ServerStatus.setDBConnectionTestDetails(connectionTestResult);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MONITOR_DB_CONNECTION,  message: 'server status', details: ServerStatus.getStatus() }));    
  }

  private doConnectionTests = async() => {
    await this.testDBConnection();
    this.setupConnectionMonitors(this.config.connectionTestInterval_secs * 1000);
  }

  public startConnectionTests = () => {
    this.doConnectionTests();
  }

  private setupConnectionMonitors = (intervalMillis: number) => {
    this.connectionTestTimeoutId = setTimeout(this.startConnectionTests, intervalMillis);
  }

  constructor() { 
    this.persistenceService = new MongoPersistenceService(this.collectionName); 
  }

  public initialize = async (config: TMonitorConfig) => {
    this.config = config;
    await this.persistenceService.initialize();
    let exists = true;
    try {
      await this.persistenceService.byId(ServerMonitor.name); 
    } catch (e) {
      if(e instanceof ApiKeyNotFoundServerError) exists = false;
      else throw e;
    }
    if(!exists) await this.persistenceService.create(ServerMonitor.name, { created: Date.now()});
    else await this.persistenceService.update(ServerMonitor.name, { created: Date.now()});
    this.setupConnectionMonitors(config.connectionTestInterval_secs * 1000);
  }

}

export default new ServerMonitor();