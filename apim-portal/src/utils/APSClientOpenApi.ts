
import { OpenAPI as APSOpenAPI, ApiError as APSApiError, EAPSClientProtocol } from '@solace-iot-team/apim-server-openapi-browser';

export type TAPSClientOpenApiConfig = {
  apsServerUrl?: URL,
  // protocol?: EAPSClientProtocol,
  // host?: string,
  // port?: number,
  // user: string,
  // pwd: string
}

// exports.OpenAPI = {
//   BASE: '/apim-server/v1',
//   VERSION: '0.0.4',
//   WITH_CREDENTIALS: false,
//   TOKEN: undefined,
//   USERNAME: undefined,
//   PASSWORD: undefined,
//   HEADERS: undefined,
// };


export class APSClientOpenApi {
  private static isInitialized: boolean = false;
  private static config: TAPSClientOpenApiConfig;

  public static initialize = (config: TAPSClientOpenApiConfig) => {
    // const funcName = 'initialize';
    // const logName = `${APSClientOpenApi.name}.${funcName}()`;
    APSClientOpenApi.config = (JSON.parse(JSON.stringify(config)));
    APSClientOpenApi.isInitialized = true;
    APSClientOpenApi.set();
  }

  public static set = (): void => {
    const funcName = 'set';
    const logName = `${APSClientOpenApi.name}.${funcName}()`;
    if (!APSClientOpenApi.isInitialized) throw new Error(`${logName}: not initialized`);

    if(APSClientOpenApi.config.apsServerUrl) {
      const base: URL = new URL(APSOpenAPI.BASE, APSClientOpenApi.config.apsServerUrl.toString());
      APSOpenAPI.BASE = base.toString();
    }
    
    // APSOpenAPI.USERNAME = APSClientOpenApi.config.user;
    // APSOpenAPI.PASSWORD = APSClientOpenApi.config.pwd;
    // VERSION: string;
    // WITH_CREDENTIALS: boolean;
    // TOKEN?: string | Resolver<string>;
    // HEADERS?: Headers | Resolver<Headers>;
    console.log(`${logName}: APSOpenAPI = ${JSON.stringify(APSOpenAPI, null, 2)}`);
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


