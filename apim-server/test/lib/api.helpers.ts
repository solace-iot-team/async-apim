
import { OpenAPI } from '../../src/@solace-iot-team/apim-server-openapi-node';

// export function isInstanceOfApiError(error: any): boolean {
//     let apiError: ApiError = error;
//     if(apiError.status === undefined) return false;
//     if(apiError.statusText === undefined) return false;
//     if(apiError.url === undefined) return false;
//     if(apiError.message === undefined) return false; 
//     return true;
// }

// import type { ApiRequestOptions } from './ApiRequestOptions';

// type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
// type Headers = Record<string, string>;

export class ApimServerAPIClient {    
    private static base: string;

  //   public static getHeaders = async(options: ApiRequestOptions): Promise<Headers> => {
  //     return {
  //       'x-hello'
  //     };
  // }  

    public static initialize = (base: string) => {
      ApimServerAPIClient.base = base;
      OpenAPI.BASE = base;
      // OpenAPI.USERNAME = PlatformAPIClient.getOpenApiUser;
      // OpenAPI.PASSWORD = PlatformAPIClient.getOpenApiPwd;
    }
}
