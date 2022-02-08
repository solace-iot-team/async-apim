import { 
  APIInfo,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPEntityId, TAPEntityIdList } from './APEntityId';
import { TAPAsyncApiSpec } from './APTypes';

type TAPApiDisplay_Base = {
  entityId: TAPEntityId;
  apiApiInfo: APIInfo;
  apiUsedBy_ApiProductEntityIdList: TAPEntityIdList;
  apAsyncApiSpec?: TAPAsyncApiSpec;
}
export type TAPDeveloperPortalApiDisplay = TAPApiDisplay_Base & {
  // apPortalDisplayType: EAPPortalDisplay_Type;
};

export class APApisService {
  private static componentName = "APApisService";

  private static create_APApiDisplay_Base_From_ApiEntities = (apiApiInfo: APIInfo, apiApiProductEntityIdList: TAPEntityIdList, apAsyncApiSpec?: TAPAsyncApiSpec): TAPApiDisplay_Base => {
    const _base: TAPApiDisplay_Base = {
      entityId: {
        id: apiApiInfo.name,
        displayName: apiApiInfo.name
      },
      apiApiInfo: apiApiInfo,
      apiUsedBy_ApiProductEntityIdList: apiApiProductEntityIdList,
      apAsyncApiSpec: apAsyncApiSpec
    }
    return _base;
  }
  public static create_APDeveloperPortalApiDisplay_From_ApiEntities = (apiInfo: APIInfo, apiApiProductEntityIdList: TAPEntityIdList, apAsyncApiSpec?: TAPAsyncApiSpec): TAPDeveloperPortalApiDisplay => {
    const _base: TAPApiDisplay_Base = APApisService.create_APApiDisplay_Base_From_ApiEntities(apiInfo, apiApiProductEntityIdList, apAsyncApiSpec);
    return _base;
    // return {
    //   ..._base,
    //   // apPortalDisplayType: EAPPortalDisplay_Type.TAPDeveloperPortalDisplay,
    // }
  }

}