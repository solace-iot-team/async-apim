
import { OpenAPI } from '../../src/@solace-iot-team/apim-server-openapi-node';

export class ApimServerAPIClient {    
    private static base: string;

    public static initialize = (base: string) => {
      ApimServerAPIClient.base = base;
      OpenAPI.BASE = base;
      // OpenAPI.USERNAME = PlatformAPIClient.getOpenApiUser;
      // OpenAPI.PASSWORD = PlatformAPIClient.getOpenApiPwd;
    }
}
