import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from '../utils/APEntityIdsService';
import { 
  APRbac, 
  EAPRbacRoleScope, 
  EAPSCombinedAuthRole, 
  EAPSDefaultAuthRole, 
  TAPRbacRole, 
  TAPRbacRoleList 
} from '../utils/APRbac';
import { EUIAdminPortalResourcePaths, EUICombinedResourcePaths, Globals } from '../utils/Globals';
import { 
  APSBusinessGroupAuthRoleList,
  APSOrganizationAuthRoleList,
  APSSystemAuthRoleList,
  EAPSBusinessGroupAuthRole,
  EAPSOrganizationAuthRole,
  EAPSSystemAuthRole, 
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';
import { TAPLoginUserDisplay } from './APUsersDisplayService/APLoginUsersDisplayService';
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from './APUsersDisplayService/APOrganizationUsersDisplayService';
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayTreeNodeList, 
} from './APUsersDisplayService/APMemberOfService';
import { AuthHelper } from '../auth/AuthHelper';

class APRbacDisplayService {
  private readonly BaseComponentName = "APRbacDisplayService";
  private readonly businessGroupRbacRoleList: TAPRbacRoleList;
  private readonly businessGroupManageAssetsRbacRoleList: TAPRbacRoleList;

  constructor() {
    this.businessGroupRbacRoleList = this.create_Scoped_RbacRoleList([EAPRbacRoleScope.BUSINESS_GROUP]);
    this.businessGroupManageAssetsRbacRoleList = this.create_Scoped_RbacRoleList([EAPRbacRoleScope.BUSINESS_GROUP_MANAGE_ASSETS]);
  }

