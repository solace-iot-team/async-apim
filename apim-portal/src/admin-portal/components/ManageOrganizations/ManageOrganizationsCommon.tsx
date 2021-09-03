import React from 'react';

import { 
  Organization, 
} from '@solace-iot-team/platform-api-openapi-client-fe';

import { Globals } from '../../../utils/Globals';

export type TManagedObjectId = string;

export type TViewApiObject = Organization;

export type TViewManagedObjectHasInfo = {
  hasEnvironments: boolean,
  hasApis: boolean,
  hasApiProducts: boolean,
  hasDevelopers: boolean,
  hasApps: boolean
}

export type TViewManagedObject = {
  type: string,
  id: string,
  displayName: string,
  globalSearch: string,
  hasInfo?: TViewManagedObjectHasInfo,
  apiObject: TViewApiObject
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_ORGANIZATION = "API_DELETE_ORGANIZATION",
  API_GET_ORGANIZATION_LIST = "API_GET_ORGANIZATION_LIST",
  API_CREATE_ORGANIZATION = "API_CREATE_ORGANIZATION",
  API_GET_ORGANIZATION = "API_GET_ORGANIZATION",
  API_UPDATE_ORGANIZATION = "API_UPDATE_ORGANIZATION",
}

export class ManageOrganizationsCommon {

  private static generateGlobalSearchContent = (viewApiObject: TViewApiObject): string => {
    const filteredViewApiObject = {
      ...viewApiObject,
      'cloud-token': ''
    }
    return Globals.generateDeepObjectValuesString(filteredViewApiObject);
  }

  public static transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject, hasInfo?: TViewManagedObjectHasInfo): TViewManagedObject => {
    return {
      type: 'solace-cloud',
      id: viewApiObject.name,
      displayName: viewApiObject.name,
      globalSearch: ManageOrganizationsCommon.generateGlobalSearchContent(viewApiObject),
      apiObject: viewApiObject,
      hasInfo: hasInfo
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

  private static hasBodyTemplate = (has: boolean) => {
    if (has) return (<span className={`pi pi-check manage-organizations has-badge`} />)
    else return (<span className={`pi pi-minus manage-organizations has-badge`} />)
  }

  public static hasEnvironmentsBodyTemplate = (viewManagedObject: TViewManagedObject) => {
    return ManageOrganizationsCommon.hasBodyTemplate(viewManagedObject.hasInfo?.hasEnvironments ? true : false);
  } 

  public static hasApisBodyTemplate = (viewManagedObject: TViewManagedObject) => {
    return ManageOrganizationsCommon.hasBodyTemplate(viewManagedObject.hasInfo?.hasApis ? true : false);
  } 

  public static hasApiProductsBodyTemplate = (viewManagedObject: TViewManagedObject) => {
    return ManageOrganizationsCommon.hasBodyTemplate(viewManagedObject.hasInfo?.hasApiProducts ? true : false);
  } 

  public static hasDevelopersBodyTemplate = (viewManagedObject: TViewManagedObject) => {
    return ManageOrganizationsCommon.hasBodyTemplate(viewManagedObject.hasInfo?.hasDevelopers ? true : false);
  } 

  public static hasAppsBodyTemplate = (viewManagedObject: TViewManagedObject) => {
    return ManageOrganizationsCommon.hasBodyTemplate(viewManagedObject.hasInfo?.hasApps ? true : false);
  }

  public static viewManagedObjectHasContent = (viewManagedObject: TViewManagedObject) => {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { hasInfo, ...rest } = viewManagedObject;
    if( hasInfo ) {
      return (hasInfo.hasEnvironments || hasInfo.hasApis || hasInfo.hasApiProducts || hasInfo.hasDevelopers || hasInfo.hasApps)
    } else return false;
  }


}
