
import { OpenAPI } from '../../src/@solace-iot-team/apim-server-openapi-node';

export class ApimServerAPIClient {    
    private static base: string;

    public static initialize = (base: string) => {
      ApimServerAPIClient.base = base;
      OpenAPI.BASE = base;
      // OpenAPI.USERNAME = PlatformAPIClient.getOpenApiUser;
      // OpenAPI.PASSWORD = PlatformAPIClient.getOpenApiPwd;
    }

    public static initializeAuthConfigInternal = ({ protocol, host, port }:{
      protocol: string;
      host: string;
      port: number;
    }) => {
      OpenAPI.WITH_CREDENTIALS = true;
      OpenAPI.HEADERS = { 
        'Origin': `${protocol}://${host}:${port}`
      };
    }
}
