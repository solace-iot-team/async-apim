import { ApiProductsService, ApisService, AppsService } from '@solace-iot-team/apim-connector-openapi-browser';
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

class APApiSpecsDisplayService {
  private readonly BaseComponentName = "APApiSpecsDisplayService";

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiGet_App_ApiSpec({ organizationId, appId, apiEntityId }: {
    organizationId: string;
    appId: string;
    apiEntityId: TAPEntityId;
  }): Promise<TAPApiSpecDisplay> {
    const spec: Record<string, unknown> = await AppsService.getAppApiSpecification({
      organizationName: organizationId,
      appName: appId,
      apiName: apiEntityId.id,
      format: EAPApiSpecFormat.JSON      
    });
    return {
      apEntityId: apiEntityId,
      format: EAPApiSpecFormat.JSON,
      spec: spec
    };
  }

  public async apiGet_ApiProduct_ApiSpec({ organizationId, apiProductId, apiEntityId }: {
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

  public async apiGet_Api_ApiSpec({ organizationId, apiEntityId }: {
    organizationId: string;
    apiEntityId: TAPEntityId;
  }): Promise<TAPApiSpecDisplay> {
    const spec: any = await ApisService.getApi({
      organizationName: organizationId,
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
