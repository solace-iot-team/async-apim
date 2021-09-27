import { 
  APSUser,
  APSUserId, 
  ApsUsersService,
  APSUserUpdate,
} from '@solace-iot-team/apim-server-openapi-browser';
import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import { APSClientOpenApi } from '../../utils/APSClientOpenApi';

export type TManagedObjectId = APSUserId;
export type TManagedObject = APSUser;
export type TGetApiObject = APSUser;
export type TUpdateApiObject = APSUserUpdate;

export type TApiCallResult = {
  apiCallState: TApiCallState,
  managedObject?: TManagedObject 
}
export enum E_CALL_STATE_ACTIONS {
  API_GET_USER = "API_GET_USER",
  API_UPDATE_USER = "API_UPDATE_USER"
}

export class ManageUserAccountCommon {

  private static transformGetApiObjectToManagedObject = (getApiObject: TGetApiObject): TManagedObject => {
    return getApiObject;
  }

  public static apiGetManagedObject = async(managedObjectId: TManagedObjectId): Promise<TApiCallResult> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ManageUserAccountCommon.name}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${managedObjectId}`);
    let resultManagedObject: APSUser | undefined = undefined;
    try { 
      const apsUser: APSUser = await ApsUsersService.getApsUser({
        userId: managedObjectId
      });
      resultManagedObject = ManageUserAccountCommon.transformGetApiObjectToManagedObject(apsUser);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    return {
      apiCallState: callState,
      managedObject: resultManagedObject
    }
  }

  public static apiUpdateManagedObject = async(managedObjectId: TManagedObjectId, updateApiObject: TUpdateApiObject): Promise<TApiCallResult> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ManageUserAccountCommon.name}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER, `update user: ${managedObjectId}`);
    let resultManagedObject: APSUser | undefined = undefined;
    try { 
      const apsUser: APSUser = await ApsUsersService.updateApsUser({
        userId: managedObjectId, 
        requestBody: updateApiObject
      });
      resultManagedObject = apsUser;
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    return {
      apiCallState: callState,
      managedObject: resultManagedObject
    }
  }
}
