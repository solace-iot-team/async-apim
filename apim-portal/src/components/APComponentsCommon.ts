import { DataTableSortOrderType } from 'primereact/datatable';
import { EAPSSortDirection } from '@solace-iot-team/apim-server-openapi-browser';
import { 
  ClientInformationGuaranteedMessaging, 
  CommonDisplayName, 
  CommonName 
} from '@solace-iot-team/apim-connector-openapi-browser';

export type TAPApiCallState = {
  success: boolean;
  isApiError?: boolean;
  error?: any;
  context: {
    action: string;
    userDetail: string;
  }  
}
export type TAPUserMessage = {
  success: boolean,
  context: {
    internalAction: string,
    userAction: string,
    userMessage: string
  }
}
export type TAPOrganization = {
  displayName: string,
  name: TAPOrganizationId,
  type: string,
  solaceCloudToken?: string,
  hasEnvironments: boolean,
  hasApis: boolean,
  hasApiProducts: boolean,
  hasDevelopers: boolean,
  hasApps: boolean
}
export type TAPOrganizationList = Array<TAPOrganization>;
export type TAPOrganizationId = string;
export type TAPOrganizationIdList = Array<TAPOrganizationId>;
export type TAPEnvironmentName = string;
export enum EAPAsyncApiSpecFormat {
  JSON = 'application/json',
  YAML = 'application/x-yaml',
  UNKNOWN = 'application/x-unknown'
}
export type TAPAsyncApiSpec = {
  format: EAPAsyncApiSpecFormat,
  spec: any
}

export type TAPAppClientInformation = {
  guaranteedMessaging: ClientInformationGuaranteedMessaging
  apiProductName: CommonName,
  apiProductDisplayName: CommonDisplayName
}
export type TAPAppClientInformationList = Array<TAPAppClientInformation>;

export type TAPLazyLoadingTableParameters = {
  isInitialSetting: boolean, // differentiate between first time and subsequent times
  first: number, // index of the first row to be displayed
  rows: number, // number of rows to display per page
  page: number,
  sortField: string,
  sortOrder: DataTableSortOrderType
}

export type TApiEntitySelectItem = {
  id: string,
  displayName: string
}
export type TApiEntitySelectItemList = Array<TApiEntitySelectItem>;
export type TApiEntitySelectItemIdList = Array<string>;

export enum EFileDownloadType {
  JSON='application/json',
  YAML='application/x-yaml'
}
export enum EFileExtension {
  JSON='json',
  YAML='yaml'
}

export class APComponentsCommon {

  public static transformTableSortDirectionToApiSortDirection = (tableSortDirection: DataTableSortOrderType): EAPSSortDirection => {
    return tableSortDirection === 1 ? EAPSSortDirection.ASC : EAPSSortDirection.DESC;
  }

  public static transformSelectItemListToSelectItemIdList = (selectItemList: TApiEntitySelectItemList): TApiEntitySelectItemIdList => {
    return selectItemList.map( (selectItem: TApiEntitySelectItem) => {
      return selectItem.id;
    });
  }
  
}
