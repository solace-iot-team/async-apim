import { 
  APIInfo, 
  APIInfoList, 
  APIList, 
  APIParameter, 
  ApisService, 
  APISummaryList, 
  CommonEntityNameList,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { Globals } from '../utils/Globals';


/** apEntityId.id & displayName are the same and represent the parameter name */
export type TAPApiChannelParameter = IAPEntityIdDisplay & {
  valueList: Array<string>;
}
export type TAPApiChannelParameterList = Array<TAPApiChannelParameter>;

export type TAPApiDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apApiProductReferenceEntityIdList: TAPEntityIdList;
  apApiChannelParameterList: TAPApiChannelParameterList;
  apVersion: string; /** in SemVer format */
  connectorApiInfo: APIInfo;
}
export type TAPApiDisplayList = Array<TAPApiDisplay>;

export class APApisDisplayService {
  private readonly BaseComponentName = "APApisDisplayService";

  public nameOf(name: keyof TAPApiDisplay) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }
  public nameOf_ConnectorApiInfo(name: keyof APIInfo) {
    return `${this.nameOf('connectorApiInfo')}.${name}`;
  }

  private create_ApApiChannelParameterList({ connectorParameters }:{
    connectorParameters?: Array<APIParameter>;
  }): TAPApiChannelParameterList {
    if(connectorParameters === undefined) return [];
    const apApiChannelParameterList: TAPApiChannelParameterList = [];
    connectorParameters.forEach( (x) => {
      const apApiChannelParameter: TAPApiChannelParameter = {
        apEntityId: {
          id: x.name, 
          displayName: x.name
        },
        valueList: x.enum ? x.enum : []
      };
      apApiChannelParameterList.push(apApiChannelParameter);
    });
    return apApiChannelParameterList;
  }

  private create_ApApiDisplay_From_ApiEntities = ({ connectorApiInfo, apApiProductReferenceEntityIdList }:{
    connectorApiInfo: APIInfo;
    apApiProductReferenceEntityIdList: TAPEntityIdList;
  }): TAPApiDisplay => {

    const _base: TAPApiDisplay = {
      apEntityId: {
        id: connectorApiInfo.name,
        displayName: connectorApiInfo.name
      },
      connectorApiInfo: connectorApiInfo,
      apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
      apApiChannelParameterList: this.create_ApApiChannelParameterList({ connectorParameters: connectorApiInfo.apiParameters }),
      apVersion: connectorApiInfo.version,
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<TAPApiDisplay>(_base);
  }

  public create_Combined_ApiChannelParameterList({ apApiDisplayList }:{
    apApiDisplayList: TAPApiDisplayList;
  }): TAPApiChannelParameterList {
    // const funcName = 'create_Combined_ApiChannelParameterList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const mergeValueLists = (one: Array<string>, two: Array<string>): Array<string> => {
      return Globals.deDuplicateStringList(one.concat(two));
    }

    const apComginedApiChannelParameterList: TAPApiChannelParameterList = [];
    
    for(const apApiDisplay of apApiDisplayList) {
      for(const newApiParameter of apApiDisplay.apApiChannelParameterList) {
        // alert(`${logName}: checking parameter: apApiDisplay=${apApiDisplay.apEntityId.displayName}, parameter=${JSON.stringify(newApiParameter, null, 2)}`);
        // get the index if already in list
        const existing_idx = apComginedApiChannelParameterList.findIndex( (existing: TAPApiChannelParameter) => {
          return existing.apEntityId.id === newApiParameter.apEntityId.id;
        });
        if(existing_idx > -1) {
          // alert(`${logName}: merging parameters, existing=${JSON.stringify(apComginedApiChannelParameterList[existing_idx], null, 2)}, newApiParameter=${JSON.stringify(newApiParameter, null, 2)}`);
          const newValueList: Array<string> = mergeValueLists(apComginedApiChannelParameterList[existing_idx].valueList, newApiParameter.valueList);
          apComginedApiChannelParameterList[existing_idx].valueList = newValueList;
        } else {
          // add parameter to list
          // alert(`${logName}: adding parameter=${JSON.stringify(newApiParameter, null, 2)}`);
          apComginedApiChannelParameterList.push(newApiParameter);            
        }
      }
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPApiChannelParameter>(apComginedApiChannelParameterList);  
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  // const funcName = 'apiGetList_ApiProductReferenceEntityIdList';
  // const logName = `${this.ComponentName}.${funcName}()`;


  public apiGetList_ApiProductReferenceEntityIdList = async({ organizationId, apiId }: {
    organizationId: string;
    apiId: string;
  }): Promise<TAPEntityIdList> => {
    const list: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
      organizationName: organizationId,
      apiName: apiId
    });
    return APEntityIdsService.create_SortedApEntityIdList_From_CommonEntityNamesList(list);
  }

  public async apiGetList_ApApiDisplay_For_ApiIdList({ organizationId, apiIdList }: {
    organizationId: string;
    apiIdList: Array<string>;
  }): Promise<TAPApiDisplayList> {
    const list: TAPApiDisplayList = [];
    // TODO: PARALLELIZE
    for(const apiId of apiIdList) {
      list.push(await this.apiGet_ApApiDisplay({
        organizationId: organizationId,
        apiId: apiId
      }));
    };
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPApiDisplay>(list);    
  }

  public async apiGet_ApApiDisplay({ organizationId, apiId }: {
    organizationId: string;
    apiId: string;
  }): Promise<TAPApiDisplay> {
    // const funcName = 'apiGet_ApApiDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const connectorApiInfo: APIInfo = await ApisService.getApiInfo({
      organizationName: organizationId,
      apiName: apiId
    });

    const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.apiGetList_ApiProductReferenceEntityIdList({
      organizationId: organizationId, 
      apiId: apiId
    });

    return this.create_ApApiDisplay_From_ApiEntities({
      connectorApiInfo: connectorApiInfo, 
      apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList
    });
  }

  public async apiGetList_ApApiDisplayList({ organizationId }:{
    organizationId: string;
  }): Promise<TAPApiDisplayList> {
    const result: APIList | APISummaryList | APIInfoList = await ApisService.listApis({
      organizationName: organizationId,
      format: 'extended'
    });
    const apiInfoList: APIInfoList = result as APIInfoList;
    const list: TAPApiDisplayList = [];
    // TODO: PARALLELIZE
    for(const apiInfo of apiInfoList) {
      const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.apiGetList_ApiProductReferenceEntityIdList({
        organizationId: organizationId, 
        apiId: apiInfo.name
      });
      list.push(this.create_ApApiDisplay_From_ApiEntities({
        connectorApiInfo: apiInfo,
        apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList
      }));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(list);
  }

  // public async listApApiDisplay({ organizationId }:{
  //   organizationId: string;
  // }): Promise<TAPApiDisplayList> {
  //   const result = await ApisService.listApis({
  //     organizationName: organizationId,
  //     format: 'extended'
  //   });
  //   const apiInfoList: APIInfoList = result as APIInfoList;
  //   const list: TAPApiDisplayList = [];
  //   // TODO: PARALLELIZE
  //   for(const apiInfo of apiInfoList) {
  //     const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.listApiProductReferencesToApi({
  //       organizationId: organizationId, 
  //       apiId: apiInfo.name
  //     });
  //     list.push(this.create_ApApiDisplay_From_ApiEntities(apiInfo, apApiProductReferenceEntityIdList));
  //   }
  //   return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPApiDisplay>(list);    
  // }

  // private sort_ApApiParameterList(list: TAPApiParameterList): TAPApiParameterList {
  //   return list.sort( (e1: APIParameter, e2: APIParameter) => {
  //     if(e1.name.toLocaleLowerCase() < e2.name.toLocaleLowerCase()) return -1;
  //     if(e1.name.toLocaleLowerCase() > e2.name.toLocaleLowerCase()) return 1;
  //     return 0;
  //   });
  // }

  // public create_CombinedApiParameterList(apApiDisplayList: TAPApiDisplayList): TAPApiParameterList {
  //   const funcName = 'create_CombinedApiParameterList';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;
  //   const mergeEnumLists = (one: Array<string> | undefined, two: Array<string> | undefined): Array<string> | undefined => {
  //     let mergedList: Array<string> = [];
  //     if(!one && !two) return undefined;
  //     if(one) {
  //       if(two) mergedList = one.concat(two);
  //       else mergedList = one;
  //     } else if(two) {
  //       mergedList = two;
  //     }
  //     // dedup mergedList
  //     const unique = new Map<string, number>();
  //     let distinct = [];
  //     for(let i=0; i < mergedList.length; i++) {
  //       if(!unique.has(mergedList[i])) {
  //         distinct.push(mergedList[i]);
  //         unique.set(mergedList[i], 1);
  //       }
  //     }
  //     return distinct;
  //   }
  //   const apApiParameterList: TAPApiParameterList = [];
  //   for(const apApiDisplay of apApiDisplayList) {
  //     if(apApiDisplay.connectorApiInfo.apiParameters) {
  //       for(const newApiParameter of apApiDisplay.connectorApiInfo.apiParameters) {
  //         // console.log(`${logName}: start: apiParameterList=${JSON.stringify(apiParameterList)}`);
  //         const found: APIParameter | undefined = apApiParameterList.find( (exsistingApiParameter: APIParameter) => {
  //           if(exsistingApiParameter.name === newApiParameter.name) {
  //             if(exsistingApiParameter.type !== newApiParameter.type) {
  //               console.warn(`${logName}: how to handle mismatching api parameter types: name:${newApiParameter.name}, api:${apApiDisplay.apEntityId.id}, type:${newApiParameter.type}, previous type=${exsistingApiParameter.type}`)
  //             }
  //             return true;
  //           }  
  //           return false;
  //         });
  //         if(found) {
  //           // merge the two enums if they have them
  //           // console.log(`${logName}: found.enum=${JSON.stringify(found.enum)}`)
  //           // console.log(`${logName}: newApiParameter.enum=${JSON.stringify(newApiParameter.enum)}`)
  //           const newEnumList: Array<string> | undefined = mergeEnumLists(found.enum, newApiParameter.enum);
  //           // console.log(`${logName}: newEnumList=${JSON.stringify(newEnumList)}`);
  //           if(newEnumList) {
  //             const idx = apApiParameterList.findIndex( (elem: APIParameter) => {
  //               return elem.name === found.name;
  //             });
  //             apApiParameterList[idx].enum = newEnumList;
  //           }
  //         } else apApiParameterList.push(newApiParameter);
  //       }
  //     }
  //   }
  //   return this.sort_ApApiParameterList(apApiParameterList);
  // }

  
  // public async getApApiDisplay({ organizationId, apiId}: {
  //   organizationId: string;
  //   apiId: string;
  // }): Promise<TAPApiDisplay> {

  //   const connectorApiInfo: APIInfo = await ApisService.getApiInfo({
  //     organizationName: organizationId,
  //     apiName: apiId
  //   });
  //   const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.listApiProductReferencesToApi({
  //     organizationId: organizationId, 
  //     apiId: apiId
  //   });

  //   return this.create_ApApiDisplay_From_ApiEntities(connectorApiInfo, apApiProductReferenceEntityIdList);
  // }

  // public async getApiSpec({ organizationId, apiEntityId }: {
  //   organizationId: string;
  //   apiEntityId: TAPEntityId;
  // }): Promise<TAPApiSpecDisplay> {
  //   const jsonSpec: any = await ApisService.getApi({
  //     organizationName: organizationId, 
  //     apiName: apiEntityId.id,
  //     format: EAPApiSpecFormat.JSON
  //   });
  //   return {
  //     apEntityId: apiEntityId,
  //     format: EAPApiSpecFormat.JSON,
  //     spec: jsonSpec
  //   };

  // }

}

export default new APApisDisplayService();
