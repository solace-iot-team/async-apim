import { APSConnectorClientConfig } from '@solace-iot-team/apim-server-openapi-browser';
import { Mutex, MutexInterface } from 'async-mutex';
import { APClientConnectorOpenApi } from './APClientConnectorOpenApi';

export type APClientConnectorRawResult = {
  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly body: any;
}

class APClientConnectorRawError extends Error {
  apError: APClientConnectorRawResult;
  constructor(result: APClientConnectorRawResult, message: string) {
    super(message);
    this.apError = { ...result };
  }
}

export class APClientConnectorRaw {
  private static componentName = 'APClientConnectorRaw';
  // private static connectorClientConfig: APSConnectorClientConfig;
  private static baseUrl: string;
  private static basePath: string | undefined = undefined;
  private static aboutPath: string = 'about.json';
  private static mutex = new Mutex();
  private static mutexReleaser: MutexInterface.Releaser;

  private static getUrl = (path?: string): string => {
    if(path) return `${APClientConnectorRaw.baseUrl}/${path}`;
    return APClientConnectorRaw.baseUrl;
  }

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
    // APClientConnectorRaw.baseUrl = `${connectorClientConfig.protocol}://${connectorClientConfig.host}:${connectorClientConfig.port}`;
    APClientConnectorRaw.baseUrl = APClientConnectorOpenApi.constructBaseUrl(connectorClientConfig);
    console.log(`${logName}: APClientConnectorRaw.baseUrl = ${APClientConnectorRaw.baseUrl}`);
  }

  public static unInitialize = () => {
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
    console.log(`${logName}: APClientConnectorRaw.basePath = ${APClientConnectorRaw.basePath}`);
    // console.log(`${logName}: APClientConnectorRaw.getUrl(APClientConnectorRaw.basePath) = ${APClientConnectorRaw.getUrl(APClientConnectorRaw.basePath)}`);
    let response, responseBody: any;
    try {
      // const path: string = APClientConnectorRaw.basePath ? APClientConnectorRaw.basePath : '';
      response = await window.fetch(APClientConnectorRaw.getUrl(APClientConnectorRaw.basePath));
      responseBody = await APClientConnectorRaw.getResponseJson(response);
      if(!response.ok) APClientConnectorRaw.handleError(logName, response, responseBody);
      return responseBody;
    } catch (e) {
      throw e;
    }
  }
}
