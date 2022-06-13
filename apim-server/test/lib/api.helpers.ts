
import { OpenAPI } from '../../src/@solace-iot-team/apim-server-openapi-node';

type OpenApiHeaders = Record<string, string>;

export class ApimServerAPIClient {    
    private static base: string;
    private static refreshToken: string | undefined = undefined;
    private static origin: string;
    private static apsBearerToken: string = '***';

    private static getHeaders = async(): Promise<OpenApiHeaders> => {
      const headers: OpenApiHeaders = {
        'Origin': ApimServerAPIClient.origin,
      };
      if(ApimServerAPIClient.refreshToken !== undefined) {
        headers['Cookie'] = ApimServerAPIClient.refreshToken;
      }
      // console.log(`\n\n\n${ApimServerAPIClient.name}.getHeaders(): headers = ${JSON.stringify(headers, null, 2)}\n\n\n`);
      return headers;
    }

    public static initialize = (base: string) => {
      ApimServerAPIClient.base = base;
      OpenAPI.BASE = base;
      // OpenAPI.USERNAME = PlatformAPIClient.getOpenApiUser;
      // OpenAPI.PASSWORD = PlatformAPIClient.getOpenApiPwd;
    }

    // public static setApsBearerToken = (token: string | undefined) => {
    //   ApimServerAPIClient.apsBearerToken = token !== undefined ? token : '***';
    // }
  
    private static getApsBearerToken = (): string => { return ApimServerAPIClient.apsBearerToken; }
  
    public static initializeAuthConfigInternal = ({ protocol, host, port }:{
      protocol: string;
      host: string;
      port: number;
    }) => {
      ApimServerAPIClient.origin = `${protocol}://${host}:${port}`;
      OpenAPI.WITH_CREDENTIALS = true;
      OpenAPI.CREDENTIALS = 'include';
      // only called once
      // OpenAPI.HEADERS = ApimServerAPIClient.getHeaders();
      OpenAPI.HEADERS = async() => { return ApimServerAPIClient.getHeaders(); } 
      OpenAPI.TOKEN = async() => { return ApimServerAPIClient.getApsBearerToken(); }
    }

    public static setCredentials = ({ bearerToken }:{
      bearerToken: string;
    }) => {
      ApimServerAPIClient.apsBearerToken = bearerToken;
      OpenAPI.TOKEN = bearerToken;
    }

    public static setRefreshToken = ({ value } :{
      value: string | undefined;
    }) => {
      // if(value !== undefined) throw new Error(`setRefreshToken, value = ${value}`);
      if(value !== undefined) ApimServerAPIClient.refreshToken = value;
    }

}
