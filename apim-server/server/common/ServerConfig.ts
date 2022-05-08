import path from 'path';
import { OpenAPI } from '../../src/@solace-iot-team/apim-server-openapi-node';
import { ConfigEnvVarNotANumberServerError, ConfigEnvVarValueServerError, ConfigInvalidEnvVarValueFromListServerError, ConfigMissingEnvVarServerError, ServerError } from './ServerError';

import { EServerStatusCodes, ServerLogger } from "./ServerLogger";
import { ServerUtils } from './ServerUtils';

export enum EAuthConfigType {
  UNDEFINED = "UNDEFINED",
  INTERNAL = "internal",
  OIDC = "oidc",
}
const ValidEnvAuthConfigType = {
  INTERNAL: EAuthConfigType.INTERNAL,
  OIDC: EAuthConfigType.OIDC,
}
export type TAuthConfigUndefined = {
  type: EAuthConfigType.UNDEFINED;
}
export type TAuthConfigOidc = {
  type: EAuthConfigType.OIDC;
}
export type TAuthConfigInternal = {
  type: EAuthConfigType.INTERNAL;
  authJwtSecret: string;
  authJwtExpirySecs: number;
  refreshJwtSecret: string;
  refreshJwtExpirySecs: number;
}
export type TAuthConfig = TAuthConfigInternal | TAuthConfigOidc | TAuthConfigUndefined;

export type TExpressServerConfig = {
  rootDir: string;
  port: number;
  apiBase: string;
  requestSizeLimit: string;
  enableOpenApiResponseValidation: boolean;
  cookieSecret: string;
  authConfig: TAuthConfig;
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
  APIM_SERVER_ROOT_USER = 'APIM_SERVER_ROOT_USER',
  APIM_SERVER_ROOT_USER_PWD = 'APIM_SERVER_ROOT_USER_PWD',
  APIM_SERVER_DATA_PATH = 'APIM_SERVER_DATA_PATH',
  APIM_SERVER_COOKIE_SECRET = 'APIM_SERVER_COOKIE_SECRET',
  // auth
  APIM_SERVER_AUTH_TYPE = "APIM_SERVER_AUTH_TYPE",
  APIM_SERVER_AUTH_INTERNAL_JWT_SECRET = "APIM_SERVER_AUTH_INTERNAL_JWT_SECRET",
  APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS = "APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS",
  APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_SECRET = "APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_SECRET",
  APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS = "APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS",
}

export class ServerConfig {
  private config: TServerConfig;

  private static DefaultServerLoggerConfig: TServerLoggerConfig = {
    appId: 'apim-server',
    level: 'trace'
  }

  private getMandatoryEnvVarValueAsString_From_List = (envVarName: string, list: Array<string>): string => {
    const funcName = 'getMandatoryEnvVarValueAsString_From_List';
    const logName = `${ServerConfig.name}.${funcName}()`;
    const value: string | undefined = process.env[envVarName];
    if (!value) throw new ConfigMissingEnvVarServerError(logName, 'mandatory env var missing', envVarName);    
    if(!list.includes(value.toLowerCase())) throw new ConfigInvalidEnvVarValueFromListServerError(logName, 'invalid value', envVarName, value, list);    
    return value.toLowerCase();
  };

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

  private initializeAuthConfig = (): TAuthConfig => {
    const funcName = 'initializeAuthConfig';
    const logName = `${ServerConfig.name}.${funcName}()`;

    let authConfig: TAuthConfig = { type: EAuthConfigType.UNDEFINED };
    const authType: EAuthConfigType = this.getMandatoryEnvVarValueAsString_From_List(EEnvVars.APIM_SERVER_AUTH_TYPE, Object.values(ValidEnvAuthConfigType)) as EAuthConfigType;
    switch(authType) {
      case EAuthConfigType.UNDEFINED:
        // should never get here
        throw new ConfigInvalidEnvVarValueFromListServerError(logName, 'invalid value', EEnvVars.APIM_SERVER_AUTH_TYPE, EAuthConfigType.UNDEFINED, Object.values(ValidEnvAuthConfigType));    
      case EAuthConfigType.INTERNAL:
        const internalAuthConfig: TAuthConfigInternal = {
          type: EAuthConfigType.INTERNAL,
          authJwtSecret: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_AUTH_INTERNAL_JWT_SECRET),
          authJwtExpirySecs: this.getMandatoryEnvVarValueAsNumber(EEnvVars.APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS),
          refreshJwtSecret: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_SECRET),
          refreshJwtExpirySecs: this.getMandatoryEnvVarValueAsNumber(EEnvVars.APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS),      
        };
        // validate values
        if(internalAuthConfig.refreshJwtExpirySecs < internalAuthConfig.authJwtExpirySecs) {
          throw new ConfigEnvVarValueServerError(
            logName, 
            `${EEnvVars.APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS}=${internalAuthConfig.refreshJwtExpirySecs} must not be less than ${EEnvVars.APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS}=${internalAuthConfig.authJwtExpirySecs}`, 
            EEnvVars.APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS, String(internalAuthConfig.authJwtExpirySecs)
          );
        }
        return internalAuthConfig;
      case EAuthConfigType.OIDC:
        throw new ServerError(logName, 'currently not implemented');
      default:
        ServerUtils.assertNever(logName, authType);
    }
    return authConfig;
  }

  public initialize = (): void => {
    const funcName = 'initialize';
    const logName = `${ServerConfig.name}.${funcName}()`;
    try {
      this.config = {
        dataPath: this.getOptionalEnvVarValueAsPathWithReadPermissions(EEnvVars.APIM_SERVER_DATA_PATH),
        expressServer: {
          rootDir: path.normalize(__dirname + '/../..'),
          port: this.getMandatoryEnvVarValueAsNumber(EEnvVars.APIM_SERVER_PORT),
          apiBase: OpenAPI.BASE,
          requestSizeLimit: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_REQUEST_SIZE_LIMIT),
          enableOpenApiResponseValidation: this.getOptionalEnvVarValueAsBoolean(EEnvVars.APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION, true),
          cookieSecret: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_COOKIE_SECRET),
          authConfig: this.initializeAuthConfig(),
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
    } catch(e) {
      if(e instanceof ServerError) {
        const se: ServerError = e as ServerError;
        ServerLogger.fatal(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING, message: 'env', details: se.toObject() }));
      }
      throw e;
    }
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

  public getAuthConfig = (): TAuthConfig => {
    return this.config.expressServer.authConfig;
  }

  public getRootUserConfig = (): TRootUserConfig => {
    return this.config.rootUser;
  }

  public getMonitorConfig = (): TMonitorConfig => {
    return this.config.monitorConfig;
  }
}

export default new ServerConfig();