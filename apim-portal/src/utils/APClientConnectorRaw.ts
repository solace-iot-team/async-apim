import { APSConnectorClientConfig } from '@solace-iot-team/apim-server-openapi-browser';

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
  private static connectorClientConfig: APSConnectorClientConfig;
  private static baseUrl: string;
  private static basePath: string | undefined = undefined;
  private static aboutPath: string = 'about.json';

  private static getUrl = (path: string): string => {
    return `${APClientConnectorRaw.baseUrl}/${path}`;
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

  public static initialize = (connectorClientConfig: APSConnectorClientConfig) => {
    APClientConnectorRaw.connectorClientConfig = (JSON.parse(JSON.stringify(connectorClientConfig)));
    APClientConnectorRaw.baseUrl = `${connectorClientConfig.protocol}://${connectorClientConfig.host}:${connectorClientConfig.port}`;
  }

  public static logError = (e: any): void => {
    const aPClientConnectorRawRawError: APClientConnectorRawError = e;
    if(aPClientConnectorRawRawError.apError) {
      console.error(`>>>${APClientConnectorRaw.name}: ${JSON.stringify(aPClientConnectorRawRawError.apError)}`);
    }
    console.error(`>>>${APClientConnectorRaw.name}: ${JSON.stringify(e)}`);
  }

  public static getBasePath = async (): Promise<any> => {    
    const funcName = 'getBasePath';
    const logName= `${APClientConnectorRaw.name}.${funcName}()`;
    // console.log(`${logName}: APClientConnectorRaw.basePath = ${APClientConnectorRaw.basePath}`);
    // console.log(`${logName}: APClientConnectorRaw.getUrl(APClientConnectorRaw.basePath) = ${APClientConnectorRaw.getUrl(APClientConnectorRaw.basePath)}`);
    let response, responseBody: any;
    try {
      const path: string = APClientConnectorRaw.basePath ? APClientConnectorRaw.basePath : '';
      response = await window.fetch(APClientConnectorRaw.getUrl(path));
      responseBody = await APClientConnectorRaw.getResponseJson(response);
      if(!response.ok) APClientConnectorRaw.handleError(logName, response, responseBody);
      return responseBody;
    } catch (e) {
      throw e;
    }
  }

  public static getAbout = async(): Promise<any> => {
    const funcName = 'getAbout';
    const logName= `${APClientConnectorRaw.name}.${funcName}()`;
    let response, responseBody: any;
    try {
      const path: string = APClientConnectorRaw.basePath ? (APClientConnectorRaw.basePath + '/' + APClientConnectorRaw.aboutPath) : APClientConnectorRaw.aboutPath;
      response = await window.fetch(APClientConnectorRaw.getUrl(path));
      responseBody = await APClientConnectorRaw.getResponseJson(response);
      if(!response.ok) APClientConnectorRaw.handleError(logName, response, responseBody);
      return responseBody;
    } catch (e) {
      throw e;
    }
  }
}
