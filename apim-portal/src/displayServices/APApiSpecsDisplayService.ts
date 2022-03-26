import { ApiProductsService } from '@solace-iot-team/apim-connector-openapi-browser';
import { IAPEntityIdDisplay, TAPEntityId } from '../utils/APEntityIdsService';

export enum EAPApiSpecFormat {
  JSON = 'application/json',
  YAML = 'application/x-yaml',
  UNKNOWN = 'application/x-unknown'
}

export type TAPApiSpecDisplay = IAPEntityIdDisplay & {
  format: EAPApiSpecFormat,
  spec: any
}

export class APApiSpecsDisplayService {
  private readonly BaseComponentName = "APApiSpecsDisplayService";

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiGet_ApiSpec({ organizationId, apiProductId, apiEntityId }: {
    organizationId: string;
    apiProductId: string;
    apiEntityId: TAPEntityId;
  }): Promise<TAPApiSpecDisplay> {
    const spec: any = await ApiProductsService.getApiProductApiSpecification({
      organizationName: organizationId, 
      apiProductName: apiProductId,
      apiName: apiEntityId.id,
      format: EAPApiSpecFormat.JSON
    });
    return {
      apEntityId: apiEntityId,
      format: EAPApiSpecFormat.JSON,
      spec: spec
    };
  }

}

export default new APApiSpecsDisplayService();
