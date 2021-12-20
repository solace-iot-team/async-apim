
import { OpenAPI as APSOpenAPI, ApiError as APSApiError } from '@solace-iot-team/apim-server-openapi-browser';

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

  public static initialize = (config: TAPSClientOpenApiConfig) => {
    const configStr = JSON.stringify(config);
    if(configStr === '{}') APSClientOpenApi.config = {};
    else APSClientOpenApi.config = (JSON.parse(configStr));
    APSClientOpenApi.isInitialized = true;
    APSClientOpenApi.set();
  }

  public static set = (): void => {
    const funcName = 'set';
    const logName = `${APSClientOpenApi.componentName}.${funcName}()`;
    if (!APSClientOpenApi.isInitialized) throw new Error(`${logName}: not initialized`);
    if(APSClientOpenApi.config.apsServerUrl) {
      const base: URL = new URL(APSOpenAPI.BASE, APSClientOpenApi.config.apsServerUrl.toString());
      APSOpenAPI.BASE = base.toString();
    }
    console.log(`${logName}: APSOpenAPI = ${JSON.stringify(APSOpenAPI, null, 2)}`);
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


