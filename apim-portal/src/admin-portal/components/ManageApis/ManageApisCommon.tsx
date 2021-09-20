import { APIInfo } from '@solace-iot-team/platform-api-openapi-client-fe';

export type TManagedObjectId = string;
export type TViewApiObject = string;

export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  apiObject: TViewApiObject,
  apiInfo: APIInfo
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_API = "API_DELETE_API",
  API_GET_API_NAME_LIST = "API_GET_API_NAME_LIST",
  API_CREATE_API = "API_CREATE_API",
  API_GET_API = "API_GET_API",
  API_UPDATE_API = "API_UPDATE_API",
}

// export class ManageApisCommon {


// }
