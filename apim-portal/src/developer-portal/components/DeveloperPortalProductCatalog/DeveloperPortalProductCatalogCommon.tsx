import React from 'react';

import { APIProduct, Protocol } from '@solace-iot-team/platform-api-openapi-client-fe';
import { Globals } from '../../../utils/Globals';

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
  apiObject: TViewApiObject
}

type TAttribute = {
  name: string,
  value: string
}

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

  public static getApiDisplayNameListAsString = (apiDisplayNameList: string[] ): string => {
    if(apiDisplayNameList) return apiDisplayNameList.join(', ');
    else return '';
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

  public static getAttributeListAsString = (attributeList?: Array<TAttribute>): string => {
    if(attributeList) {
      let _attributeList: Array<string> = [];
      attributeList.forEach( (attribute: TAttribute) => {
        _attributeList.push(`${attribute.name}`);
      });
      return _attributeList.join(', ');
    }
    else return '';
  }

  public static transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject): TViewManagedObject => {
    // const funcName = 'transformViewApiObjectToViewManagedObject';
    // const logName = `${ManageUsersCommon.name}.${funcName}()`;
    return {
      id: viewApiObject.name,
      displayName: viewApiObject.name,
      globalSearch: DeveloperPortalCatgalogCommon.generateGlobalSearchContent(viewApiObject),
      apiObject: viewApiObject
    }
  }

  public static renderSubComponentHeader = (header: string): JSX.Element => {
    return (
      <React.Fragment>
        <h3>{header}</h3>
        {/* <Divider/> */}
      </React.Fragment>
    )
  }

  // public static isActiveBodyTemplate = (managedObject: TViewManagedObject) => {
  //   if (managedObject.apiObject.isActivated) return (<span className="pi pi-check badge-active" />)
  //   else return (<span className="pi pi-times badge-active" />)
  // }


}
