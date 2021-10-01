import { 
  ApiError,
  APIInfo,
  APIInfoList,
  APIProduct, 
  ApiProductsService, 
  ApisService, 
  EnvironmentResponse, 
  EnvironmentsService, 
  Protocol
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../utils/ApiCallState";
import { Globals } from "../utils/Globals";
import { TApiEntitySelectItem, TApiEntitySelectItemIdList, TApiEntitySelectItemList, TAPOrganizationId } from "./APComponentsCommon";

// * Environments *
export type TAPEnvironmentViewManagedObject = {
  id: TManagedApiProductId,
  displayName: string,
  apiEnvironment: EnvironmentResponse
  globalSearch: string
}
export type TAPEnvironmentViewManagedOjbectList = Array<TAPEnvironmentViewManagedObject>;

// * Manage Apis *
export type TAPApiViewManagedObject = {
  id: string,
  displayName: string,
  apiInfo: APIInfo,
  globalSearch: string
}

// * Manage Api Products *
export type TApiProduct = APIProduct;
export type TApiProductList = Array<TApiProduct>;
export type TApiEnvironmentNameList = Array<string>;
export type TApiEnvironmentList = Array<EnvironmentResponse>;
export type TManagedApiProductId = string;
export type TViewManagedApiProduct = {
  id: TManagedApiProductId,
  displayName: string,
  apiProduct: APIProduct,
  apiEnvironmentList: TApiEnvironmentList,
  apiInfoList: APIInfoList
}
export type TViewManagedApiProductList = Array<TViewManagedApiProduct>;

export type TApiGetApiProductListResult = {
  apiCallState: TApiCallState,
  viewManagedApiProductList: TViewManagedApiProductList,
}
export type TApiGetApiInfoListResult = {
  apiCallState: TApiCallState,
  apiInfoList: APIInfoList
}

export class APEnvironmentObjectsCommon {

  public static transformEnvironmentResponseToEnvironmentViewManagedObject = (envResponse: EnvironmentResponse): TAPEnvironmentViewManagedObject => {
    const globalSearch = envResponse;
    return {
      id: envResponse.name,
      displayName: envResponse.displayName ? envResponse.displayName : envResponse.name,
      apiEnvironment: envResponse,
      globalSearch: Globals.generateDeepObjectValuesString(globalSearch)
    }
  }

  public static transformEnvironmentListToSelectItemIdList = (environmentList: TAPEnvironmentViewManagedOjbectList): TApiEntitySelectItemIdList => {
    return environmentList.map( (environment: TAPEnvironmentViewManagedObject) => {
      return environment.id;
    });
  }

  public static transformEnvironmentListToSelectItemList = (environmentList: TAPEnvironmentViewManagedOjbectList): TApiEntitySelectItemList => {
    return environmentList.map( (environment: TAPEnvironmentViewManagedObject) => {
      return {
        id: environment.id,
        displayName: environment.displayName
      }
    });
  }

}

export class APApiObjectsCommon {

  public static transformSelectItemListToTableGlobalFilter = (selectItemList: TApiEntitySelectItemList): string => {
    const list: Array<string> = selectItemList.map( (selectItem: TApiEntitySelectItem) => {
      return selectItem.displayName;
    });
    return list.join(' ');
  }

  public static getApiInfoListAsDisplayStringList = (apiInfoList: APIInfoList ): Array<string> => {
    return apiInfoList.map( (apiInfo: APIInfo) => {
      return `${apiInfo.name} (${apiInfo.source})`;
    });  
  }

  public static getApprovalTypeSelectList = (): Array<APIProduct.approvalType> => {
    const e: any = APIProduct.approvalType;
    return Object.keys(e).map(k => e[k]);
  }  

  public static transformApiInfoListToSelectItemIdList = (apiInfoList: APIInfoList): TApiEntitySelectItemIdList => {
    const funcName = 'transformApiInfoListToSelectItemIdList';
    const logName = `${APApiObjectsCommon.name}.${funcName}()`;
    return apiInfoList.map( (apiInfo: APIInfo) => {
      if(!apiInfo.name) throw new Error(`${logName}: apiInfo.name is undefined`);
      return apiInfo.name;
    });
  }

  public static transformApiInfoListToSelectItemList = (apiInfoList: APIInfoList): TApiEntitySelectItemList => {
    const funcName = 'transformApiInfoListToSelectItemList';
    const logName = `${APApiObjectsCommon.name}.${funcName}()`;
    return apiInfoList.map( (apiInfo: APIInfo) => {
      if(!apiInfo.name) throw new Error(`${logName}: apiInfo.name is undefined`);
      return {
        id: apiInfo.name,
        displayName: apiInfo.name
      };
    });
  }

}

export class APApiProductsCommon {

  public static transformApiProductToViewManagedApiProduct = (apiProduct: TApiProduct, apiEnvironmentList: TApiEnvironmentList, apiInfoList: APIInfoList): TViewManagedApiProduct => {
    return {
      id: apiProduct.name,
      displayName: apiProduct.displayName,
      apiProduct: apiProduct,
      apiEnvironmentList: apiEnvironmentList,
      apiInfoList: apiInfoList
    };
  }

  public static getAsyncApiDisplayNameListAsString = (asyncApiDisplayNameList: string[] ): string => {
    return asyncApiDisplayNameList.join(', ');
  }

  public static getProtocolListAsString = (protocolList?: Protocol[] ): string => {
    if(protocolList) {
      let _protocolList: Array<string> = [];
      protocolList.forEach( (protocol: Protocol) => {
        _protocolList.push(`${protocol.name}(${protocol.version})`);
      });
      return _protocolList.join(', ');
    }
    else return '';
  }

  // public static getAttributeInfoAsString = (attributeList?: TApiAttributeList): string => {
  //   if(attributeList) {
  //     let _attributeList: Array<string> = [];
  //     attributeList.forEach( (attribute: TApiAttribute) => {
  //       const attributeStr: string = `${attribute.name}: ${attribute.value}`;
  //       _attributeList.push(attributeStr);
  //     });
  //     return _attributeList.join(' | ');
  //   }
  //   else return '';
  // }

  // public static getAttributeNamesAsString = (attributeList?: TApiAttributeList): string => {
  //   if(attributeList) {
  //     let _attributeList: Array<string> = [];
  //     attributeList.forEach( (attribute: TApiAttribute) => {
  //       _attributeList.push(`${attribute.name}`);
  //     });
  //     return _attributeList.join(', ');
  //   }
  //   else return '';
  // }

  // public static getEnvironmentsAsString = (apiEnvironmentList: TApiEnvironmentList, apiEnvironmentNameList?: TApiEnvironmentNameList): string => {
  //   const funcName = 'getEnvironmentsAsString';
  //   const logName = `${DeveloperPortalCommon.name}.${funcName}()`;
  //   if(!apiEnvironmentNameList) return '';
  //   let _environmentStrList: Array<string> = [];
  //   apiEnvironmentNameList.forEach( (environmentName: string) => {
  //     const envDetails = apiEnvironmentList.find( (environment: EnvironmentResponse) => {
  //       return environment.name === environmentName;
  //     });
  //     if(!envDetails) throw new Error(`${logName}: not envDetails for environmentName=${environmentName}`);
  //     _environmentStrList.push(
  //       `${envDetails.displayName} (${envDetails.datacenterProvider}:${envDetails.datacenterId})`
  //     );
  //   });
  //   return _environmentStrList.join(', ');
  // }

  // public static getEnvironmentsAsDisplayList = (apiEnvironmentList: TApiEnvironmentList, apiEnvironmentNameList?: TApiEnvironmentNameList): Array<string> => {
  //   const funcName = 'getEnvironmentsAsDisplayList';
  //   const logName = `${DeveloperPortalCommon.name}.${funcName}()`;
  //   if(!apiEnvironmentNameList) return [];
  //   let _environmentStrList: Array<string> = [];
  //   apiEnvironmentNameList.forEach( (environmentName: string) => {
  //     const envDetails = apiEnvironmentList.find( (environment: EnvironmentResponse) => {
  //       return environment.name === environmentName;
  //     });
  //     if(!envDetails) throw new Error(`${logName}: not envDetails for environmentName=${environmentName}`);
  //     _environmentStrList.push(
  //       `${envDetails.displayName} (${envDetails.datacenterProvider}:${envDetails.datacenterId})`
  //     );
  //   });
  //   return _environmentStrList;
  // }

  
}

export class APApiObjectsApiCalls {

  public static apiGetApiInfoList = async(organizationId: TAPOrganizationId, initialApiCallState: TApiCallState): Promise<TApiGetApiInfoListResult> => {
    const funcName = 'apiGetApiInfoList';
    const logName = `${APApiObjectsApiCalls.name}.${funcName}()`;
    let result: TApiGetApiInfoListResult = {
      apiCallState: initialApiCallState,
      apiInfoList: []
    };
    let anyError: any = undefined;
    let apiInfoList: APIInfoList = [];
    try {
      apiInfoList = await ApisService.listApis({
        organizationName: organizationId,
        format: 'extended'
      }) as APIInfoList;
    } catch (e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status !== 404) anyError = e;
      } else anyError = e;
    }
    if(!anyError) {
      result.apiInfoList = apiInfoList;
    }
    if(anyError) {
      APClientConnectorOpenApi.logError(logName, anyError);
      result.apiCallState = ApiCallState.addErrorToApiCallState(anyError, initialApiCallState);
    }
    return result;
  }

  public static apiGetApiProductList = async(organizationId: TAPOrganizationId, initialApiCallState: TApiCallState): Promise<TApiGetApiProductListResult> => {
    const funcName = 'apiGetApiProductList';
    const logName = `${APApiObjectsApiCalls.name}.${funcName}()`;
    let result: TApiGetApiProductListResult = {
      apiCallState: initialApiCallState,
      viewManagedApiProductList: []
    };
    let anyError: any = undefined;
    let apiProductList: TApiProductList = [];
    try {
      apiProductList = await ApiProductsService.listApiProducts({
        organizationName: organizationId
      });
    } catch (e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status !== 404) anyError = e;
      } else anyError = e;
    }
    if(!anyError) {
      if(apiProductList.length > 0) {
        try { 
          let viewManagedApiProductList: TViewManagedApiProductList = [];
          for(const apiProduct of apiProductList) {
            let apiEnvironmentList: TApiEnvironmentList = [];
            let apiInfoList: APIInfoList = [];
            if(apiProduct.environments) {
              for(const apiEnvironmentName of apiProduct.environments) {
                const resp: EnvironmentResponse = await EnvironmentsService.getEnvironment({
                  organizationName: organizationId, 
                  envName: apiEnvironmentName
                });
                apiEnvironmentList.push(resp);
              }
            }
            for(const apiName of apiProduct.apis) {
              const apiInfo: APIInfo = await ApisService.getApiInfo({
                organizationName: organizationId,
                apiName: apiName
              });
              apiInfoList.push(apiInfo);
            }
            viewManagedApiProductList.push(APApiProductsCommon.transformApiProductToViewManagedApiProduct(apiProduct, apiEnvironmentList, apiInfoList));
          }  
          result.viewManagedApiProductList = viewManagedApiProductList;
        } catch(e: any) {
          anyError = e;
        }
      }
      // result.apiTotalCount = totalCount;
    }
    if(anyError) {
      APClientConnectorOpenApi.logError(logName, anyError);
      result.apiCallState = ApiCallState.addErrorToApiCallState(anyError, initialApiCallState);
    }
    return result;
  }

}
