import { 
  APIInfo, APIInfoList, ApisService, CommonEntityNameList,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityId, { TAPEntityId, TAPEntityIdList } from './APEntityIdsService';
import { TAPAsyncApiSpec } from './APTypes';

export type TAPApiDisplay = {
  apEntityId: TAPEntityId;
  apApiProductReferenceEntityIdList: TAPEntityIdList
  connectorApiInfo: APIInfo;
  apAsyncApiSpec?: TAPAsyncApiSpec;
}
export type TAPApiDisplayList = Array<TAPApiDisplay>;

export class APApisService {
  private readonly BaseComponentName = "APApisService";

  private create_ApApiDisplay_From_ApiEntities = (connectorApiInfo: APIInfo, apApiProductEntityIdList: TAPEntityIdList, apAsyncApiSpec?: TAPAsyncApiSpec): TAPApiDisplay => {
    const _base: TAPApiDisplay = {
      apEntityId: {
        id: connectorApiInfo.name,
        displayName: connectorApiInfo.name
      },
      connectorApiInfo: connectorApiInfo,
      apApiProductReferenceEntityIdList: apApiProductEntityIdList,
      apAsyncApiSpec: apAsyncApiSpec
    }
    return _base;
  }

  private listApiProductReferencesToApi = async({organizationId, apiId }: {
    organizationId: string;
    apiId: string;
  }): Promise<TAPEntityIdList> => {
    const list: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
      organizationName: organizationId,
      apiName: apiId
    });
    return APEntityId.getSortedApEntityIdList_From_CommonEntityNamesList(list);
  }

  public getSortedDisplayNameList(apApiDisplayList: TAPApiDisplayList): Array<string> {
    return apApiDisplayList.map( (apApiDisplay: TAPApiDisplay) => {
      return apApiDisplay.apEntityId.displayName;
    }).sort( (e1: string, e2:string) => {
      if(e1.toLocaleLowerCase() < e2.toLocaleLowerCase()) return -1;
      if(e1.toLocaleLowerCase() > e2.toLocaleLowerCase()) return 1;
      return 0;
    });
  }

  public async listApApiDisplayForApiIdList({organizationId, apiIdList}: {
    organizationId: string;
    apiIdList: Array<string>;
  }): Promise<TAPApiDisplayList> {
    const list: TAPApiDisplayList = [];
    // TODO: PARALLELIZE
    for(const apiId of apiIdList) {
      list.push(await this.getApApiDisplay({
        organizationId: organizationId,
        apiId: apiId
      }));
    }
    return list;
  }

  public async listApApiDisplay({ organizationId }:{
    organizationId: string;
  }): Promise<TAPApiDisplayList> {
    const result = await ApisService.listApis({
      organizationName: organizationId,
      format: 'extended'
    });
    const apiInfoList: APIInfoList = result as APIInfoList;
    const list: TAPApiDisplayList = [];
    // TODO: PARALLELIZE
    for(const apiInfo of apiInfoList) {
      const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.listApiProductReferencesToApi({
        organizationId: organizationId, 
        apiId: apiInfo.name
      });
      list.push(this.create_ApApiDisplay_From_ApiEntities(apiInfo, apApiProductReferenceEntityIdList));
    }
    return list;
  }
  
  public async getApApiDisplay({ organizationId, apiId}: {
    organizationId: string;
    apiId: string;
  }): Promise<TAPApiDisplay> {

    const connectorApiInfo: APIInfo = await ApisService.getApiInfo({
      organizationName: organizationId,
      apiName: apiId
    });
    const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.listApiProductReferencesToApi({
      organizationId: organizationId, 
      apiId: apiId
    });

    return this.create_ApApiDisplay_From_ApiEntities(connectorApiInfo, apApiProductReferenceEntityIdList);
  }

}

export default new APApisService();
