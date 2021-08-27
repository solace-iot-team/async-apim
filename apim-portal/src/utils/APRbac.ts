import { EAPSAuthRole } from '@solace-iot-team/apim-server-openapi-browser';
import { EUIResourcePaths } from "./Globals"

export const CAPSAuthRoleNone = '';

export type TAPRbacRole = {
  role: EAPSAuthRole,
  displayName: string,
  description: string,
  uiResourcePaths: Array<EUIResourcePaths>
}

export type TAPRbacRoleList = Array<TAPRbacRole>;

const rbacRoleList: TAPRbacRoleList = [
  {
    role: EAPSAuthRole.ROOT,
    displayName: 'Root',
    description: 'Root priviliges.',
    uiResourcePaths: [
      EUIResourcePaths.AdminPortal,
      EUIResourcePaths.ManageSystemUsers, 
      EUIResourcePaths.LoginAs
    ]
  },
  {
    role: EAPSAuthRole.LOGIN_AS,
    displayName: 'Login As',
    description: 'Login as any User.',
    uiResourcePaths: [
      EUIResourcePaths.LoginAs
    ]
  },
  {
    role: EAPSAuthRole.SYSTEM_ADMIN,
    displayName: 'System Admin',
    description: 'Administrate the System.',
    uiResourcePaths: [
      EUIResourcePaths.AdminPortal,
      EUIResourcePaths.ManageUserAccount,
      EUIResourcePaths.ManageSystemUsers,
      EUIResourcePaths.ManageSystemTeams,
      EUIResourcePaths.ManageSystemOrganizations,
      EUIResourcePaths.ManageSystemConfigConnectors,
      EUIResourcePaths.ManageSystemConfigSettings,
      EUIResourcePaths.MonitorSystemHealth,
    ]
  },
  {
    role: EAPSAuthRole.ORGANIZATION_ADMIN,
    displayName: 'Organization Admin',
    description: 'Administrate the Organization.',
    uiResourcePaths: [
      EUIResourcePaths.AdminPortal,
      EUIResourcePaths.ManageUserAccount,
      EUIResourcePaths.ManageOrganizationUsers,
      EUIResourcePaths.ManageOrganizationEnvironments,
    ]
  },
  {
    role: EAPSAuthRole.API_TEAM,
    displayName: 'API Team',
    description: 'Manage APIs, API Products, Apps, API Consumers.',
    uiResourcePaths: [
      EUIResourcePaths.AdminPortal,
      EUIResourcePaths.ManageUserAccount,
    ]
  },
  {
    role: EAPSAuthRole.API_CONSUMER,
    displayName: 'API Consumer',
    description: 'Consume APIs, manage individual and team Apps.',
    uiResourcePaths: [
      EUIResourcePaths.DeveloperPortal,
      EUIResourcePaths.ManageUserAccount,
      EUIResourcePaths.DeveloperPortalHome,
      EUIResourcePaths.DeveloperPortalViewProductCatalog,
      EUIResourcePaths.DeveloperPortalManageApplications
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