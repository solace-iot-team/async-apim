import { TAPConfigContext  } from './ConfigContextProvider';
import { TAPRbacRole, TAPRbacRoleList } from '../../utils/APRbac';
import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import { 
  ApsConfigService,
  APSConnector, 
  EAPSAuthRole, 
  EAPSAuthRoleList,
  ApiError as APSApiError
} from '@solace-iot-team/apim-server-openapi-browser';
import { APSClientOpenApi } from '../../utils/APSClientOpenApi';

export class ConfigHelper {

  public static getSortedRbacRoleList = (configContext: TAPConfigContext): TAPRbacRoleList => {
    let rbacRoleList: TAPRbacRoleList = [];
    configContext.rbacRoleList.forEach( (rbacRole: TAPRbacRole) => {
      if(rbacRole.role !== EAPSAuthRole.ROOT) rbacRoleList.push(rbacRole);
    });
    return rbacRoleList.sort( (e1: TAPRbacRole, e2: TAPRbacRole) => {
      if(e1.displayName < e2.displayName) return -1;
      if(e1.displayName > e2.displayName) return 1;
      return 0;
    });
  }

  public static getAuthorizedRolesDisplayNameList = (authorizedRoleList: EAPSAuthRoleList, configContext: TAPConfigContext): Array<string> => {
    const funcName = 'getAuthorizedRolesDisplayNameList';
    const logName = `${ConfigHelper.name}.${funcName}()`;
    let rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedRbacRoleList(configContext);
    let authorizedRolesDisplayNameList: Array<string> = [];
    authorizedRoleList.forEach( (authorizedRole: EAPSAuthRole) => {
      let rbacRole: TAPRbacRole | undefined = rbacRoleList.find((rbacRole: TAPRbacRole) => {
        return (rbacRole.role === authorizedRole)
      });
      if(rbacRole) authorizedRolesDisplayNameList.push(rbacRole.displayName);
      else throw new Error(`${logName}: cannot find configured role for authorized role=${authorizedRole}`);
    });
    return authorizedRolesDisplayNameList;
  }

  public static getActiveConnectorInstance = async(): Promise<APSConnector | undefined> => {
    const funcName: string = `getActiveConnectorInstance`;
    const logName: string = `${ConfigHelper.name}.${funcName}()`
    let callState: TApiCallState = ApiCallState.getInitialCallState(logName, `get active connector config`);
    try {
      try {
        const activeConnector: APSConnector = await ApsConfigService.getActiveApsConnector();
        return activeConnector;
      } catch (e) {
        if(APSClientOpenApi.isInstanceOfApiError(e)) {
          const apiError: APSApiError = e;
          APSClientOpenApi.logError(logName, e);
          if (apiError.status === 404) {
            return undefined;
          } else throw e;
        } else throw e;
      }
    } catch(e) {
      APSClientOpenApi.logError(logName, e);
      callState.success = false;
      callState.isAPSApiError = APSClientOpenApi.isInstanceOfApiError(e);
      callState.error = e;
    }
  }

}