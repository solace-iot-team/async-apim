import { 
  APIProductAccessLevel,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPApiProductDisplay, APApiProductsService } from '../../utils/deleteme.APApiProductsService';

export type TAPDeveloperPortalApiProductDisplay = TAPApiProductDisplay; 
export type TAPDeveloperPortalApiProductDisplayList = Array<TAPDeveloperPortalApiProductDisplay>;

class APDeveloperPortalApiProductsService extends APApiProductsService {
  private readonly ComponentName = "APDeveloperPortalApiProductsService";

  public listDeveloperPortalApiProductDisplay = async({ organizationId, includeAccessLevel }: {
    organizationId: string;
    includeAccessLevel?: APIProductAccessLevel;
  }): Promise<TAPDeveloperPortalApiProductDisplayList> => {

    // const funcName = 'listDeveloperPortalApiProductDisplay';
    // const logName = `${this.APDeveloperPortalApiProductsService_ComponentName}.${funcName}()`;
    // console.log(`${logName}: starting ...`)

    return await this.listApApiProductDisplay({
      organizationId: organizationId,
      includeAccessLevel: includeAccessLevel
    }); 
  }

  public getDeveloperPortalApiProductDisplay = async({ organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPDeveloperPortalApiProductDisplay> => {

    return await this.getApApiProductDisplay({
      organizationId: organizationId,
      apiProductId: apiProductId
    });
  }
}

export default new APDeveloperPortalApiProductsService();
