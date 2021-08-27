// import { TAuthRoleList } from '../components/Components.types'
// import { delete_EAPSAuthRole } from '../utils/APSClient.types';
import { TAPConfigContext } from '../components/ConfigContextProvider/ConfigContextProvider';
import { TAPAuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { CAPSAuthRoleNone, TAPRbacRole } from '../utils/APRbac';
import { EUIResourcePaths } from '../utils/Globals';
import { EAPSAuthRole, EAPSAuthRoleList } from '@solace-iot-team/apim-server-openapi-browser';

export class AuthHelper {

  public static getEmptyAuthContext = (): TAPAuthContext => {
    return {
      isLoggedIn: false,
      authorizedResourcePathsAsString: CAPSAuthRoleNone
    }
  }

  public static getAuthorizedResourcePathListAsString = (configContext: TAPConfigContext, authorizedRoles: EAPSAuthRoleList | undefined): string => {
    const funcName = 'getAuthorizedResourcePathListAsString';
    const logName = `${AuthHelper.name}.${funcName}()`;

    if(configContext.rbacRoleList === undefined) return CAPSAuthRoleNone;
    if(authorizedRoles === undefined) return CAPSAuthRoleNone;
    let combinedUiResourcePathList: Array<EUIResourcePaths> = [];
    authorizedRoles.forEach((authorizedRole: EAPSAuthRole) => {
      let rbacRole: TAPRbacRole | undefined = configContext.rbacRoleList?.find((rbacRole: TAPRbacRole) => {
        // console.log(`${logName}: find authorizedRole=${authorizedRole} in configRole = ${JSON.stringify(configRole)}`);
        return (rbacRole.role === authorizedRole)  
      });
      if(rbacRole === undefined) throw new Error(`${logName}: cannot find authorizedRole=${authorizedRole} in rbac roles`);
      combinedUiResourcePathList.push(...rbacRole.uiResourcePaths);
    }); 
    // console.log(`${logName}: combinedUiResourcePathList = ${JSON.stringify(combinedUiResourcePathList)}`);
    if(combinedUiResourcePathList.length === 0) throw new Error(`${logName}: cannot find any uiResourcePaths for any of the authorizedRoles=${JSON.stringify(authorizedRoles)} in rbac roles`);
    return combinedUiResourcePathList.join(',');
  }

  public static isAuthorizedToAccessResource = (authorizedResourcePathListString: string, resourcePath: string): boolean => {
    const funcName = 'isAuthorizedToAccessResource';
    const logName = `${AuthHelper.name}.${funcName}()`;
    // console.log(`${logName}: authorizedResourcePathListString=${authorizedResourcePathListString}, resourcePath=${resourcePath}`);
    return (authorizedResourcePathListString.match(resourcePath) !== null);
  }

}