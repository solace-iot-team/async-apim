import { MongoPersistenceService } from "./MongoPersistenceService";

import { TMonitorConfig } from "./ServerConfig";
import { EServerStatusCodes, ServerLogger } from "./ServerLogger";
import ServerStatus, { TConnectionTestDetails } from "./ServerStatus";
import { ApiKeyNotFoundServerError, ServerError } from "./ServerError";
import { MongoDatabaseAccess } from "./MongoDatabaseAccess";
import { initializeComponents } from "..";

export class ServerMonitor {
  private collectionName = "apsMonitor";
  private static dbObjectSchemaVersion = 0;
  private persistenceService: MongoPersistenceService;
  private connectionTestTimeoutId: NodeJS.Timeout;
  private config: TMonitorConfig;
  private isInitialized: boolean;

  public testDBConnection = async(): Promise<TConnectionTestDetails> => {
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
    return connectionTestResult;
  }

  public doConnectionTests = async() => {
    const connectionTestDetails: TConnectionTestDetails = await this.testDBConnection();
    if(!connectionTestDetails.success) {
      await initializeComponents();
    } else {
      this.setupConnectionMonitors(this.config.connectionTestInterval_secs * 1000);
    }
  }

  public startConnectionTests = () => {
    this.doConnectionTests();
  }

  private setupConnectionMonitors = (intervalMillis: number) => {
    this.connectionTestTimeoutId = setTimeout(this.startConnectionTests, intervalMillis);
  }

  public suspendConnectionMonitors = () => {
    const funcName = 'suspendConnectionMonitors';
    const logName = `${ServerMonitor.name}.${funcName}()`;
    if(!this.isInitialized) throw new ServerError(logName, 'not initialized');
    clearTimeout(this.connectionTestTimeoutId);
  }

  public resumeConnectionMonitors = () => {
    const funcName = 'resumeConnectionMonitors';
    const logName = `${ServerMonitor.name}.${funcName}()`;
    if(!this.isInitialized) throw new ServerError(logName, 'not initialized');
    this.setupConnectionMonitors(this.config.connectionTestInterval_secs * 1000);
  }

  constructor() { 
    this.persistenceService = new MongoPersistenceService(this.collectionName); 
    this.isInitialized = false;
  }

  public initialize = async (config: TMonitorConfig) => {
    const funcName = 'initialize';
    const logName = `${ServerMonitor.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));

    this.config = config;
    await this.persistenceService.initialize();
    let exists = true;
    try {
      await this.persistenceService.byId(ServerMonitor.name); 
    } catch (e) {
      if(e instanceof ApiKeyNotFoundServerError) exists = false;
      else throw e;
    }
    if(!exists) await this.persistenceService.create({
      documentId: ServerMonitor.name,
      document: { created: Date.now() },
      schemaVersion: ServerMonitor.dbObjectSchemaVersion
    });
    else await this.persistenceService.update({
      documentId: ServerMonitor.name,
      document: { created: Date.now() },
      schemaVersion: ServerMonitor.dbObjectSchemaVersion
    });

    this.setupConnectionMonitors(config.connectionTestInterval_secs * 1000);
    this.isInitialized = true;

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

}

export default new ServerMonitor();