import { APSConnectorClientConfig } from '@solace-iot-team/apim-server-openapi-browser';
import { Mutex, MutexInterface } from 'async-mutex';
import { APClientConnectorOpenApi } from './APClientConnectorOpenApi';
import { APTimeoutError } from './APError';
import { fetchWithTimeout } from './APFetch';

export type APClientConnectorRawResult = {
  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly body: any;
}

export class APClientConnectorRawError extends Error {
  apError: APClientConnectorRawResult;
  constructor(result: APClientConnectorRawResult, message: string) {
    super(message);
    this.apError = { ...result };
  }
}

export class APClientConnectorRaw {
  private static componentName = 'APClientConnectorRaw';
  private static baseUrl: string;
  private static basePath: string;
  private static mutex = new Mutex();
  private static mutexReleaser: MutexInterface.Releaser;

  private static getResponseJson = async(response: any): Promise<any> => {
    let responseText = await response.text();
    let responseJson: any;
    try {
      responseJson = JSON.parse(responseText);
    } catch(e) {
      responseJson = {responseText: responseText}
    }
    return responseJson;
  }

  private static handleError = (logName: string, response: any, body: any) => {
    let result: APClientConnectorRawResult = {
      url: response.url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: body
    }
    const error: APClientConnectorRawError = new APClientConnectorRawError(result, `${logName}`);
    APClientConnectorRaw.logError(error);
    throw error;
  }

  public static initialize = async (connectorClientConfig: APSConnectorClientConfig) => {
    const funcName = 'initialize';
    const logName= `${APClientConnectorRaw.componentName}.${funcName}()`;

    APClientConnectorRaw.mutexReleaser = await APClientConnectorRaw.mutex.acquire();
    APClientConnectorRaw.baseUrl = APClientConnectorOpenApi.constructBaseUrl(connectorClientConfig);
    console.log(`${logName}: APClientConnectorRaw.baseUrl = ${APClientConnectorRaw.baseUrl}`);
    APClientConnectorRaw.basePath = APClientConnectorOpenApi.constructOpenApiBase(connectorClientConfig);
    console.log(`${logName}: APClientConnectorRaw.basePath = ${APClientConnectorRaw.basePath}`);
  }

  public static unInitialize = async (): Promise<void> => {
    APClientConnectorRaw.mutexReleaser();
  }

  public static logError = (e: any): void => {
    const aPClientConnectorRawRawError: APClientConnectorRawError = e;
    if(aPClientConnectorRawRawError.apError) {
      console.error(`>>>${APClientConnectorRaw.componentName}: ${JSON.stringify(aPClientConnectorRawRawError.apError)}`);
    }
    console.error(`>>>${APClientConnectorRaw.componentName}: ${JSON.stringify(e)}`);
  }

  public static getBasePath = async (): Promise<any> => {    
    const funcName = 'getBasePath';
    const logName= `${APClientConnectorRaw.componentName}.${funcName}()`;
    const timeout_ms: number = 2000;
    console.log(`${logName}: APClientConnectorRaw.basePath = ${APClientConnectorRaw.basePath}`);
    let response, responseBody: any;
    try {
      try {
        response = await fetchWithTimeout(APClientConnectorRaw.basePath, timeout_ms);
      } catch (e: any) {
        if(e.name === 'AbortError') {
          throw new APTimeoutError(logName, "fetch timeout", { url: APClientConnectorRaw.basePath, timeout_ms: timeout_ms});
        } else throw e;
      }
      responseBody = await APClientConnectorRaw.getResponseJson(response);
      if(!response.ok) APClientConnectorRaw.handleError(logName, response, responseBody);
      return responseBody;
    } catch (e) {
      throw e;
    }
  }
}
