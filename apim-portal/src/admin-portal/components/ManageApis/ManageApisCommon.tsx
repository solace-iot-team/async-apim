import { APIInfo } from '@solace-iot-team/apim-connector-openapi-browser';

export type TManagedObjectId = string;
export type TViewApiObject = string;

export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  apiObject: TViewApiObject,
  apiInfo: APIInfo,
  globalSearch: string
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_API = "API_DELETE_API",
  API_GET_API_NAME_LIST = "API_GET_API_NAME_LIST",
  API_CREATE_API = "API_CREATE_API",
  API_GET_API = "API_GET_API",
  API_UPDATE_API = "API_UPDATE_API",
  API_IMPORT_API = "API_IMPORT_API",
  FILE_UPLOAD_API = "FILE_UPLOAD_API",
  API_GET_EVENT_API_PRODUCT = 'API_GET_EVENT_API_PRODUCT'
}

export enum E_EVENT_PORTAL_CALL_STATE_ACTIONS {
  API_GET_EVENT_API_PRODUCT_LIST = "API_GET_EVENT_API_PRODUCT_LIST",
  // API_GET_ASYNC_API_SPEC = "API_GET_ASYNC_API_SPEC",
  SELECT_EVENT_API_PRODUCT = "SELECT_EVENT_API_PRODUCT",
}

// export class ManageApisCommon {


// }
