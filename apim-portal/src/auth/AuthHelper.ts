import { CAPSAuthRoleNone } from '../utils/APRbac';
import { EUIAdminPortalResourcePaths, EUIDeveloperPortalResourcePaths } from '../utils/Globals';
import { TAPAuthContext } from '../components/AuthContextProvider/AuthContextProvider';

export class AuthHelper {

  public static getEmptyAuthContext = (): TAPAuthContext => {
    return {
      isLoggedIn: false,
      authorizedResourcePathsAsString: CAPSAuthRoleNone
    }
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