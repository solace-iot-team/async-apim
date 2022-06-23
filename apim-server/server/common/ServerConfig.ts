import path from 'path';
import { APSConnector, APSLocationConfigExternal, APSLocationConfigInternalProxy, OpenAPI } from '../../src/@solace-iot-team/apim-server-openapi-node';
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
export type TAuthConfigOidc = {
  type: EAuthConfigType.OIDC;
}
export type TAuthConfigInternal = {
  type: EAuthConfigType.INTERNAL;
  authJwtSecret: string;
  authJwtExpirySecs: number;
  refreshJwtSecret: string;
  refreshJwtExpirySecs: number;
  connectorAuth: {
    issuer: string;
    audience: string;
    secret: string;
  }
}
export type TAuthConfig = TAuthConfigInternal | TAuthConfigOidc;

export type TConnectorProxyConfig = {
  // APIM_SERVER_INTERNAL_CONNECTOR_API_URL
  internalConnectorApiUrl: string;
}
export type TExpressServerConfig = {
  rootDir: string;
  port: number;
  apiBase: string;
  requestSizeLimit: string;
  enableOpenApiResponseValidation: boolean;
  cookieSecret: string;
  authConfig: TAuthConfig;
  connectorProxyConfig: TConnectorProxyConfig;
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
  appId: string;
  dataPath?: string;
  expressServer: TExpressServerConfig;
  mongoDB: TMongoDBConfig;
  serverLogger: TServerLoggerConfig;
  rootUser: TRootUserConfig;
  monitorConfig: TMonitorConfig;
  connectorConfig?: APSConnector;
};

enum EEnvVars {
  APIM_SERVER_APP_ID = 'APIM_SERVER_APP_ID',
  APIM_SERVER_PORT = 'APIM_SERVER_PORT',
  APIM_SERVER_MONGO_CONNECTION_STRING = 'APIM_SERVER_MONGO_CONNECTION_STRING',
  APIM_SERVER_MONGO_DB = 'APIM_SERVER_MONGO_DB',
  APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION = 'APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION',
  APIM_SERVER_LOGGER_LOG_LEVEL= 'APIM_SERVER_LOGGER_LOG_LEVEL',
  APIM_SERVER_REQUEST_SIZE_LIMIT = 'APIM_SERVER_REQUEST_SIZE_LIMIT',
  APIM_SERVER_ROOT_USER = 'APIM_SERVER_ROOT_USER',
  APIM_SERVER_ROOT_USER_PWD = 'APIM_SERVER_ROOT_USER_PWD',
  APIM_SERVER_DATA_PATH = 'APIM_SERVER_DATA_PATH',
  APIM_SERVER_COOKIE_SECRET = 'APIM_SERVER_COOKIE_SECRET',
  // connector proxy
  APIM_SERVER_INTERNAL_CONNECTOR_API_URL = "APIM_SERVER_INTERNAL_CONNECTOR_API_URL",
  // auth
  APIM_SERVER_AUTH_TYPE = "APIM_SERVER_AUTH_TYPE",
  APIM_SERVER_AUTH_INTERNAL_JWT_SECRET = "APIM_SERVER_AUTH_INTERNAL_JWT_SECRET",
  APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS = "APIM_SERVER_AUTH_INTERNAL_JWT_EXPIRY_SECS",
  APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_SECRET = "APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_SECRET",
  APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS = "APIM_SERVER_AUTH_INTERNAL_REFRESH_JWT_EXPIRY_SECS",
  APIM_SERVER_CONNECTOR_AUTH_ISSUER="APIM_SERVER_CONNECTOR_AUTH_ISSUER",
  APIM_SERVER_CONNECTOR_AUTH_AUDIENCE="APIM_SERVER_CONNECTOR_AUTH_AUDIENCE",
  APIM_SERVER_CONNECTOR_AUTH_SECRET="APIM_SERVER_CONNECTOR_AUTH_SECRET",
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
          connectorAuth: {
            issuer: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_CONNECTOR_AUTH_ISSUER),
            audience: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_CONNECTOR_AUTH_AUDIENCE),
            secret: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_CONNECTOR_AUTH_SECRET)
          }
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
    // should never get here
    throw new ServerError(logName, "reading auth config from envs");
  }

  private initializeConnectorProxyConfigConfig = (): TConnectorProxyConfig => {
    return {
      internalConnectorApiUrl: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_INTERNAL_CONNECTOR_API_URL)
    };
  }

  public initialize = (): void => {
    const funcName = 'initialize';
    const logName = `${ServerConfig.name}.${funcName}()`;
    try {
      this.config = {
        appId: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_APP_ID),
        dataPath: this.getOptionalEnvVarValueAsPathWithReadPermissions(EEnvVars.APIM_SERVER_DATA_PATH),
        expressServer: {
          rootDir: path.normalize(__dirname + '/../..'),
          port: this.getMandatoryEnvVarValueAsNumber(EEnvVars.APIM_SERVER_PORT),
          apiBase: OpenAPI.BASE,
          requestSizeLimit: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_REQUEST_SIZE_LIMIT),
          enableOpenApiResponseValidation: this.getOptionalEnvVarValueAsBoolean(EEnvVars.APIM_SERVER_OPENAPI_ENABLE_RESPONSE_VALIDATION, true),
          cookieSecret: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_COOKIE_SECRET),
          authConfig: this.initializeAuthConfig(),
          connectorProxyConfig: this.initializeConnectorProxyConfigConfig(),
        },
        mongoDB: {
          mongoConnectionString: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_MONGO_CONNECTION_STRING),
          serverMongoDatabaseName: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_MONGO_DB)
        },
        serverLogger: {
          appId: this.getMandatoryEnvVarValueAsString(EEnvVars.APIM_SERVER_APP_ID),
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

  public setConnectorConfig = (apsConnector: APSConnector | undefined) => {
    this.config.connectorConfig = apsConnector;
  }

  public getConnectorConfig = (): APSConnector | undefined => {
    // const funcName = 'getConnectorConfig';
    // const logName = `${ServerConfig.name}.${funcName}()`;
    // if(this.config.connectorConfig === undefined) throw new ServerError(logName, 'this.config.connectorConfig === undefined');
    return this.config.connectorConfig;
  }

  public getActiveConnectorTarget = (): string => {
    const funcName = 'getActiveConnectorTarget';
    const logName = `${ServerConfig.name}.${funcName}()`;
    if(this.config.connectorConfig === undefined) throw new ServerError(logName, 'this.config.connectorConfig === undefined');
    const connectorLocationConfigType: APSLocationConfigExternal.configType | APSLocationConfigInternalProxy.configType = this.config.connectorConfig.connectorClientConfig.locationConfig.configType;
    switch(connectorLocationConfigType) {
      case APSLocationConfigExternal.configType.EXTERNAL:
        const apsLocationConfigExternal: APSLocationConfigExternal =  this.config.connectorConfig.connectorClientConfig.locationConfig as APSLocationConfigExternal;
        // http://18.184.18.52:3000/v1
        return `${apsLocationConfigExternal.protocol}://${apsLocationConfigExternal.host}:${apsLocationConfigExternal.port}/v1`;
      case APSLocationConfigInternalProxy.configType.INTERNAL_PROXY:
        // const apsLocationConfigInternalProxy: APSLocationConfigInternalProxy =  this.config.connectorConfig.connectorClientConfig.locationConfig as APSLocationConfigInternalProxy;
        return this.config.expressServer.connectorProxyConfig.internalConnectorApiUrl;
      default:
        ServerUtils.assertNever(logName, connectorLocationConfigType);
    }
    return 'undefined';
  }
}

export default new ServerConfig();