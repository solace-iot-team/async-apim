import { 
  ApiError,
  APIInfo,
  APIInfoList,
  APIProduct, 
  APIProductAccessLevel, 
  ApiProductsService, 
  ApisService, 
  AppListItem, 
  CommonDisplayName, 
  CommonEntityNameList, 
  CommonName, 
  EnvironmentResponse, 
  EnvironmentsService, 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../utils/ApiCallState";

export type TManagedObjectId = CommonName;
export type TManagedObjectDisplayName = CommonDisplayName;

export type TAPApiEntityRef = {
  name: CommonName,
  displayName: CommonDisplayName
}

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
export const C_DEFAULT_API_PRODUCT_ACCESS_LEVEL = APIProductAccessLevel.PRIVATE;
export type TApiProduct = APIProduct;
export type TApiProductList = Array<TApiProduct>;
export type TApiEnvironmentNameList = Array<string>;
export type TApiEnvironmentList = Array<EnvironmentResponse>;
export type TViewManagedApiProduct = {
  id: string;
  displayName: string;
  apiProduct: APIProduct;
  apiEnvironmentList: TApiEnvironmentList;
  apiInfoList: APIInfoList;
  apiUsedBy_AppEntityNameList: CommonEntityNameList;
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

export class APApiProductsCommon {

  // TODO: delete me once developer portal api products are refactored
  public static transformApiProductToViewManagedApiProduct = (apiProduct: TApiProduct, apiEnvironmentList: TApiEnvironmentList, apiInfoList: APIInfoList, apiUsedBy_AppEntityNameList: CommonEntityNameList): TViewManagedApiProduct => {
    return {
      id: apiProduct.name,
      displayName: apiProduct.displayName,
      apiProduct: {
        ...apiProduct,
        accessLevel: apiProduct.accessLevel ? apiProduct.accessLevel : C_DEFAULT_API_PRODUCT_ACCESS_LEVEL
      },
      apiEnvironmentList: apiEnvironmentList,
      apiInfoList: apiInfoList,
      apiUsedBy_AppEntityNameList: apiUsedBy_AppEntityNameList
    };
  }

}

// TODO: delete me once developer portal api products are refactored
  
export class APApiObjectsApiCalls {

  public static apiGetApiInfoList = async(organizationId: string, initialApiCallState: TApiCallState): Promise<TApiGetApiInfoListResult> => {
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

  public static apiGetApiProductList = async(organizationId: string, initialApiCallState: TApiCallState): Promise<TApiGetApiProductListResult> => {
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
            const apiAppEntityNameList: CommonEntityNameList = await ApiProductsService.listAppReferencesToApiProducts({
              organizationName: organizationId,
              apiProductName: apiProduct.name
            });
            viewManagedApiProductList.push(APApiProductsCommon.transformApiProductToViewManagedApiProduct(apiProduct, apiEnvironmentList, apiInfoList, apiAppEntityNameList));
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
