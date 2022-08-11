
import base64 from 'base-64';
import { ApiError } from '../_generated/@solace-iot-team/apim-server-openapi-browser';
import { APSClientOpenApi } from './APSClientOpenApi';

export enum EAPFetchResultBodyType {
  JSON = 'JSON',
  TEXT = 'TEXT'
}

export type APFetchResult = {
  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly bodyType: EAPFetchResultBodyType;
  readonly body: any;
}

export class APFetch {

  private static getResponseBody = async(response: Response): Promise<any> => {
    let responseText = await response.text();
    let body: any;
    try {
      body = JSON.parse(responseText);
    } catch(e) {
      body = {_apResponseText: responseText}
    }
    return body;
  }

  public static getFetchResult = async(response: Response): Promise<APFetchResult> => {
    const body = await APFetch.getResponseBody(response);
    return {
      url: response.url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      bodyType: ( !body._apResponseText ? EAPFetchResultBodyType.JSON : EAPFetchResultBodyType.TEXT),
      body: body
    };
  }

  public static fetchWithTimeout = async(resource: string, timeout_ms: number): Promise<Response> =>  {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout_ms);
    const response = await window.fetch(resource, {
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  }

  /**
   * Interim helper function until sec is fully implemented
   */
  public static fetchSec = async({ method, resource }:{
    method: string;
    resource: string;
  }): Promise<Response> =>  {
    // function fetch(input: RequestInfo, init?: RequestInit | undefined): Promise<Response>
    // (method) fetch(input: RequestInfo, init?: RequestInit | undefined): Promise<Response>
    const init: RequestInit = {
      method: method,
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
    }
    const response: Response = await window.fetch(resource, init);
    return response;
  }

  public static fetchWithTimeoutAndRandomBasicAuth = async(resource: string, timeout_ms: number): Promise<Response> =>  {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout_ms);
  
    const headers = new Headers({
      "Authorization": `Basic ${base64.encode('u:p')}`
    });
    const response = await window.fetch(resource, {
      headers: headers,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  }
  
  public static GETConnector_ZipContents = async({ connectorUrlPath }:{
    connectorUrlPath: string;
  }): Promise<Blob> => {
    const funcName = 'GETConnector_ZipContents';
    const logName = `${APFetch.name}.${funcName}()`;

    const connectorOpenApiConfig: any = await APSClientOpenApi.getConnectorClientOpenApiConfig();
    // console.warn(`${logName}: connectorOpenApiConfig = ${JSON.stringify(connectorOpenApiConfig)}`);
    // throw new Error(`${logName}: check the connectorOpenApiConfig`);
    // {"BASE":"http://localhost:3003/apim-server/v1/connectorProxy/v1","VERSION":"0.11.0","WITH_CREDENTIALS":true,"TOKEN":"xxx"

    const base = connectorOpenApiConfig.BASE + '/';
    const url: URL = new URL(connectorUrlPath, base);
    const headers = new Headers({
      "Authorization": `Bearer ${connectorOpenApiConfig.TOKEN}`,
      "Content-Type": 'application/json',
      "accept": "application/zip",
    });
    const requestInit: RequestInit = {
      method: 'GET',
      credentials: 'include',
      headers: headers,
    };
    const response = await window.fetch( url.toString(), requestInit);
    if(!response.ok) {
      throw new ApiError(response, logName);
    }
    const zipContents: Blob = await response.blob();
    return zipContents;

  }
}

