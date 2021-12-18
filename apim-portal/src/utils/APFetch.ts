
import base64 from 'base-64';

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
  
}

