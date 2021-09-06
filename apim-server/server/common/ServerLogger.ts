import pino from 'pino';
import ServerConfig, { TServerLoggerConfig } from './ServerConfig';
import { Request } from 'express';


// level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'

export enum EServerStatusCodes {
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
  INFO = 'INFO'
}

export type TServerStatus = {
  code: EServerStatusCodes,
  message?: string, 
  details?: any
}

export type TServerLogEntry = {
  name: string 
} & TServerStatus;

export class ServerLogger {

  private static L = pino({
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
      headers: req.headers,
      method: req.method,
      originalUrl: req.originalUrl,
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
    // ServerLogger.L.fatal(JSON.stringify(logEntry, null, 2));
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


