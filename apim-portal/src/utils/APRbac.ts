import { 
  EAPSSystemAuthRole,
  EAPSOrganizationAuthRole,
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { EUIDeveloperPortalResourcePaths, EUIAdminPortalResourcePaths, EUICommonResourcePaths } from "./Globals"

export const CAPSAuthRoleNone = '';

export enum EAPSDefaultAuthRole {
  DEFAULT = 'default',
}
export type EAPSCombinedAuthRole = EAPSDefaultAuthRole | EAPSSystemAuthRole | EAPSOrganizationAuthRole;

export enum  EAPRbacRoleScope {
  NEVER = "NEVER",
  SYSTEM = "SYSTEM",
  ORG = "ORG",
}
export type TAPRbacRole = {
  id: EAPSCombinedAuthRole;
  displayName: string;
  description: string;
  uiResourcePaths: Array<EUICommonResourcePaths | EUIAdminPortalResourcePaths | EUIDeveloperPortalResourcePaths>;
  scopeList: Array<EAPRbacRoleScope>;
}

export type TAPRbacRoleList = Array<TAPRbacRole>;

const rbacRoleList: TAPRbacRoleList = [
  {
    id: EAPSSystemAuthRole.ROOT,
    scopeList: [EAPRbacRoleScope.NEVER],
    displayName: 'Root',
    description: 'Root priviliges.',
    uiResourcePaths: [
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.ManageSystemUsers, 
      EUIAdminPortalResourcePaths.ManageSystemOrganizations,
      EUIAdminPortalResourcePaths.LoginAs,
      EUIAdminPortalResourcePaths.ManageSystemConfigConnectors,
      EUIAdminPortalResourcePaths.ManageSystemConfigSettings,
      EUIAdminPortalResourcePaths.MonitorSystemHealth,
    ]
  },
  {
    // every user will get access to the default resources, except root
    id: EAPSDefaultAuthRole.DEFAULT,
    // scopeList: [EAPRbacRoleScope.SYSTEM, EAPRbacRoleScope.ORG],
    scopeList: [EAPRbacRoleScope.NEVER],
    displayName: 'default',
    description: 'default',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
    ]
  },
  {
    id: EAPSSystemAuthRole.LOGIN_AS,
    scopeList: [EAPRbacRoleScope.SYSTEM, EAPRbacRoleScope.ORG],
    displayName: 'Login As',
    description: 'Login as any User.',
    uiResourcePaths: [
      EUIAdminPortalResourcePaths.LoginAs
    ]
  },
  {
    id: EAPSSystemAuthRole.SYSTEM_ADMIN,
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
    id: EAPSOrganizationAuthRole.ORGANIZATION_ADMIN,
    scopeList: [EAPRbacRoleScope.ORG],
    displayName: 'Organization Admin',
    description: 'Administrate the Organization.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.UserHome,
      EUIAdminPortalResourcePaths.ManageOrganizationEnvironments,
      EUIAdminPortalResourcePaths.ManageOrganizationUsers,
      EUIAdminPortalResourcePaths.ManageOrganizationSettings,
      EUIAdminPortalResourcePaths.MonitorOrganizationStatus,
    ]
  },
  {
    id: EAPSOrganizationAuthRole.API_TEAM,
    scopeList: [EAPRbacRoleScope.ORG],
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
    id: EAPSOrganizationAuthRole.API_CONSUMER,
    scopeList: [EAPRbacRoleScope.ORG],
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

    Object.values(EAPSSystemAuthRole).forEach( (apsRole: string) => {
      // console.log(`${logName}: apsRole=${apsRole}`);
      const found: TAPRbacRole | undefined = rbacRoleList.find( (apRbacRole: TAPRbacRole) => {
        // console.log(`${logName}: apsRole=${apsRole}, apRbacRole.role=${apRbacRole.id}`);
        return (apsRole === apRbacRole.id);
      });
      if (!found) throw new Error(`${logName}: EAPSSystemAuthRole=${apsRole} in OpenApi spec not found in rbacRoleList=${JSON.stringify(rbacRoleList, null, 2)}`);
    });
    Object.values(EAPSOrganizationAuthRole).forEach( (apsRole: string) => {
      // console.log(`${logName}: apsRole=${apsRole}`);
      const found: TAPRbacRole | undefined = rbacRoleList.find( (apRbacRole: TAPRbacRole) => {
        // console.log(`${logName}: apsRole=${apsRole}, apRbacRole.role=${apRbacRole.id}`);
        return (apsRole === apRbacRole.id);
      });
      if (!found) throw new Error(`${logName}: EAPSOrganizationAuthRole=${apsRole} in OpenApi spec not found in rbacRoleList=${JSON.stringify(rbacRoleList, null, 2)}`);
    });

  }

  public static getAPRbacRoleList = (): TAPRbacRoleList => {
    APRbac.checkRoleDefinitions();
    return rbacRoleList;
  }

  public static getByRole = (apsRole: EAPSCombinedAuthRole): TAPRbacRole => {
    const funcName: string = `getByRole`;
    const logName: string = `${APRbac.name}.${funcName}()`;
    const found: TAPRbacRole | undefined = rbacRoleList.find( (apRbacRole: TAPRbacRole) => {
      return (apRbacRole.id === apsRole);
    });
    if (!found) throw new Error(`${logName}: apsRoles=${apsRole} in OpenApi spec not found in rbacRoleList=${JSON.stringify(rbacRoleList, null, 2)}`);
    return found;
  }

}