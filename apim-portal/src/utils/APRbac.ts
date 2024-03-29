import { 
  EAPSSystemAuthRole,
  EAPSOrganizationAuthRole,
  EAPSBusinessGroupAuthRole,
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { EUIDeveloperPortalResourcePaths, EUIAdminPortalResourcePaths, EUICommonResourcePaths } from "./Globals"

export const CAPSAuthRoleNone = '';

export enum EAPSDefaultAuthRole {
  DEFAULT = 'default',
}
export type EAPSCombinedAuthRole = EAPSDefaultAuthRole | EAPSSystemAuthRole | EAPSOrganizationAuthRole | EAPSBusinessGroupAuthRole;

export enum  EAPRbacRoleScope {
  NEVER = "NEVER",
  SYSTEM = "SYSTEM",
  ORGANIZATION = "ORGANIZATION",
  BUSINESS_GROUP = "BUSINESS_GROUP",
  BUSINESS_GROUP_MANAGE_ASSETS = "BUSINESS_GROUP_MANAGE_ASSETS"
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
  // {
  //   id: EAPSSystemAuthRole.LOGIN_AS,
  //   scopeList: [EAPRbacRoleScope.SYSTEM, EAPRbacRoleScope.ORGANIZATION],
  //   displayName: 'Login As',
  //   description: 'Login as any User.',
  //   uiResourcePaths: [
  //     EUIAdminPortalResourcePaths.LoginAs
  //   ]
  // },
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
      EUIAdminPortalResourcePaths.ManageSystemOrganizations,
      EUIAdminPortalResourcePaths.ManageSystemConfigConnectors,
      EUIAdminPortalResourcePaths.ManageSystemConfigSettings,
      EUIAdminPortalResourcePaths.MonitorSystemHealth,
    ]
  },
  {
    id: EAPSOrganizationAuthRole.ORGANIZATION_ADMIN,
    scopeList: [EAPRbacRoleScope.ORGANIZATION],
    displayName: 'Organization Admin',
    description: 'Administrate the Organization.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.UserHome,
      EUIAdminPortalResourcePaths.ManageOrganizationEnvironments,
      EUIAdminPortalResourcePaths.ManageOrganizationUsers,
      EUIAdminPortalResourcePaths.ManageOrganizationBusinessGroups,
      EUIAdminPortalResourcePaths.ManageOrganizationSettings,
      EUIAdminPortalResourcePaths.MonitorOrganizationStatus,      
      EUIAdminPortalResourcePaths.MonitorOrganizationJobs,      
      EUIAdminPortalResourcePaths.ManageOrganizationIntegration,
      EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems,
      // asset maintenance
      EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenance,
      EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApiProducts,
      EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApis,
      // api products
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Edit,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_View,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Delete,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Recover,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Edit_OwningBusinessGroup,
      // apis
      EUIAdminPortalResourcePaths.ManageOrganizationApis_Edit,
      EUIAdminPortalResourcePaths.ManageOrganizationApis_View,
      EUIAdminPortalResourcePaths.ManageOrganizationApis_Delete,
      EUIAdminPortalResourcePaths.ManageOrganizationApis_Recover,
      EUIAdminPortalResourcePaths.ManageOrganizationApis_Edit_OwningBusinessGroup,
      // apps
      EUIAdminPortalResourcePaths.ManageOrganizationApps_AllOrganizationApps,
    ]
  },
  {
    id: EAPSOrganizationAuthRole.BUSINESS_GROUP_ADMIN,
    scopeList: [EAPRbacRoleScope.BUSINESS_GROUP],
    displayName: 'Business Group Admin',
    description: 'Manage Business Group.',
    uiResourcePaths: [
      EUIAdminPortalResourcePaths.ManageBusinessGroup,
    ]
  },
  {
    id: EAPSOrganizationAuthRole.API_TEAM,
    scopeList: [EAPRbacRoleScope.BUSINESS_GROUP, EAPRbacRoleScope.BUSINESS_GROUP_MANAGE_ASSETS],
    displayName: 'API Team',
    description: 'Manage APIs, API Products, Apps, API Consumers.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIAdminPortalResourcePaths.Home,
      EUIAdminPortalResourcePaths.UserHome,
      // api products
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Edit,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_View,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Delete,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Recover,
      EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Edit_OwningBusinessGroup,
      // apis
      EUIAdminPortalResourcePaths.ManageOrganizationApis,
      EUIAdminPortalResourcePaths.ManageOrganizationApis_Edit,
      EUIAdminPortalResourcePaths.ManageOrganizationApis_View,
      EUIAdminPortalResourcePaths.ManageOrganizationApis_Delete,
      EUIAdminPortalResourcePaths.ManageOrganizationApis_Recover,
      EUIAdminPortalResourcePaths.ManageOrganizationApis_Edit_OwningBusinessGroup,
      // apps
      EUIAdminPortalResourcePaths.ManageOrganizationApps,
    ]
  },
  {
    id: EAPSOrganizationAuthRole.API_CONSUMER,
    scopeList: [EAPRbacRoleScope.BUSINESS_GROUP],
    displayName: 'API Consumer',
    description: 'Consume APIs, manage Individual and Business Group Apps.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIDeveloperPortalResourcePaths.Home,
      EUIDeveloperPortalResourcePaths.UserHome,
      EUIDeveloperPortalResourcePaths.ExploreApis,
      EUIDeveloperPortalResourcePaths.ExploreApiProducts,
      EUIDeveloperPortalResourcePaths.ManageUserApplications,
      EUIDeveloperPortalResourcePaths.ManageBusinessGroupApplications,
    ]
  },
  {
    id: EAPSOrganizationAuthRole.API_VIEWER,
    scopeList: [EAPRbacRoleScope.BUSINESS_GROUP],
    displayName: 'API Viewer',
    description: 'View APIs and Business Group Apps.',
    uiResourcePaths: [
      EUICommonResourcePaths.ManageUserAccount,
      EUIDeveloperPortalResourcePaths.Home,
      EUIDeveloperPortalResourcePaths.UserHome,
      EUIDeveloperPortalResourcePaths.ExploreApis,
      EUIDeveloperPortalResourcePaths.ExploreApiProducts,
      // not sure if they should be able to see apps, probably not
      // EUIDeveloperPortalResourcePaths.ViewBusinessGroupApplications,
    ]
  }

];


export class APRbac {

  public static checkRoleDefinitions = () => {
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