import { 
  App
} from '@solace-iot-team/apim-connector-openapi-browser';
import { Globals } from '../../../utils/Globals';

export type TManagedObjectId = string;

export type TViewApiObject = App;

export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  globalSearch: string,
  apiObject: TViewApiObject,
}

export enum E_CALL_STATE_ACTIONS {
  API_GET_USER_APP_LIST = "API_GET_USER_APP_LIST",
  API_DELETE_USER_APP = "API_DELETE_USER_APP",
  API_CREATE_USER_APP = "API_CREATE_USER_APP",
  API_GET_USER_APP = "API_GET_USER_APP",
  API_UPDATE_USER_APP = "API_UPDATE_USER_APP",
  API_CREATE_DEVELOPER = "API_CREATE_DEVELOPER",
  API_GET_PRODUCT_LIST = "API_GET_PRODUCT_LIST",
  SELECT_API_PRODUCTS = "SELECT_API_PRODUCTS"
}