  public isAuthorized_To_ManageRecoveredAssets(authorizedResourcePathListString: string): boolean {
    return AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathListString, EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Recover);
  }

  public isAuthorized_To_ManageAllOrganizationApps(authorizedResourcePathListString: string): boolean {
    return AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathListString, EUIAdminPortalResourcePaths.ManageOrganizationApps_AllOrganizationApps);
  }

  private create_Scoped_RbacRoleList = (rbacScopeList: Array<EAPRbacRoleScope>): TAPRbacRoleList => {
    let rbacRoleList: TAPRbacRoleList = [];
    for(const rbacRole of APRbac.getAPRbacRoleList()) {
      if(!rbacRole.scopeList.includes(EAPRbacRoleScope.NEVER)) {
        for(const scope of rbacScopeList) {
          const exists = rbacRoleList.find( (role: TAPRbacRole) => {
            return role.id === rbacRole.id;
          });
          if(!exists && rbacRole.scopeList.includes(scope)) rbacRoleList.push(rbacRole);
        }
      } 
    }
    return rbacRoleList;    
  }

  public get_RoleDisplayName(apsRole: EAPSCombinedAuthRole): string {
    const rbacRole: TAPRbacRole = APRbac.getByRole(apsRole);
    return rbacRole.displayName;
  }

  public get_RoleEntityId(apsRole: EAPSCombinedAuthRole): TAPEntityId {
    const rbacRole: TAPRbacRole = APRbac.getByRole(apsRole);
    return {
      id: rbacRole.id,
      displayName: rbacRole.displayName,
    };
  }

  private create_Roles_SelectEntityIdList(rbacRoleList: TAPRbacRoleList): TAPEntityIdList {
    const entityIdList: TAPEntityIdList = rbacRoleList.map( (x) => {
      return {
        id: x.id,
        displayName: x.displayName
      };
    });
    return APEntityIdsService.sort_byDisplayName(entityIdList);
  }
  
  public create_SystemRoles_SelectEntityIdList(): TAPEntityIdList {
    const rbacRoleList: TAPRbacRoleList = this.create_Scoped_RbacRoleList([EAPRbacRoleScope.SYSTEM]);
    return this.create_Roles_SelectEntityIdList(rbacRoleList);
  }

  public create_SystemRoles_EntityIdList(apsSystemAuthRoleList?: APSSystemAuthRoleList): TAPEntityIdList {
    if(apsSystemAuthRoleList === undefined) return [];
    const entityIdList: TAPEntityIdList = [];
    apsSystemAuthRoleList.forEach( (apsSystemAuthRole: EAPSSystemAuthRole) => {
      const apRbacRole: TAPRbacRole = APRbac.getByRole(apsSystemAuthRole);
      entityIdList.push({
        id: apRbacRole.id,
        displayName: apRbacRole.displayName
      });
    });
    return entityIdList;
  }

  public create_OrganizationRoles_SelectEntityIdList(): TAPEntityIdList {
    const rbacRoleList: TAPRbacRoleList = this.create_Scoped_RbacRoleList([EAPRbacRoleScope.ORGANIZATION, EAPRbacRoleScope.BUSINESS_GROUP]);
    return this.create_Roles_SelectEntityIdList(rbacRoleList);
  }

  public create_OrganizationRoles_EntityIdList(apsOrganizationAuthRoleList: APSOrganizationAuthRoleList): TAPEntityIdList {
    const entityIdList: TAPEntityIdList = apsOrganizationAuthRoleList.map( (apsOrganizationAuthRole) => {
      const apRbacRole: TAPRbacRole = APRbac.getByRole(apsOrganizationAuthRole);
      return {
        id: apRbacRole.id,
        displayName: apRbacRole.displayName
      };
    });
    return entityIdList;
  }

  public create_BusinessGroupRoles_SelectEntityIdList(): TAPEntityIdList {
    const rbacRoleList: TAPRbacRoleList = this.create_Scoped_RbacRoleList([EAPRbacRoleScope.BUSINESS_GROUP]);
    return this.create_Roles_SelectEntityIdList(rbacRoleList);
  }

  public create_BusinessGroupRoles_EntityIdList({apsBusinessGroupAuthRoleList}: {
    apsBusinessGroupAuthRoleList: APSBusinessGroupAuthRoleList;
  }): TAPEntityIdList {
    const entityIdList: TAPEntityIdList = [];
    apsBusinessGroupAuthRoleList.forEach( (apsBusinessGroupAuthRole: EAPSBusinessGroupAuthRole) => {
      const apRbacRole: TAPRbacRole = APRbac.getByRole(apsBusinessGroupAuthRole);
      entityIdList.push({
        id: apRbacRole.id,
        displayName: apRbacRole.displayName
      });
    });
    return entityIdList;
  }

  public filter_RolesEntityIdList_By_BusinessGroupRoles({ combinedRoles }: {
    combinedRoles: TAPEntityIdList;
  }): TAPEntityIdList {
    const result: TAPEntityIdList = [];
    combinedRoles.forEach( (combinedRole: TAPEntityId) => {
      const isBusinessGroupRole = this.businessGroupRbacRoleList.find( (x) => {
        return x.id === combinedRole.id;
      })
      if(isBusinessGroupRole) result.push(combinedRole);
    });
    return result;
  }

  public filter_RolesEntityIdList_By_BusinessGroupRoles_ManageAssets({ combinedRoles }: {
    combinedRoles: TAPEntityIdList;
  }): TAPEntityIdList {
    const result: TAPEntityIdList = [];
    combinedRoles.forEach( (combinedRole: TAPEntityId) => {
      const isBusinessGroupRole = this.businessGroupManageAssetsRbacRoleList.find( (x) => {
        return x.id === combinedRole.id;
      })
      if(isBusinessGroupRole) result.push(combinedRole);
    });
    return result;
  }

  public includes_Role({ businessGroupRoleEntityIdList, role }:{
    businessGroupRoleEntityIdList: TAPEntityIdList;
    role: EAPSOrganizationAuthRole | EAPSBusinessGroupAuthRole;
  }): boolean {
    const idList = APEntityIdsService.create_IdList(businessGroupRoleEntityIdList);
    return idList.includes(role);
  }

  public async create_AuthorizedResourcePathListAsString({ apLoginUserDisplay, apOrganizationEntityId }:{
    apLoginUserDisplay: TAPLoginUserDisplay;
    apOrganizationEntityId: TAPEntityId | undefined;
  }): Promise<string> {
    const funcName = 'create_AuthorizedResourcePathListAsString';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const combinedUiResourcePathList: Array<EUICombinedResourcePaths> = this.create_Common_AuthorizedResourcePathListAsString({
      apLoginUserDisplay: apLoginUserDisplay,
    });

    // selected organization id if any
    if(apOrganizationEntityId !== undefined) {

      // get the Organization User to get the roles, the business groups and their roles
      const apOrganizationUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.apsGet_ApOrganizationUserDisplay({
        userId: apLoginUserDisplay.apEntityId.id,
        organizationEntityId: apOrganizationEntityId,
        fetch_ApOrganizationAssetInfoDisplayList: false,
      });
      if(apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined) throw new Error(`${logName}: apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined`);

      // unused legacy roles, keep as reference
      // const legcayOrganizationRoles: APSOrganizationAuthRoleList = APEntityIdsService.create_IdList(apOrganizationUserDisplay.memberOfOrganizationDisplay.apLegacyOrganizationRoleEntityIdList) as APSOrganizationAuthRoleList;
      // alert(`${logName}: legcayOrganizationRoles = \n${JSON.stringify(legcayOrganizationRoles, null, 2)}`);
      // const organizationRoles: APSOrganizationAuthRoleList = legcayOrganizationRoles.concat(APEntityIdsService.create_IdList(apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList) as APSOrganizationAuthRoleList);

      const organizationRoles: APSOrganizationAuthRoleList = APEntityIdsService.create_IdList(apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList) as APSOrganizationAuthRoleList;
      organizationRoles.forEach((role: EAPSOrganizationAuthRole) => {
        const apRbacRole: TAPRbacRole = APRbac.getByRole(role);
        combinedUiResourcePathList.push(...apRbacRole.uiResourcePaths);
      });

      const apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList = APMemberOfService.create_ApMemberOfBusinessGroupDisplayTreeNodeList({
        organizationEntityId: apOrganizationEntityId,
        apMemberOfBusinessGroupDisplayList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList,
        apOrganizationRoleEntityIdList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList,
        completeApOrganizationBusinessGroupDisplayList: apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList,
        // pruneBusinessGroupsNotAMemberOf: true,
        pruneBusinessGroupsNotAMemberOf: false,
        accessOnly_To_BusinessGroupManageAssets: false
      });

      // get the business group from last session or find a default one
      const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = APMemberOfService.get_ApMemberOfBusinessGroupDisplay_For_Session({
        apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
        apOrganizationSessionInfoDisplay: apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationSessionInfoDisplay,
        accessOnly_To_BusinessGroupManageAssets: false
      });
      // const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined= APMemberOfService.find_default_ApMemberOfBusinessGroupDisplay({
      //   apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
      // });
      if(apMemberOfBusinessGroupDisplay !== undefined) {
        // add the calculated roles, not the configured ones
        if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined`);
        const businessGroupRoles: APSBusinessGroupAuthRoleList = APEntityIdsService.create_IdList(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList) as APSBusinessGroupAuthRoleList;
        businessGroupRoles.forEach((role: EAPSBusinessGroupAuthRole) => {
          const apRbacRole: TAPRbacRole = APRbac.getByRole(role);
          combinedUiResourcePathList.push(...apRbacRole.uiResourcePaths);
        });
      }
    }

    if(combinedUiResourcePathList.length === 0) throw new Error(`${logName}: cannot find any uiResourcePaths for any of the user roles in rbac roles. \nuser==${JSON.stringify(apLoginUserDisplay, null, 2)}\npOrganizationEntityId=${apOrganizationEntityId}`);
    // de-dup resource paths
    const uniqueCombinedcResourcePathList: Array<EUICombinedResourcePaths> = Globals.deDuplicateStringList(combinedUiResourcePathList) as Array<EUICombinedResourcePaths>;
    // console.log(`${logName}: uniqueCombinedcResourcePathList = ${JSON.stringify(uniqueCombinedcResourcePathList)}`);
    return uniqueCombinedcResourcePathList.join(',');
  }
 
  private create_Common_AuthorizedResourcePathListAsString({ apLoginUserDisplay }: {
    apLoginUserDisplay: TAPLoginUserDisplay;
  }): Array<EUICombinedResourcePaths> {

    const combinedUiResourcePathList: Array<EUICombinedResourcePaths> = [];
    const systemRoles: APSSystemAuthRoleList = APEntityIdsService.create_IdList(apLoginUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList;

    // assign default roles to every user except ROOT
    if(!systemRoles.includes(EAPSSystemAuthRole.ROOT)) {
      const defaultRoles: Array<EAPSDefaultAuthRole> = [EAPSDefaultAuthRole.DEFAULT];
      for(const defaultRole of defaultRoles) {
        const apRbacRole: TAPRbacRole = APRbac.getByRole(defaultRole);
        combinedUiResourcePathList.push(...apRbacRole.uiResourcePaths);
      }
    }
    // system roles
    systemRoles.forEach((role: EAPSSystemAuthRole) => {
      const apRbacRole: TAPRbacRole = APRbac.getByRole(role);
      combinedUiResourcePathList.push(...apRbacRole.uiResourcePaths);
    });

    return combinedUiResourcePathList;
  }

  public create_AuthorizedResourcePathListAsString_For_BusinessGroupRoles({ apLoginUserDisplay, apBusinessGroupRoleEntityIdList }: {
    apLoginUserDisplay: TAPLoginUserDisplay;
    apBusinessGroupRoleEntityIdList: TAPEntityIdList;
  }): string {
    
    const combinedUiResourcePathList: Array<EUICombinedResourcePaths> = this.create_Common_AuthorizedResourcePathListAsString({
      apLoginUserDisplay: apLoginUserDisplay,
    });

    // business group roles
    const roleIdList: Array<EAPSCombinedAuthRole> = APEntityIdsService.create_IdList(apBusinessGroupRoleEntityIdList) as Array<EAPSCombinedAuthRole>;
    roleIdList.forEach((role: EAPSCombinedAuthRole) => {
      const apRbacRole: TAPRbacRole = APRbac.getByRole(role);
      combinedUiResourcePathList.push(...apRbacRole.uiResourcePaths);
    });
    // de-dup resource paths
    const uniqueCombinedcResourcePathList: Array<EUICombinedResourcePaths> = Globals.deDuplicateStringList(combinedUiResourcePathList) as Array<EUICombinedResourcePaths>;
    // console.log(`${logName}: uniqueCombinedcResourcePathList = ${JSON.stringify(uniqueCombinedcResourcePathList)}`);
    return uniqueCombinedcResourcePathList.join(',');
  }

  // ********************************************************************************************************************************
  // has Access & can Manage
  // ********************************************************************************************************************************

  public hasAccess_BusinessGroupRoleEntityIdList_ManageAppAccess_For_External_Apps = ({ businessGroupRoleEntityIdList }:{
    businessGroupRoleEntityIdList: TAPEntityIdList;
  }): boolean => {
    return this.includes_Role({
      businessGroupRoleEntityIdList: businessGroupRoleEntityIdList,
      role: EAPSOrganizationAuthRole.ORGANIZATION_ADMIN
    });
  }

  /**
   * Returns true if appOwnerId has the role of api consumer in the business group.
   * - Get the user (appOwnerId) details.
   * - Calculate appOwnerId roles in each business group
   * - check if appOwnerId is member of the business group
   * - check if appOwnerId has role of apiConsumer in business group
   */
  public canManage_UserApp_In_BusinessGroup = ({ organizationId, businessGroupId, apOrganizationUserDisplay }:{
    organizationId: string;
    businessGroupId: string;
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): boolean => {
    const funcName = 'hasUser_ApiConsumer_Role_In_BusinessGroup';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if(apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined) throw new Error(`${logName}: apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined`);

    // get the tree node list with calculated roles in each business group
    const apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList = APMemberOfService.create_ApMemberOfBusinessGroupDisplayTreeNodeList({
      organizationEntityId: { id: organizationId, displayName: organizationId },
      apMemberOfBusinessGroupDisplayList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList,
      apOrganizationRoleEntityIdList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList,
      completeApOrganizationBusinessGroupDisplayList: apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList,
      pruneBusinessGroupsNotAMemberOf: false,
      accessOnly_To_BusinessGroupManageAssets: false,
    });

    // get the business group details. discard if not found.
    try {
      const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = APMemberOfService.get_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
        apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
        businessGroupId: businessGroupId
      });
      if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined`);
      // check if appOwnerId has role = api consumer in business group
      const isApiConsumer: boolean = this.includes_Role({
        businessGroupRoleEntityIdList: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList,
        role: EAPSBusinessGroupAuthRole.API_CONSUMER
      }); 
      return isApiConsumer;
    } catch (e) {
      // business group not found or roles not calculated
      return false;
    }
  }


}

export default new APRbacDisplayService();
