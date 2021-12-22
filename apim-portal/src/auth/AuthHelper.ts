import { 
  EAPSAuthRole, 
  EAPSAuthRoleList 
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { CAPSAuthRoleNone, TAPRbacRole } from '../utils/APRbac';
import { EUIAdminPortalResourcePaths, EUICombinedResourcePaths, EUIDeveloperPortalResourcePaths } from '../utils/Globals';
import { TAPConfigContext } from '../components/ConfigContextProvider/ConfigContextProvider';
import { TAPAuthContext } from '../components/AuthContextProvider/AuthContextProvider';

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
    let combinedUiResourcePathList: Array<EUICombinedResourcePaths> = [];
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
    // const funcName = 'isAuthorizedToAccessResource';
    // const logName = `${AuthHelper.name}.${funcName}()`;
    // console.log(`${logName}: authorizedResourcePathListString=${authorizedResourcePathListString}, resourcePath=${resourcePath}`);
    return (authorizedResourcePathListString.match(resourcePath) !== null);
  }

  public static isAuthorizedToAccessAdminPortal = (authorizedResourcePathListString: string): boolean => {
    return AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathListString, EUIAdminPortalResourcePaths.Home);
  }

  public static isAuthorizedToAccessDeveloperPortal = (authorizedResourcePathListString: string): boolean => {
    return AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathListString, EUIDeveloperPortalResourcePaths.Home);
  }

}