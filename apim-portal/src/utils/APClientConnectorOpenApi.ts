
import { OpenAPI, ApiError } from '@solace-iot-team/platform-api-openapi-client-fe';
import { APSConnectorClientConfig } from '@solace-iot-team/apim-server-openapi-browser';

export class APClientConnectorOpenApi {
  private static orgSettings?: {
    config: APSConnectorClientConfig
    isInitialized: boolean
  };
  private static config: APSConnectorClientConfig;  
  private static isInitialized: boolean = false;

  public static initialize = (config: APSConnectorClientConfig) => {
    APClientConnectorOpenApi.config = (JSON.parse(JSON.stringify(config)));
    OpenAPI.BASE = `${APClientConnectorOpenApi.config.protocol}://${APClientConnectorOpenApi.config.host}:${APClientConnectorOpenApi.config.port}/${APClientConnectorOpenApi.config.apiVersion}`;
    OpenAPI.USERNAME = APClientConnectorOpenApi.config.serviceUser;
    OpenAPI.PASSWORD = APClientConnectorOpenApi.config.serviceUserPwd;
    APClientConnectorOpenApi.isInitialized = true;
  }

  public static uninitialize = () => {
    APClientConnectorOpenApi.isInitialized = false;
  }

  public static tmpInitialize = (tmpConfig: APSConnectorClientConfig) => {
    if(APClientConnectorOpenApi.isInitialized) {
      APClientConnectorOpenApi.orgSettings = {
        config: JSON.parse(JSON.stringify(APClientConnectorOpenApi.config)),
        isInitialized: true
      }
    }
    APClientConnectorOpenApi.initialize(tmpConfig);
  }

  public static tmpUninitialize = () => {
    if(APClientConnectorOpenApi.orgSettings) {
      APClientConnectorOpenApi.initialize(APClientConnectorOpenApi.orgSettings.config);
    } else {
      APClientConnectorOpenApi.uninitialize();
    }
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


