import { 
  APIProductAccessLevel,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPApiProductDisplay, APApiProductsService } from '../../utils/APApiProductsService';

export type TAPDeveloperPortalApiProductDisplay = TAPApiProductDisplay & {
  // apPortalDisplayType: EAPPortalDisplay_Type;
}; 
export type TAPDeveloperPortalApiProductDisplayList = Array<TAPDeveloperPortalApiProductDisplay>;

class APDeveloperPortalApiProductsService extends APApiProductsService {
  private readonly ComponentName = "APDeveloperPortalApiProductsService";

  // protected create_APApiProductDisplay_From_ApiEntities = (connectorApiProduct: APIProduct, connectorEnvRespList: Array<EnvironmentResponse>): TAPDeveloperPortalApiProductDisplay => {
  //   return super.create_APApiProductDisplay_From_ApiEntities(connectorApiProduct, connectorEnvRespList); 
  // }

  public listDeveloperPortalApiProductDisplay = async({ organizationId, includeAccessLevel }: {
    organizationId: string;
    includeAccessLevel?: APIProductAccessLevel;
  }): Promise<TAPDeveloperPortalApiProductDisplayList> => {

    // const funcName = 'listDeveloperPortalApiProductDisplay';
    // const logName = `${this.APDeveloperPortalApiProductsService_ComponentName}.${funcName}()`;
    // console.log(`${logName}: starting ...`)

    return await this.listApiProductDisplay({
      organizationId: organizationId,
      includeAccessLevel: includeAccessLevel
    }); 
  }

  public getDeveloperPortalApiProductDisplay = async({ organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPDeveloperPortalApiProductDisplay> => {

    return await this.getApiProductDisplay({
      organizationId: organizationId,
      apiProductId: apiProductId
    });
  }
}

export default new APDeveloperPortalApiProductsService();
