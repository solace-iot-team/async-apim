
import { OpenAPI, ApiError } from '@solace-iot-team/apim-connector-openapi-browser';
import { APSConnectorClientConfig, APSLocationConfigExternal, APSLocationConfigInternalProxy } from '@solace-iot-team/apim-server-openapi-browser';
import { Mutex, MutexInterface } from "async-mutex";

export type APConnectorClientOpenApiInfo = {
  base: string,
  versionStr: string
}

export class APClientConnectorOpenApi {
  private static componentName = 'APClientConnectorOpenApi';
  private static orgSettings?: {
    config: APSConnectorClientConfig
    isInitialized: boolean
  };
  private static config: APSConnectorClientConfig;  
  private static isInitialized: boolean = false;
  private static mutex = new Mutex();
  private static mutexReleaser: MutexInterface.Releaser;

  public static constructBaseUrl = (config: APSConnectorClientConfig): string => {
    const funcName: string = `constructBaseUrl`;
    const logName: string = `${APClientConnectorOpenApi.componentName}.${funcName}()`;
    let url: string = '';
    if(config.locationConfig.configType === APSLocationConfigExternal.configType.EXTERNAL) {
      url = `${config.locationConfig.protocol}://${config.locationConfig.host}:${config.locationConfig.port}`;
    } else if(config.locationConfig.configType === APSLocationConfigInternalProxy.configType.INTERNAL_PROXY) {
      // no url
    } else {
      throw new Error(`${logName}: unhandled config.locationConfig.configType in config = ${JSON.stringify(config)}`);
    }
    return url;
  }
  public static constructOpenApiBase = (config: APSConnectorClientConfig): string => {
    const funcName: string = `constructOpenApiBase`;
    const logName: string = `${APClientConnectorOpenApi.componentName}.${funcName}()`;
    // console.log(`${logName}: config = ${JSON.stringify(config, null, 2)}`);
    const url: string = APClientConnectorOpenApi.constructBaseUrl(config);
    let base: string = config.apiVersion;
    if(config.basePath) {
      base = `${url}/${config.basePath}/${config.apiVersion}`;
    } else {
      base = `${url}/${config.apiVersion}`;
    }
    // console.log(`${logName}: base = ${JSON.stringify(base, null, 2)}`);
    return base;
  }
  public static initialize = (config: APSConnectorClientConfig) => {
    const funcName: string = `initialize`;
    const logName: string = `${APClientConnectorOpenApi.componentName}.${funcName}()`  
    APClientConnectorOpenApi.config = (JSON.parse(JSON.stringify(config)));
    OpenAPI.BASE = APClientConnectorOpenApi.constructOpenApiBase(APClientConnectorOpenApi.config);
    OpenAPI.USERNAME = APClientConnectorOpenApi.config.serviceUser;
    OpenAPI.PASSWORD = APClientConnectorOpenApi.config.serviceUserPwd;
    APClientConnectorOpenApi.isInitialized = true;
    // console.log(`${logName}: OpenAPI = ${JSON.stringify(OpenAPI, null, 2)}`);
  } 

  public static uninitialize = () => {
    APClientConnectorOpenApi.isInitialized = false;
  }

  public static tmpInitialize = async (tmpConfig: APSConnectorClientConfig) => {
    const funcName: string = `tmpInitialize`;
    const logName: string = `${APClientConnectorOpenApi.componentName}.${funcName}()`  
    APClientConnectorOpenApi.mutexReleaser = await APClientConnectorOpenApi.mutex.acquire();
    if(APClientConnectorOpenApi.isInitialized) {
      APClientConnectorOpenApi.orgSettings = {
        config: JSON.parse(JSON.stringify(APClientConnectorOpenApi.config)),
        isInitialized: true
      }
    }
    APClientConnectorOpenApi.initialize(tmpConfig);
    // console.log(`${logName}: OpenAPI=${JSON.stringify(OpenAPI, null, 2)}`);
  }

  public static tmpUninitialize = async () => {
    if(APClientConnectorOpenApi.orgSettings) {
      APClientConnectorOpenApi.initialize(APClientConnectorOpenApi.orgSettings.config);
    } else {
      APClientConnectorOpenApi.uninitialize();
    }
    APClientConnectorOpenApi.mutexReleaser();
  }

  public static getOpenApiInfo = (): APConnectorClientOpenApiInfo => {
    return {
      base: OpenAPI.BASE,
      versionStr: OpenAPI.VERSION
    }
  }

  public static getOpenApi = (): any => {
    return OpenAPI;
  }

  public static isInstanceOfApiError(error: any): boolean {
    let apiError: ApiError = error;
    if(apiError.status === undefined) return false;
    if(apiError.statusText === undefined) return false;
    if(apiError.url === undefined) return false;
    if(apiError.body === undefined) return false; 
    return true;
  }

  public static getErrorAsString = (e: any) => {
    let _e: string;
    if(APClientConnectorOpenApi.isInstanceOfApiError(e)) _e = JSON.stringify(e, null, 2);
    else _e = e;
    return _e
  }

  public static getErrorMessage = (e: any): string => {
    if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
      let apiError: ApiError = e;
      let _m: string;
      _m = apiError.body.message
      if(_m) return _m;
      _m = apiError.body.errors[0].message;
      if(_m) return _m;
      return 'unknown api error';
    }
    else return e;
  }

  public static logError = (logName: string, e: any): void => {
    console.error(`${logName}:\n${APClientConnectorOpenApi.getErrorAsString(e)}`);
  }
}

export enum EConnectorWebhookAuthenticationMethod {
  BASIC = 'Basic',
  HEADER = 'Header'
}

export type TConnectorWebhookBasicAuthentication = {
  username: string,
  password: string
}

export type TConnectorWebhookHeaderAuthentication = {
  headerName: string,
  headerValue: string
}
