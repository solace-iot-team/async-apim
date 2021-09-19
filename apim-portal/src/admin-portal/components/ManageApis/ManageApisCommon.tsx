// import { 
//   API
// } from '@solace-iot-team/platform-api-openapi-client-fe';
import { Globals } from '../../../utils/Globals';
import { ConfigHelper } from '../../../components/ConfigContextProvider/ConfigHelper';
import { TAPConfigContext } from '../../../components/ConfigContextProvider/ConfigContextProvider';

export type TManagedObjectId = string;

export type TViewApiObject = string;

export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  apiObject: TViewApiObject
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_API = "API_DELETE_API",
  API_GET_API_NAME_LIST = "API_GET_API_NAME_LIST",
  API_CREATE_API = "API_CREATE_API",
  API_GET_API = "API_GET_API",
  API_REPLACE_API = "API_REPLACE_API",
}

export class ManageApisCommon {


}
