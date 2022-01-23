import { 
  EAPSAuthRole,
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { EUIDeveloperPortalResourcePaths, EUIAdminPortalResourcePaths, EUICommonResourcePaths } from "./Globals"

export const CAPSAuthRoleNone = '';

export enum  EAPRbacRoleScope {
  NEVER = "NEVER",
  SYSTEM = "SYSTEM",
  ORG = "ORG",
}
export type TAPRbacRole = {
  id: EAPSAuthRole;
  displayName: string;
  description: string;
  uiResourcePaths: Array<EUICommonResourcePaths | EUIAdminPortalResourcePaths | EUIDeveloperPortalResourcePaths>;
  scopeList: Array<EAPRbacRoleScope>;
}

export type TAPRbacRoleList = Array<TAPRbacRole>;

const rbacRoleList: TAPRbacRoleList = [
  {
    id: EAPSAuthRole.ROOT,
    scopeList: [EAPRbacRoleScope.NEVER],
    displayName: 'Root',
    description: 'Root priviliges.',
    uiResourcePaths: [
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.ManageSystemUsers, 
      EUIAdminPortalResourcePaths.LoginAs,
      EUIAdminPortalResourcePaths.ManageSystemConfigConnectors,
      EUIAdminPortalResourcePaths.ManageSystemConfigSettings,
      EUIAdminPortalResourcePaths.MonitorSystemHealth,
    ]
  },
  {
    id: EAPSAuthRole.LOGIN_AS,
    scopeList: [EAPRbacRoleScope.SYSTEM, EAPRbacRoleScope.ORG],
    displayName: 'Login As',
    description: 'Login as any User.',
    uiResourcePaths: [
      EUIAdminPortalResourcePaths.LoginAs
    ]
  },
  {
    id: EAPSAuthRole.SYSTEM_ADMIN,
    scopeList: [EAPRbacRoleScope.SYSTEM],
    displayName: 'System Admin',
    description: 'Administrate the System.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.UserHome,
      EUIAdminPortalResourcePaths.ManageSystemUsers,
      EUIAdminPortalResourcePaths.ManageSystemTeams,
      EUIAdminPortalResourcePaths.ManageSystemOrganizations,
      EUIAdminPortalResourcePaths.ManageSystemConfigConnectors,
      EUIAdminPortalResourcePaths.ManageSystemConfigSettings,
      EUIAdminPortalResourcePaths.MonitorSystemHealth,
    ]
  },
  {
    id: EAPSAuthRole.ORGANIZATION_ADMIN,
    scopeList: [EAPRbacRoleScope.SYSTEM, EAPRbacRoleScope.ORG],
    displayName: 'Organization Admin',
    description: 'Administrate the Organization.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.UserHome,
      EUIAdminPortalResourcePaths.ManageOrganizationEnvironments,
      EUIAdminPortalResourcePaths.ManageOrganizationUsers,
      EUIAdminPortalResourcePaths.ManageOrganizationSettings,
    ]
  },
  {
    id: EAPSAuthRole.API_TEAM,
    scopeList: [EAPRbacRoleScope.SYSTEM, EAPRbacRoleScope.ORG],
    displayName: 'API Team',
    description: 'Manage APIs, API Products, Apps, API Consumers.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.UserHome,
      EUIAdminPortalResourcePaths.ManageOrganizationApis,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts,
      EUIAdminPortalResourcePaths.ManageOrganizationApps,
    ]
  },
  {
    id: EAPSAuthRole.API_CONSUMER,
    scopeList: [EAPRbacRoleScope.SYSTEM, EAPRbacRoleScope.ORG],
    displayName: 'API Consumer',
    description: 'Consume APIs, manage individual and team Apps.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIDeveloperPortalResourcePaths.Home,
      EUIDeveloperPortalResourcePaths.UserHome,
      EUIDeveloperPortalResourcePaths.ExploreApis,
      EUIDeveloperPortalResourcePaths.ExploreApiProducts,
      EUIDeveloperPortalResourcePaths.ManageUserApplications,
      EUIDeveloperPortalResourcePaths.ManageTeamApplications,
    ]
  }
];


export class APRbac {

  private static checkRoleDefinitions = () => {
    const funcName: string = `checkRoleDefinitions`;
    const logName: string = `${APRbac.name}.${funcName}()`;

    Object.values(EAPSAuthRole).forEach( (apsRole: string) => {
      // console.log(`${logName}: apsRole=${apsRole}`);
      const found: TAPRbacRole | undefined = rbacRoleList.find( (apRbacRole: TAPRbacRole) => {
        // console.log(`${logName}: apsRole=${apsRole}, apRbacRole.role=${apRbacRole.id}`);
        return (apsRole === apRbacRole.id);
      });
      if (!found) throw new Error(`${logName}: EAPAuthRole in OpenApi spec not found in rbacRoleList: ${apsRole}`);
    });
  }

  public static getAPRbacRoleList = (): TAPRbacRoleList => {
    APRbac.checkRoleDefinitions();
    return rbacRoleList;
  }

  public static getByRole = (apsRole: EAPSAuthRole): TAPRbacRole => {
    const funcName: string = `getByRole`;
    const logName: string = `${APRbac.name}.${funcName}()`;
    const found: TAPRbacRole | undefined = rbacRoleList.find( (apRbacRole: TAPRbacRole) => {
      return (apRbacRole.id === apsRole);
    });
    if (!found) throw new Error(`${logName}: EAPAuthRole in OpenApi spec not found in rbacRoleList: ${apsRole}`);
    return found;
  }

}