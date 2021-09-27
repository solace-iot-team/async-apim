import { 
  APIProduct, 
  EnvironmentResponse, 
  Protocol 
} from '@solace-iot-team/apim-connector-openapi-browser';

import { Globals } from '../../../utils/Globals';
import { TApiAttribute } from '../DeveloperPortalCommon';

export enum E_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_LIST_VIEW = "MANAGED_OBJECT_LIST_LIST_VIEW",
  MANAGED_OBJECT_LIST_GRID_VIEW = "MANAGED_OBJECT_LIST_GRID_VIEW",
  MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW"
}

export type TManagedObjectId = string;

export type TViewApiObject = APIProduct;

export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  globalSearch: string,
  apiObject: TViewApiObject,
  apiEnvironmentList: Array<EnvironmentResponse> 
}

// export type TApiAttribute = {
//   name: string,
//   value: string
// }

export enum E_CALL_STATE_ACTIONS {
  API_GET_PRODUCT_LIST = 'API_GET_PRODUCT_LIST',
  API_GET_PRODUCT = "API_GET_PRODUCT",
  API_GET_API = "API_GET_API"
}

export class DeveloperPortalCatgalogCommon {

  private static generateGlobalSearchContent = (viewApiObject: TViewApiObject): string => {
    const filteredViewApiObject = {
      ...viewApiObject,
    }
    return Globals.generateDeepObjectValuesString(filteredViewApiObject);
  }

  // public static getApiDisplayNameListAsString = (apiDisplayNameList: string[] ): string => {
  //   if(apiDisplayNameList) return apiDisplayNameList.join(', ');
  //   else return '';
  // }

  // public static getProtocolListAsString = (protocolList?: Protocol[] ): string => {
  //   if(protocolList) {
  //     let _protocolList: Array<string> = [];
  //     protocolList.forEach( (protocol: Protocol) => {
  //       _protocolList.push(`${protocol.name}(${protocol.version})`);
  //     });
  //     return _protocolList.join(', ');
  //   }
  //   else return '';
  // }

  public static getAttributeInfoAsString = (attributeList?: Array<TApiAttribute>): string => {
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

  // public static getAttributeNamesAsString = (attributeList?: Array<TApiAttribute>): string => {
  //   if(attributeList) {
  //     let _attributeList: Array<string> = [];
  //     attributeList.forEach( (attribute: TApiAttribute) => {
  //       _attributeList.push(`${attribute.name}`);
  //     });
  //     return _attributeList.join(', ');
  //   }
  //   else return '';
  // }

  // public static getEnvironmentsAsString = (viewApiObject: TViewApiObject, apiEnvironmentList: Array<EnvironmentResponse>): string => {
  //   const funcName = 'getEnvironmentsAsString';
  //   const logName = `${DeveloperPortalCatgalogCommon.name}.${funcName}()`;
  //   let _environmentStrList: Array<string> = [];
  //   viewApiObject.environments?.forEach( (environmentName: string) => {
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

  // public static getEnvironmentsAsDisplayList = (viewApiObject: TViewApiObject, apiEnvironmentList: Array<EnvironmentResponse>): Array<string> => {
  //   const funcName = 'getEnvironmentsAsDisplayList';
  //   const logName = `${DeveloperPortalCatgalogCommon.name}.${funcName}()`;
  //   let _environmentStrList: Array<string> = [];
  //   viewApiObject.environments?.forEach( (environmentName: string) => {
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

  public static transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject, apiEnvironmentList: Array<EnvironmentResponse>): TViewManagedObject => {
    return {
      id: viewApiObject.name,
      displayName: viewApiObject.displayName ? viewApiObject.displayName : viewApiObject.name,
      globalSearch: DeveloperPortalCatgalogCommon.generateGlobalSearchContent(viewApiObject),
      apiObject: viewApiObject,
      apiEnvironmentList: apiEnvironmentList
    }
  }

}
