import { SelectItem } from 'primereact/api';

import { 
  ApiError,
  APIInfo,
  APIInfoList,
  APIProduct, 
  ApiProductsService, 
  ApisService, 
  AppListItem, 
  ClientOptionsGuaranteedMessaging, 
  CommonDisplayName, 
  CommonName, 
  EnvironmentResponse, 
  EnvironmentsService, 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../utils/ApiCallState";
import { Globals } from "../utils/Globals";
import { TApiEntitySelectItem, TApiEntitySelectItemIdList, TApiEntitySelectItemList, TAPOrganizationId } from "./APComponentsCommon";


export type TManagedObjectId = CommonName;
export type TManagedObjectDisplayName = CommonDisplayName;
// * Environments *
export type TAPEnvironmentViewManagedObject = {
  id: TManagedApiProductId,
  displayName: string,
  apiEnvironment: EnvironmentResponse
  globalSearch: string
}
export type TAPEnvironmentViewManagedObjectList = Array<TAPEnvironmentViewManagedObject>;

// * Manage Apis *
export type TAPApiViewManagedObject = {
  id: string,
  displayName: string,
  apiInfo: APIInfo,
  globalSearch: string
}

export enum EApiTopicSyntax {
  SMF = "smf",
  MQTT = "mqtt"
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

// Manage Apps
export type TViewManagedApp = {
  id: string,
  displayName: string,
  appListItem: AppListItem,
  apiProductList: TApiProductList
}
export type TViewManagedAppList = Array<TViewManagedApp>;

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

  public static transformEnvironmentListToSelectItemIdList = (environmentList: TAPEnvironmentViewManagedObjectList): TApiEntitySelectItemIdList => {
    return environmentList.map( (environment: TAPEnvironmentViewManagedObject) => {
      return environment.id;
    });
  }

  public static transformEnvironmentListToSelectItemList = (environmentList: TAPEnvironmentViewManagedObjectList): TApiEntitySelectItemList => {
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

  public static getBooleanSelectList = (): Array<SelectItem> => {
    return [
      { label: 'yes', value: true },
      { label: 'no', value: false }
    ];
  }  

  public static getQueueAccessTypeSelectList = (): Array<ClientOptionsGuaranteedMessaging.accessType> => {
    const e: any = ClientOptionsGuaranteedMessaging.accessType;
    return Object.keys(e).map(k => e[k]);
  }  

  public static getApprovalTypeSelectList = (): Array<APIProduct.approvalType> => {
    const e: any = APIProduct.approvalType;
    return Object.keys(e).map(k => e[k]);
  }  

  public static transformApiProductToViewManagedApiProduct = (apiProduct: TApiProduct, apiEnvironmentList: TApiEnvironmentList, apiInfoList: APIInfoList): TViewManagedApiProduct => {
    return {
      id: apiProduct.name,
      displayName: apiProduct.displayName,
      apiProduct: apiProduct,
      apiEnvironmentList: apiEnvironmentList,
      apiInfoList: apiInfoList
    };
  }

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
      // throw new Error(`${logName}: testing error display`);
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
