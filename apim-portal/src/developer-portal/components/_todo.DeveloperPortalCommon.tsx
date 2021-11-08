import { 
  ApiError,
  APIProduct, 
  ApiProductsService, 
  EnvironmentResponse, 
  EnvironmentsService, 
  Protocol 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPOrganizationId } from '../../components/APComponentsCommon';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import { APRenderUtils } from '../../utils/APRenderUtils';

import { Globals } from '../../utils/Globals';


export enum E_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_LIST_VIEW = "MANAGED_OBJECT_LIST_LIST_VIEW",
  MANAGED_OBJECT_LIST_GRID_VIEW = "MANAGED_OBJECT_LIST_GRID_VIEW",
  MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW"
}

export type TManagedObjectId = string;

export type TViewApiObject = APIProduct;

export type TApiProductName = string;
export type TApiProductNameList = Array<TApiProductName>;
export type TApiProductList = Array<APIProduct>;

export type TApiEnvironmentNameList = Array<string>;
export type TApiEnvironmentList = Array<EnvironmentResponse>;

export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  globalSearch: string,
  apiObject: TViewApiObject,
  apiEnvironmentList: Array<EnvironmentResponse> 
}

export type TApiAttribute = {
  name: string,
  value: string
}
export type TApiAttributeList = Array<TApiAttribute>;

export enum E_CALL_STATE_ACTIONS {
  API_GET_PRODUCT_LIST = 'API_GET_PRODUCT_LIST',
  API_GET_PRODUCT = "API_GET_PRODUCT",
  API_GET_API = "API_GET_API"
}

export class DeveloperPortalCommon {

  public static getApiDisplayNameListAsString = (apiDisplayNameList: string[] ): string => {
    if(apiDisplayNameList) return apiDisplayNameList.join(', ');
    else return '';
  }

  public static getProtocolListAsString = (protocolList?: Protocol[] ): string => {
    return APRenderUtils.getProtocolListAsString(protocolList);
  }

  public static getAttributeInfoAsString = (attributeList?: TApiAttributeList): string => {
    if(attributeList) {
      let _attributeList: Array<string> = [];
      attributeList.forEach( (attribute: TApiAttribute) => {
        const attributeStr: string = `${attribute.name}: ${attribute.value}`;
        _attributeList.push(attributeStr);
      });
      return _attributeList.join(' | ');
    }
    else return '';
  }

  public static getAttributeNamesAsString = (attributeList?: TApiAttributeList): string => {
    if(attributeList) {
      let _attributeList: Array<string> = [];
      attributeList.forEach( (attribute: TApiAttribute) => {
        _attributeList.push(`${attribute.name}`);
      });
      return _attributeList.join(', ');
    }
    else return '';
  }

  public static getEnvironmentsAsString = (apiEnvironmentList: TApiEnvironmentList, apiEnvironmentNameList?: TApiEnvironmentNameList): string => {
    const funcName = 'getEnvironmentsAsString';
    const logName = `${DeveloperPortalCommon.name}.${funcName}()`;
    if(!apiEnvironmentNameList) return '';
    let _environmentStrList: Array<string> = [];
    apiEnvironmentNameList.forEach( (environmentName: string) => {
      const envDetails = apiEnvironmentList.find( (environment: EnvironmentResponse) => {
        return environment.name === environmentName;
      });
      if(!envDetails) throw new Error(`${logName}: not envDetails for environmentName=${environmentName}`);
      _environmentStrList.push(
        `${envDetails.displayName} (${envDetails.datacenterProvider}:${envDetails.datacenterId})`
      );
    });
    return _environmentStrList.join(', ');
  }

  public static getEnvironmentsAsDisplayList = (apiEnvironmentList: TApiEnvironmentList, apiEnvironmentNameList?: TApiEnvironmentNameList): Array<string> => {
    const funcName = 'getEnvironmentsAsDisplayList';
    const logName = `${DeveloperPortalCommon.name}.${funcName}()`;
    if(!apiEnvironmentNameList) return [];
    let _environmentStrList: Array<string> = [];
    apiEnvironmentNameList.forEach( (environmentName: string) => {
      const envDetails = apiEnvironmentList.find( (environment: EnvironmentResponse) => {
        return environment.name === environmentName;
      });
      if(!envDetails) throw new Error(`${logName}: not envDetails for environmentName=${environmentName}`);
      _environmentStrList.push(
        `${envDetails.displayName} (${envDetails.datacenterProvider}:${envDetails.datacenterId})`
      );
    });
    return _environmentStrList;
  }

