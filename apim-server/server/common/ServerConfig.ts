import path from 'path';
import { OpenAPI } from '../../src/@solace-iot-team/apim-server-openapi-node';
import { ConfigEnvVarNotANumberServerError, ConfigMissingEnvVarServerError } from './ServerError';

import { EServerStatusCodes, ServerLogger } from "./ServerLogger";
import { ServerUtils } from './ServerUtils';

export type TExpressServerConfig = {
  rootDir: string;
  port: number;
  apiBase: string;
  requestSizeLimit: string;
  serverSecret: string;
  enableOpenApiResponseValidation: boolean;
}
export type TServerLoggerConfig = {
  appId: string,
  level: string
}
export type TMongoDBConfig = {
  mongoConnectionString: string;
  serverMongoDatabaseName: string;
}
export type TRootUserConfig = {
  userId: string,
  password: string
}
export type TMonitorConfig = {
  connectionTestInterval_secs: number;
}
export type TServerConfig = {
  dataPath?: string;
  expressServer: TExpressServerConfig;
  mongoDB: TMongoDBConfig;
  serverLogger: TServerLoggerConfig;
  rootUser: TRootUserConfig;
  monitorConfig: TMonitorConfig;
};

enum EEnvVars {
  APIM_SERVER_PORT = 'APIM_SERVER_PORT',
  APIM_SERVER_MONGO_CONNECTION_STRING = 'APIM_SERVER_MONGO_CONNECTION_STRING',
  APIM_SERVER_MONGO_DB = 'APIM_SERVER_MONGO_DB',
  APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION = 'APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION',
  APIM_SERVER_LOGGER_LOG_LEVEL= 'APIM_SERVER_LOGGER_LOG_LEVEL',
  APIM_SERVER_LOGGER_APP_ID = 'APIM_SERVER_LOGGER_APP_ID',
  APIM_SERVER_REQUEST_SIZE_LIMIT = 'APIM_SERVER_REQUEST_SIZE_LIMIT',
  APIM_SERVER_SECRET = 'APIM_SERVER_SECRET',
  APIM_SERVER_ROOT_USER = 'APIM_SERVER_ROOT_USER',
  APIM_SERVER_ROOT_USER_PWD = 'APIM_SERVER_ROOT_USER_PWD',
  APIM_SERVER_DATA_PATH = 'APIM_SERVER_DATA_PATH'
}

export class ServerConfig {
  private config: TServerConfig;

  private static DefaultServerLoggerConfig: TServerLoggerConfig = {
    appId: 'apim-server',
    level: 'trace'
  }

  private getMandatoryEnvVarValueAsString = (envVarName: string): string => {
    const funcName = 'getMandatoryEnvVarValueAsString';
    const logName = `${ServerConfig.name}.${funcName}()`;
    const value: string | undefined = process.env[envVarName];
    if (!value) throw new ConfigMissingEnvVarServerError(logName, 'mandatory env var missing', envVarName);    
    return value;
  };

  private getOptionalEnvVarValueAsString = (envVarName: string): string | undefined => {
    return process.env[envVarName];
  }

  private getOptionalEnvVarValueAsBoolean = (envVarName: string, defaultValue: boolean): boolean => {
    const value: string | undefined = process.env[envVarName];
    if(!value) return defaultValue;
    return value.toLowerCase() === 'true';
  };

  private getMandatoryEnvVarValueAsNumber = (envVarName: string): number => {
    const funcName = 'getMandatoryEnvVarValueAsNumber';
    const logName = `${ServerConfig.name}.${funcName}()`;
    const value: string = this.getMandatoryEnvVarValueAsString(envVarName);
    const valueAsNumber: number = parseInt(value);
    if (Number.isNaN(valueAsNumber)) throw new ConfigEnvVarNotANumberServerError(logName, 'env var type is not a number', envVarName, value);
    return valueAsNumber;
  };

  private getOptionalEnvVarValueAsPathWithReadPermissions = (envVarName: string): string | undefined => {
    const value = this.getOptionalEnvVarValueAsString(envVarName);
    if(!value) return undefined;
    return ServerUtils.validateFilePathWithReadPermission(value);
  }

  // constructor() { }

  public initialize = (): void => {
    this.config = {
      dataPath: this.getOptionalEnvVarValueAsPathWithReadPermissions(EEnvVars.APIM_SERVER_DATA_PATH),
      expressServer: {
        rootDir: path.normalize(__dirname + '/../..'),
        port: this.getMandatoryEnvVarValueAsNumber(EEnvVars.APIM_SERVER_PORT),
        apiBase: OpenAPI.BASE,
        requestSizeLimit: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_REQUEST_SIZE_LIMIT),
        serverSecret: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_SECRET),
        enableOpenApiResponseValidation: this.getOptionalEnvVarValueAsBoolean(EEnvVars.APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION, true),
      },
      mongoDB: {
        mongoConnectionString: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_MONGO_CONNECTION_STRING),
        serverMongoDatabaseName: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_MONGO_DB)
      },
      serverLogger: {
        appId: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_LOGGER_APP_ID),
        level: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_LOGGER_LOG_LEVEL),
      },
      rootUser: {
        userId: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_ROOT_USER),
        password: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_ROOT_USER_PWD)
      },
      monitorConfig: {
        connectionTestInterval_secs: 60
      }
    };
  }

  public logConfig = (): void => {
    const funcName = 'logConfig';
    const logName = `${ServerConfig.name}.${funcName}()`;
    // printEnv( (s: any) => {
    //   ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'env variable', details: s }));
    // });
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'config', details: this.config }));
  }

  public getConfig = (): TServerConfig => {
    return this.config;
  };

  public getMongoDBConfig = (): TMongoDBConfig => {
    return this.config.mongoDB;
  }

  public getServerLoggerConfig = (): TServerLoggerConfig => {
    if(this.config && this.config.serverLogger) return this.config.serverLogger;
    else return ServerConfig.DefaultServerLoggerConfig;
  }

  public getExpressServerConfig = (): TExpressServerConfig => {
    return this.config.expressServer;
  }

  public getRootUserConfig = (): TRootUserConfig => {
    return this.config.rootUser;
  }

  public getMonitorConfig = (): TMonitorConfig => {
    return this.config.monitorConfig;
  }
}

export default new ServerConfig();