import { EAPSAuthRole } from '@solace-iot-team/apim-server-openapi-browser';
import { EUIDeveloperPortalResourcePaths, EUIAdminPortalResourcePaths, EUICommonResourcePaths } from "./Globals"

export const CAPSAuthRoleNone = '';

export type TAPRbacRole = {
  role: EAPSAuthRole,
  displayName: string,
  description: string,
  uiResourcePaths: Array<EUICommonResourcePaths | EUIAdminPortalResourcePaths | EUIDeveloperPortalResourcePaths>
}

export type TAPRbacRoleList = Array<TAPRbacRole>;

const rbacRoleList: TAPRbacRoleList = [
  {
    role: EAPSAuthRole.ROOT,
    displayName: 'Root',
    description: 'Root priviliges.',
    uiResourcePaths: [
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.ManageSystemUsers, 
      EUIAdminPortalResourcePaths.LoginAs,
      EUIAdminPortalResourcePaths.ManageSystemConfigConnectors,
      EUIAdminPortalResourcePaths.ManageSystemConfigSettings,
    ]
  },
  {
    role: EAPSAuthRole.LOGIN_AS,
    displayName: 'Login As',
    description: 'Login as any User.',
    uiResourcePaths: [
      EUIAdminPortalResourcePaths.LoginAs
    ]
  },
  {
    role: EAPSAuthRole.SYSTEM_ADMIN,
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
    role: EAPSAuthRole.ORGANIZATION_ADMIN,
    displayName: 'Organization Admin',
    description: 'Administrate the Organization.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.UserHome,
      EUIAdminPortalResourcePaths.ManageOrganizationUsers,
      EUIAdminPortalResourcePaths.ManageOrganizationEnvironments,
    ]
  },
  {
    role: EAPSAuthRole.API_TEAM,
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
    role: EAPSAuthRole.API_CONSUMER,
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

    Object.values(EAPSAuthRole).forEach( (apsRole: EAPSAuthRole) => {
      // console.log(`${logName}: apsRole=${apsRole}`);
      const found: TAPRbacRole | undefined = rbacRoleList.find( (apRbacRole: TAPRbacRole) => {
        // console.log(`${logName}: apsRole=${apsRole}, apRbacRole.role=${apRbacRole.role}`);
        return (apsRole === apRbacRole.role);
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
      return (apRbacRole.role === apsRole);
    });
    if (!found) throw new Error(`${logName}: EAPAuthRole in OpenApi spec not found in rbacRoleList: ${apsRole}`);
    return found;
  }

}