import { 
  APIInfo, APIInfoList, APIParameter, ApisService, CommonEntityNameList,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { EAPApiSpecFormat, TAPApiSpecDisplay } from './APApiSpecsService';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from './APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from './APSearchContentService';

export type TAPApiParameterList = Array<APIParameter>;
export type TAPApiDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apApiProductReferenceEntityIdList: TAPEntityIdList;
  connectorApiInfo: APIInfo;
}
export type TAPApiDisplayList = Array<TAPApiDisplay>;

export class APApisService {
  private readonly BaseComponentName = "APApisService";

  private create_ApApiDisplay_From_ApiEntities = (connectorApiInfo: APIInfo, apApiProductEntityIdList: TAPEntityIdList): TAPApiDisplay => {
    const _base: TAPApiDisplay = {
      apEntityId: {
        id: connectorApiInfo.name,
        displayName: connectorApiInfo.name
      },
      connectorApiInfo: connectorApiInfo,
      apApiProductReferenceEntityIdList: apApiProductEntityIdList,
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<TAPApiDisplay>(_base);
    // return _base;
  }

  private listApiProductReferencesToApi = async({organizationId, apiId }: {
    organizationId: string;
    apiId: string;
  }): Promise<TAPEntityIdList> => {
    const list: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
      organizationName: organizationId,
      apiName: apiId
    });
    return APEntityIdsService.create_SortedApEntityIdList_From_CommonEntityNamesList(list);
  }

  private sort_ApApiParameterList(list: TAPApiParameterList): TAPApiParameterList {
    return list.sort( (e1: APIParameter, e2: APIParameter) => {
      if(e1.name.toLocaleLowerCase() < e2.name.toLocaleLowerCase()) return -1;
      if(e1.name.toLocaleLowerCase() > e2.name.toLocaleLowerCase()) return 1;
      return 0;
    });
  }

  public create_CombinedApiParameterList(apApiDisplayList: TAPApiDisplayList): TAPApiParameterList {
    const funcName = 'create_CombinedApiParameterList';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    const mergeEnumLists = (one: Array<string> | undefined, two: Array<string> | undefined): Array<string> | undefined => {
      let mergedList: Array<string> = [];
      if(!one && !two) return undefined;
      if(one) {
        if(two) mergedList = one.concat(two);
        else mergedList = one;
      } else if(two) {
        mergedList = two;
      }
      // dedup mergedList
      const unique = new Map<string, number>();
      let distinct = [];
      for(let i=0; i < mergedList.length; i++) {
        if(!unique.has(mergedList[i])) {
          distinct.push(mergedList[i]);
          unique.set(mergedList[i], 1);
        }
      }
      return distinct;
    }
    const apApiParameterList: TAPApiParameterList = [];
    for(const apApiDisplay of apApiDisplayList) {
      if(apApiDisplay.connectorApiInfo.apiParameters) {
        for(const newApiParameter of apApiDisplay.connectorApiInfo.apiParameters) {
          // console.log(`${logName}: start: apiParameterList=${JSON.stringify(apiParameterList)}`);
          const found: APIParameter | undefined = apApiParameterList.find( (exsistingApiParameter: APIParameter) => {
            if(exsistingApiParameter.name === newApiParameter.name) {
              if(exsistingApiParameter.type !== newApiParameter.type) {
                console.warn(`${logName}: how to handle mismatching api parameter types: name:${newApiParameter.name}, api:${apApiDisplay.apEntityId.id}, type:${newApiParameter.type}, previous type=${exsistingApiParameter.type}`)
              }
              return true;
            }  
            return false;
          });
          if(found) {
            // merge the two enums if they have them
            // console.log(`${logName}: found.enum=${JSON.stringify(found.enum)}`)
            // console.log(`${logName}: newApiParameter.enum=${JSON.stringify(newApiParameter.enum)}`)
            const newEnumList: Array<string> | undefined = mergeEnumLists(found.enum, newApiParameter.enum);
            // console.log(`${logName}: newEnumList=${JSON.stringify(newEnumList)}`);
            if(newEnumList) {
              const idx = apApiParameterList.findIndex( (elem: APIParameter) => {
                return elem.name === found.name;
              });
              apApiParameterList[idx].enum = newEnumList;
            }
          } else apApiParameterList.push(newApiParameter);
        }
      }
    }
    return this.sort_ApApiParameterList(apApiParameterList);
  }

  public create_ApApiDisplayList_FilteredBy_EntityIdList(apApiDisplayList: TAPApiDisplayList, filterByEntityIdList: TAPEntityIdList): TAPApiDisplayList {
    if(apApiDisplayList.length === 0) return [];
    if(filterByEntityIdList.length === 0) return JSON.parse(JSON.stringify(apApiDisplayList));
    return apApiDisplayList.filter( (x) => {
      const idx = filterByEntityIdList.findIndex( (y) => {
        return x.apEntityId.id === y.id;
      });
      return (idx > -1);
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
    };
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPApiDisplay>(list);    
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
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPApiDisplay>(list);    
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

  public async getApiSpec({ organizationId, apiEntityId }: {
    organizationId: string;
    apiEntityId: TAPEntityId;
  }): Promise<TAPApiSpecDisplay> {
    const jsonSpec: any = await ApisService.getApi({
      organizationName: organizationId, 
      apiName: apiEntityId.id,
      format: EAPApiSpecFormat.JSON
    });
    return {
      apEntityId: apiEntityId,
      format: EAPApiSpecFormat.JSON,
      spec: jsonSpec
    };

  }

}

export default new APApisService();