  // public static transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject, apiEnvironmentList: Array<EnvironmentResponse>): TViewManagedObject => {
  //   return {
  //     id: viewApiObject.name,
  //     displayName: viewApiObject.displayName ? viewApiObject.displayName : viewApiObject.name,
  //     globalSearch: DeveloperPortalCatgalogCommon.generateGlobalSearchContent(viewApiObject),
  //     apiObject: viewApiObject,
  //     apiEnvironmentList: apiEnvironmentList
  //   }
  // }

}

export type TManagedProductId = string;
export type TManagedApiProduct = {
  id: TManagedProductId,
  displayName: string,
  apiProduct: APIProduct,
  apiEnvironmentList: TApiEnvironmentList 
};
export type TManagedApiProductList = Array<TManagedApiProduct>;

export type TApiGetApiProductListResult = {
  apiCallState: TApiCallState,
  apiTotalCount?: number,
  managedApiProductList: TManagedApiProductList,
}
export class DeveloperPortalCommonApiCalls {

  private static transformApiProductToManagedProduct = (apiProduct: APIProduct, apiEnvironmentList: TApiEnvironmentList): TManagedApiProduct => {
    return {
      id: apiProduct.name,
      displayName: apiProduct.displayName ? apiProduct.displayName : apiProduct.name,
      apiProduct: apiProduct,
      apiEnvironmentList: apiEnvironmentList
    }
  }

  public static apiGetApiProductList = async(organizationId: TAPOrganizationId, initialApiCallState: TApiCallState, pageSize: number, pageNumber: number): Promise<TApiGetApiProductListResult> => {
    const funcName = 'apiGetApiProductList';
    const logName = `${DeveloperPortalCommonApiCalls.name}.${funcName}()`;
    let result: TApiGetApiProductListResult = {
      apiCallState: initialApiCallState,
      managedApiProductList: []
    };
    // let callState: TApiCallState = initialApiCallState;
    let anyError: any = undefined;
    let apiProductList: TApiProductList = [];
    let totalCount: number = 0;
    try {
      
      
      // apiProductList = await ApiProductsService.listApiProducts(organizationId, pageSize, pageNumber);


      apiProductList = await ApiProductsService.listApiProducts({
        organizationName: organizationId, 
        pageSize: pageSize, 
        pageNumber: pageNumber
      });

      totalCount = 1000; // should be returned by previous call
    } catch (e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status !== 404) anyError = e;
      } else anyError = e;
    }
    if(!anyError) {
      if(apiProductList.length > 0) {
        try { 
          let managedProductList: TManagedApiProductList = [];
          let apiEnvironmentList: TApiEnvironmentList = [];
          for(const apiProduct of apiProductList) {
            if(apiProduct.environments) {
              for(const apiEnvironmentName of apiProduct.environments) {
                const found = apiEnvironmentList.find( (environment: EnvironmentResponse) => {
                  return environment.name === apiEnvironmentName;
                });
                if(!found) {
                  
                  // const resp: EnvironmentResponse = await EnvironmentsService.getEnvironment(organizationId, apiEnvironmentName);

                  const resp: EnvironmentResponse = await EnvironmentsService.getEnvironment({
                    organizationName: organizationId, 
                    envName: apiEnvironmentName
                  });

                  apiEnvironmentList.push(resp);
                }
              }
            }
            managedProductList.push(DeveloperPortalCommonApiCalls.transformApiProductToManagedProduct(apiProduct, apiEnvironmentList));
          }  
          result.managedApiProductList = managedProductList;
        } catch(e: any) {
          anyError = e;
        }
      }
      result.apiTotalCount = totalCount;
    }
    if(anyError) {
      APClientConnectorOpenApi.logError(logName, anyError);
      result.apiCallState = ApiCallState.addErrorToApiCallState(anyError, initialApiCallState);
    }
    return result;
  }

}