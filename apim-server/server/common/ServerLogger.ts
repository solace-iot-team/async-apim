import pino from 'pino';
import { TServerLoggerConfig } from './ServerConfig';
import { Request } from 'express';


// level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'

export enum EServerStatusCodes {
  DB_INFO = "DB_INFO",
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  DB_CALL_ERROR = 'DB_CALL_ERROR',
  API_SERVICE_ERROR = 'API_SERVICE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INITIALIZING = 'INITIALIZING',
  INITIALIZE_ERROR = 'INITIALIZE_ERROR',
  INITIALIZED = 'INITIALIZED',
  BOOTSTRAPPING = 'BOOTSTRAPPING',
  BOOTSTRAPPED = 'BOOTSTRAPPED',
  BOOTSTRAP_ERROR = 'BOOTSTRAP_ERROR',
  MIGRATING = 'MIGRATING',
  MIGRATED = 'MIGRATED',
  MIGRATE_ERROR = 'MIGRATE_ERROR',
  INFO = 'INFO',
  INBOUND_TRANSACTION_LOG = 'INBOUND_TRANSACTION_LOG',
  MONITOR_DB_CONNECTION = 'MONITOR_DB_CONNECTION'
}

export type TServerStatus = {
  code: EServerStatusCodes,
  message?: string, 
  details?: any
}

export type TServerLogEntry = {
  name: string 
} & TServerStatus;

export class AuditLogger4Audit {
  private static body2Object = (body: any): any => {
    if(body && typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch (e) {
        return body;
      }
    }
    return body;
  }
  public static info = (auditObject: any, message: string) => {
    const funcName = 'info';
    const logName = `${AuditLogger4Audit.name}.${funcName}()`;
    if(auditObject.request.body) auditObject.request.body = AuditLogger4Audit.body2Object(auditObject.request.body);
    if(auditObject.response.body) auditObject.response.body = AuditLogger4Audit.body2Object(auditObject.response.body);
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INBOUND_TRANSACTION_LOG, message: message, details: auditObject }));
  }
  public static warn = (auditObject: any, message: string) => {
    const funcName = 'warn';
    const logName = `${AuditLogger4Audit.name}.${funcName}()`;
    ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: message, details: auditObject }));
  }
}

export class ServerLogger {

  public static L = pino({
    name: process.env.APIM_SERVER_LOGGER_APP_ID || 'apim-server',
    level: process.env.APIM_SERVER_LOGGER_LOG_LEVEL || 'trace'
  });

  public static initialize = (config: TServerLoggerConfig): void => {
    ServerLogger.L = pino({
      name: config.appId,
      level: config.level
    });
  }

  public static getRequestInfo = (req: Request): any => {
    const requestInfo = {
      method: req.method,
      hostname: req.hostname,
      originalUrl: req.originalUrl,
      headers: req.headers,
      params: req.params,
      query: req.query,
      body: req.body
    }
    return requestInfo;
  }
  
  public static createLogEntry = (componentName: string, serverStatus: TServerStatus): TServerLogEntry => {
    return {
      name: componentName,
      ...serverStatus
    };
  }

  public static fatal = (logEntry: TServerLogEntry): void => {
    ServerLogger.L.fatal(logEntry);
  }

  public static error = (logEntry: TServerLogEntry): void => {
    ServerLogger.L.error(logEntry);
  }

  public static warn = (logEntry: TServerLogEntry): void => {
    ServerLogger.L.warn(logEntry);
  }

  public static info = (logEntry: TServerLogEntry): void => {
    ServerLogger.L.info(logEntry);
  }

  public static debug = (logEntry: TServerLogEntry): void => {
    ServerLogger.L.debug(logEntry);
  }

  public static trace = (logEntry: TServerLogEntry): void => {
    ServerLogger.L.trace(logEntry);
  }

}


