import { 
  APSOrganizationAuthRoleList,
  APSOrganizationRoles,
  APSSystemAuthRoleList,
  APSUser,
  EAPSSystemAuthRole
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { CAPSAuthRoleNone, EAPSDefaultAuthRole, TAPRbacRole } from '../utils/APRbac';
import { EUIAdminPortalResourcePaths, EUICombinedResourcePaths, EUIDeveloperPortalResourcePaths, Globals } from '../utils/Globals';
import { TAPConfigContext } from '../components/ConfigContextProvider/ConfigContextProvider';
import { TAPAuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { TUserContext } from "../components/UserContextProvider/UserContextProvider";

export class AuthHelper {

  public static getEmptyAuthContext = (): TAPAuthContext => {
    return {
      isLoggedIn: false,
      authorizedResourcePathsAsString: CAPSAuthRoleNone
    }
  }

  public static getAuthorizedResourcePathListAsString = (configContext: TAPConfigContext, userContext: TUserContext): string => {
    const funcName = 'getAuthorizedResourcePathListAsString';
    const logName = `${AuthHelper.name}.${funcName}()`;

    if(configContext.rbacRoleList === undefined) return CAPSAuthRoleNone;
    const apsUser: APSUser = userContext.user;

    const combinedUiResourcePathList: Array<EUICombinedResourcePaths> = [];

    const defaultRoles: Array<EAPSDefaultAuthRole> = [EAPSDefaultAuthRole.DEFAULT];
    for(const defaultRole of defaultRoles) {
      const rbacRole: TAPRbacRole | undefined = configContext.rbacRoleList?.find((rbacRole: TAPRbacRole) => {
        return (rbacRole.id === defaultRole)
      });
      if(rbacRole === undefined) throw new Error(`${logName}: cannot find defaultRole=${defaultRole} in rbac roles=${JSON.stringify(configContext.rbacRoleList, null, 2)}`);
      combinedUiResourcePathList.push(...rbacRole.uiResourcePaths);
    }

    const systemRoles: APSSystemAuthRoleList = apsUser.systemRoles ? apsUser.systemRoles : [];
    let organizationRoles: APSOrganizationAuthRoleList = [];
    if(userContext.runtimeSettings.currentOrganizationName) {
      const found = apsUser.memberOfOrganizations?.find((memberOfOrganization: APSOrganizationRoles) => {
        return (memberOfOrganization.organizationId === userContext.runtimeSettings.currentOrganizationName)
      });
      if(!found) throw new Error(`${logName}: cannot find userContext.runtimeSettings.currentOrganizationName=${userContext.runtimeSettings.currentOrganizationName} in apsUser.memberOfOrganizations=${JSON.stringify(apsUser.memberOfOrganizations, null, 2)}`);
      organizationRoles = found.roles;
    }
    // if(systemRoles.length === 0 && organizationRoles.length ===0) return CAPSAuthRoleNone;
    
    systemRoles.forEach((systemRole: EAPSSystemAuthRole) => {
      const rbacRole: TAPRbacRole | undefined = configContext.rbacRoleList?.find((rbacRole: TAPRbacRole) => {
        return (rbacRole.id === systemRole)  
      });
      if(rbacRole === undefined) throw new Error(`${logName}: cannot find systemRole=${systemRole} in rbac roles=${JSON.stringify(configContext.rbacRoleList, null, 2)}`);
      combinedUiResourcePathList.push(...rbacRole.uiResourcePaths);
    });

    for(const orgRole of organizationRoles) {
      const rbacRole: TAPRbacRole | undefined = configContext.rbacRoleList?.find((rbacRole: TAPRbacRole) => {
        return (rbacRole.id === orgRole)  
      });
      if(rbacRole === undefined) throw new Error(`${logName}: cannot find orgRole=${orgRole} in rbac roles=${JSON.stringify(configContext.rbacRoleList, null, 2)}`);
      combinedUiResourcePathList.push(...rbacRole.uiResourcePaths);  
    }      
    if(combinedUiResourcePathList.length === 0) throw new Error(`${logName}: cannot find any uiResourcePaths for any of the user roles=${JSON.stringify(apsUser, null, 2)} in rbac roles`);
    // de-dup resource paths
    const uniqueCombinedcResourcePathList: Array<EUICombinedResourcePaths> = Globals.deDuplicateStringList(combinedUiResourcePathList) as Array<EUICombinedResourcePaths>;
    // console.log(`${logName}: uniqueCombinedcResourcePathList = ${JSON.stringify(uniqueCombinedcResourcePathList)}`);
    return uniqueCombinedcResourcePathList.join(',');
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