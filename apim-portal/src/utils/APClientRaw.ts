import { APSConnectorClientConfig } from '@solace-iot-team/apim-server-openapi-browser';
import { Mutex, MutexInterface } from 'async-mutex';
import { APClientConnectorOpenApi } from './APClientConnectorOpenApi';
import { APTimeoutError } from './APError';
import { APFetch, APFetchResult } from './APFetch';
import { APSClientOpenApi } from './APSClientOpenApi';

const FetchTimeout_ms: number = 500;

export type APClientRawResult = {
  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly body: any;
}

export class APClientRawError extends Error {
  logName: string;
  apError: APClientRawResult;
  constructor(logName: string, result: APClientRawResult, message: string) {
    super(message);
    this.logName = logName;
    this.apError = { ...result };
  }
}
export class APClientRaw {
  public static logError = (e: any): void => {
    const apClientRawRawError: APClientRawError = e;
    if(apClientRawRawError.apError) {
      console.error(`${apClientRawRawError.logName}: ${JSON.stringify(apClientRawRawError.apError)}`);
    }
    console.error(`${apClientRawRawError.logName}: ${JSON.stringify(e)}`);
  }
  public static handleError = (logName: string, response: any, body: any) => {
    let result: APClientRawResult = {
      url: response.url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: body
    }
    const error: APClientRawError = new APClientRawError(logName, result, `${logName}`);
    APClientRaw.logError(error);
    throw error;
  }
}
export class APClientServerRaw {
  private static componentName = 'APClientServerRaw';

  public static getBasePath = (): string => {
    return APSClientOpenApi.getOpenApiInfo().base;
  }

  public static httpGET_BasePath = async (): Promise<any> => {    
    const funcName = 'httpGET_BasePath';
    const logName= `${APClientServerRaw.componentName}.${funcName}()`;
    const basePath = APClientServerRaw.getBasePath();
    // console.log(`${logName}: basePath = ${basePath}`);
    let response: Response;
    let responseBody: any;
    try {
      try {
        response = await APFetch.fetchWithTimeoutAndRandomBasicAuth(basePath, FetchTimeout_ms);
      } catch (e: any) {
        if(e.name === 'AbortError') {
          throw new APTimeoutError(logName, "fetch timeout", { url: basePath, timeout_ms: FetchTimeout_ms});
        } else throw e;
      }
      const result: APFetchResult = await APFetch.getFetchResult(response);
      responseBody = result.body;
      if(!response.ok) APClientRaw.handleError(logName, response, responseBody);
      return responseBody;
    } catch (e) {
      throw e;
    }
  }
}

export class APClientConnectorRaw {
  private static componentName = 'APClientConnectorRaw';
  private static baseUrl: string;
  private static basePath: string;
  private static mutex = new Mutex();
  private static mutexReleaser: MutexInterface.Releaser;

  public static initialize = async (connectorClientConfig: APSConnectorClientConfig) => {
    const funcName = 'initialize';
    const logName= `${APClientConnectorRaw.componentName}.${funcName}()`;

    APClientConnectorRaw.mutexReleaser = await APClientConnectorRaw.mutex.acquire();
    APClientConnectorRaw.baseUrl = APClientConnectorOpenApi.constructBaseUrl(connectorClientConfig);
    // console.log(`${logName}: APClientConnectorRaw.baseUrl = ${APClientConnectorRaw.baseUrl}`);
    APClientConnectorRaw.basePath = APClientConnectorOpenApi.constructOpenApiBase(connectorClientConfig);
    // console.log(`${logName}: APClientConnectorRaw.basePath = ${APClientConnectorRaw.basePath}`);
  }

  public static unInitialize = async (): Promise<void> => {
    APClientConnectorRaw.mutexReleaser();
  }

  public static getBasePath = (): string => {
    return APClientConnectorRaw.basePath;
  }
  public static httpGET_BasePath = async (): Promise<any> => {    
    const funcName = 'httpGET_BasePath';
    const logName= `${APClientConnectorRaw.componentName}.${funcName}()`;
    let response: Response;
    let responseBody: any;
    try {
      try {
        response = await APFetch.fetchWithTimeoutAndRandomBasicAuth(APClientConnectorRaw.basePath, FetchTimeout_ms);
      } catch (e: any) {
        if(e.name === 'AbortError') {
          throw new APTimeoutError(logName, "fetch timeout", { url: APClientConnectorRaw.basePath, timeout_ms: FetchTimeout_ms});
        } else throw e;
      }
      const result: APFetchResult = await APFetch.getFetchResult(response);
      responseBody = result.body;
      if(!response.ok) APClientRaw.handleError(logName, response, responseBody);
      return responseBody;
    } catch (e) {
      throw e;
    }
  }
}
