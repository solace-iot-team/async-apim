import { 
  OpenAPI as APSOpenAPI, 
  ApiError as APSApiError 
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { 
  OpenAPI as ConnectorOpenAPI, 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { Mutex } from "async-mutex";

export type APSClientOpenApiInfo = {
  base: string,
  versionStr: string
}

export type TAPSClientOpenApiConfig = {
  apsServerUrl?: URL,
}

export class APSClientOpenApi {
  private static componentName = 'APSClientOpenApi';
  private static isInitialized: boolean = false;
  private static config: TAPSClientOpenApiConfig;
  private static token: string;
  private static tokenMutex: Mutex = new Mutex();
  private static isTokenRefreshing: boolean = false;

  public static initialize = (config: TAPSClientOpenApiConfig) => {
    const configStr = JSON.stringify(config);
    if(configStr === '{}') APSClientOpenApi.config = {};
    else APSClientOpenApi.config = (JSON.parse(configStr));
    APSClientOpenApi.isInitialized = true;
    APSClientOpenApi.set();
  }

  public static setToken = (token: string | undefined) => {
    APSClientOpenApi.token = token !== undefined ? token : '***';
  }
  public static lockToken4Refresh = async() => {
    // const funcName = 'lockToken4Refresh';
    // const logName = `${APSClientOpenApi.componentName}.${funcName}()`;
    // console.log(`${logName}: starting: this.collectionMutex.isLocked()=${APSClientOpenApi.tokenMutex.isLocked()}`);
    APSClientOpenApi.isTokenRefreshing = true;
    await APSClientOpenApi.tokenMutex.acquire();
  }
  public static unlockToken4Refresh = async() => {
    APSClientOpenApi.isTokenRefreshing = false;
    APSClientOpenApi.tokenMutex.release();
  }
  private static wait4TokenUnlock = async() => {
    // const funcName = 'wait4TokenUnlock';
    // const logName = `${APSClientOpenApi.componentName}.${funcName}()`;
    // console.log(`${logName}: starting: this.collectionMutex.isLocked()=${APSClientOpenApi.tokenMutex.isLocked()}`);
    if(!APSClientOpenApi.isTokenRefreshing) {
      // console.log(`${logName}: APSClientOpenApi.isTokenRefreshing=${APSClientOpenApi.isTokenRefreshing}`);
      // alert(`${logName}: is this case working?`)
      const releaser = await APSClientOpenApi.tokenMutex.acquire();
      releaser();  
    }
    // console.log(`${logName}: done.`);
  }
  private static getToken = async(): Promise<string> => {
    // const funcName = 'getToken';
    // const logName = `${APSClientOpenApi.componentName}.${funcName}()`;
    // console.log(`${logName}: check token mutex`);
    await APSClientOpenApi.wait4TokenUnlock();
    return APSClientOpenApi.token;
  }

  public static set = (): void => {
    const funcName = 'set';
    const logName = `${APSClientOpenApi.componentName}.${funcName}()`;
    if(!APSClientOpenApi.isInitialized) throw new Error(`${logName}: not initialized`);
    if(APSClientOpenApi.config.apsServerUrl) {
      const base: URL = new URL(APSOpenAPI.BASE, APSClientOpenApi.config.apsServerUrl.toString());
      APSOpenAPI.BASE = base.toString();
    }
    APSOpenAPI.WITH_CREDENTIALS = true;
    APSOpenAPI.CREDENTIALS = "include";
    APSOpenAPI.TOKEN = async() => { return await APSClientOpenApi.getToken(); }
    // ConnectorOpenApi
    ConnectorOpenAPI.BASE = APSOpenAPI.BASE + '/connectorProxy' + ConnectorOpenAPI.BASE;
    ConnectorOpenAPI.USERNAME = undefined;
    ConnectorOpenAPI.PASSWORD = undefined;
    ConnectorOpenAPI.WITH_CREDENTIALS = true;
    // ConnectorOpenAPI.CREDENTIALS = "include";
    ConnectorOpenAPI.TOKEN = async() => { return await APSClientOpenApi.getToken(); }

    console.log(`${logName}: APSOpenAPI = ${JSON.stringify(APSOpenAPI, null, 2)}`);
    console.log(`${logName}: ConnectorOpenAPI = ${JSON.stringify(ConnectorOpenAPI, null, 2)}`);
  }

  public static getOpenApiInfo = (): APSClientOpenApiInfo => {
    const funcName = 'getOpenApiInfo';
    const logName = `${APSClientOpenApi.componentName}.${funcName}()`;
    if (!APSClientOpenApi.isInitialized) throw new Error(`${logName}: not initialized`);
    return {
      base: APSOpenAPI.BASE,
      versionStr: APSOpenAPI.VERSION
    }
  }

  public static isInstanceOfApiError(error: Error): boolean {
    return (error instanceof APSApiError);
  }

  public static getErrorAsString = (e: Error) => {
    let errString: string;
    if(APSClientOpenApi.isInstanceOfApiError(e)) errString = JSON.stringify(e, null, 2);
    else errString = `${e.name}: ${e.message}`;
    return errString;
  }

  public static getErrorMessage = (e: Error): string => {
    if(APSClientOpenApi.isInstanceOfApiError(e)) {
      const apiError: APSApiError = e as APSApiError;
      let _m: string;
      _m = apiError.body.message
      if(_m) return _m;
      _m = apiError.body.errors[0].message;
      if(_m) return _m;
      return 'unknown api error';
    }
    else return APSClientOpenApi.getErrorAsString(e);
  }

  public static logError = (logName: string, e: Error): void => {
    console.error(`${logName}:\n${APSClientOpenApi.getErrorAsString(e)}`);
  }
}


