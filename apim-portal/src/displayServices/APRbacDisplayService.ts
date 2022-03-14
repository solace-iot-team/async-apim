import APEntityIdsService, { TAPEntityIdList } from '../utils/APEntityIdsService';
import { 
  APRbac, 
  EAPRbacRoleScope, 
  EAPSCombinedAuthRole, 
  EAPSDefaultAuthRole, 
  TAPRbacRole, 
  TAPRbacRoleList 
} from '../utils/APRbac';
import { EUICombinedResourcePaths, Globals } from '../utils/Globals';
import { 
  APSBusinessGroupAuthRoleList,
  APSOrganizationAuthRoleList,
  APSSystemAuthRoleList,
  EAPSBusinessGroupAuthRole,
  EAPSOrganizationAuthRole,
  EAPSSystemAuthRole, 
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';
import { TAPLoginUserDisplay } from './APUsersDisplayService/APLoginUsersDisplayService';
import APMemberOfService, { TAPMemberOfOrganizationDisplay } from './APUsersDisplayService/APMemberOfService';

class APRbacDisplayService {
  private readonly BaseComponentName = "APRbacDisplayService";

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
    apsBusinessGroupAuthRoleList: APSBusinessGroupAuthRoleList
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

  public async create_AuthorizedResourcePathListAsString({ apLoginUserDisplay, organizationId }:{
    apLoginUserDisplay: TAPLoginUserDisplay;
    organizationId: string | undefined;
  }): Promise<string> {
    const funcName = 'create_AuthorizedResourcePathListAsString';
    const logName = `${this.BaseComponentName}.${funcName}()`;

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

    // selected organization id if any
    if(organizationId !== undefined) {
      const apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay = APMemberOfService.get_ApMemberOfOrganizationDisplay({
        apMemberOfOrganizationDisplayList: apLoginUserDisplay.apMemberOfOrganizationDisplayList,
        organizationId: organizationId,
      });
      const legcayOrganizationRoles: APSOrganizationAuthRoleList = APEntityIdsService.create_IdList(apMemberOfOrganizationDisplay.apLegacyOrganizationRoleEntityIdList) as APSOrganizationAuthRoleList;
      const organizationRoles: APSOrganizationAuthRoleList = legcayOrganizationRoles.concat(APEntityIdsService.create_IdList(apMemberOfOrganizationDisplay.apOrganizationRoleEntityIdList) as APSOrganizationAuthRoleList);
      organizationRoles.forEach((role: EAPSOrganizationAuthRole) => {
        const apRbacRole: TAPRbacRole = APRbac.getByRole(role);
        combinedUiResourcePathList.push(...apRbacRole.uiResourcePaths);
      });
      // get the businessGroupId from last session in the organization (default to first one memberOf if not available)
      // get the calculated roles of that businessGroupId 
      alert(`${logName}: todo: add business group roles`);
    }

    if(combinedUiResourcePathList.length === 0) throw new Error(`${logName}: cannot find any uiResourcePaths for any of the user roles in rbac roles. \nuser==${JSON.stringify(apLoginUserDisplay, null, 2)}\norganizationId=${organizationId}`);
    // de-dup resource paths
    const uniqueCombinedcResourcePathList: Array<EUICombinedResourcePaths> = Globals.deDuplicateStringList(combinedUiResourcePathList) as Array<EUICombinedResourcePaths>;
    // console.log(`${logName}: uniqueCombinedcResourcePathList = ${JSON.stringify(uniqueCombinedcResourcePathList)}`);
    return uniqueCombinedcResourcePathList.join(',');
  }
    
    
    // if(configContext.rbacRoleList === undefined) return CAPSAuthRoleNone;
    // const apsUser: APSUser = userContext.user;

    // const combinedUiResourcePathList: Array<EUICombinedResourcePaths> = [];
    // const systemRoles: APSSystemAuthRoleList = apsUser.systemRoles ? apsUser.systemRoles : [];

    // // assign default roles to every user except ROOT
    // if(!systemRoles.includes(EAPSSystemAuthRole.ROOT)) {
    //   const defaultRoles: Array<EAPSDefaultAuthRole> = [EAPSDefaultAuthRole.DEFAULT];
    //   for(const defaultRole of defaultRoles) {
    //     const rbacRole: TAPRbacRole | undefined = configContext.rbacRoleList?.find((rbacRole: TAPRbacRole) => {
    //       return (rbacRole.id === defaultRole)
    //     });
    //     if(rbacRole === undefined) throw new Error(`${logName}: cannot find defaultRole=${defaultRole} in rbac roles=${JSON.stringify(configContext.rbacRoleList, null, 2)}`);
    //     combinedUiResourcePathList.push(...rbacRole.uiResourcePaths);
    //   }
    // }

    // let organizationRoles: APSOrganizationAuthRoleList = [];
    // if(userContext.runtimeSettings.currentOrganizationEntityId !== undefined) {
    //   const found = apsUser.memberOfOrganizations?.find((memberOfOrganization: APSOrganizationRoles) => {
    //     return (memberOfOrganization.organizationId === userContext.runtimeSettings.currentOrganizationEntityId?.id)
    //   });
    //   if(!found) throw new Error(`${logName}: cannot find userContext.runtimeSettings.currentOrganizationEntityId.id=${userContext.runtimeSettings.currentOrganizationEntityId.id} in apsUser.memberOfOrganizations=${JSON.stringify(apsUser.memberOfOrganizations, null, 2)}`);
    //   organizationRoles = found.roles;
    // }
    // if(systemRoles.length === 0 && organizationRoles.length ===0) return CAPSAuthRoleNone;
    
    // systemRoles.forEach((systemRole: EAPSSystemAuthRole) => {
    //   const rbacRole: TAPRbacRole | undefined = configContext.rbacRoleList?.find((rbacRole: TAPRbacRole) => {
    //     return (rbacRole.id === systemRole)  
    //   });
    //   if(rbacRole === undefined) throw new Error(`${logName}: cannot find systemRole=${systemRole} in rbac roles=${JSON.stringify(configContext.rbacRoleList, null, 2)}`);
    //   combinedUiResourcePathList.push(...rbacRole.uiResourcePaths);
    // });

    // for(const orgRole of organizationRoles) {
    //   const rbacRole: TAPRbacRole | undefined = configContext.rbacRoleList?.find((rbacRole: TAPRbacRole) => {
    //     return (rbacRole.id === orgRole)  
    //   });
    //   if(rbacRole === undefined) throw new Error(`${logName}: cannot find orgRole=${orgRole} in rbac roles=${JSON.stringify(configContext.rbacRoleList, null, 2)}`);
    //   combinedUiResourcePathList.push(...rbacRole.uiResourcePaths);  
    // }      
  //   if(combinedUiResourcePathList.length === 0) throw new Error(`${logName}: cannot find any uiResourcePaths for any of the user roles=${JSON.stringify(apsUser, null, 2)} in rbac roles`);
  //   // de-dup resource paths
  //   const uniqueCombinedcResourcePathList: Array<EUICombinedResourcePaths> = Globals.deDuplicateStringList(combinedUiResourcePathList) as Array<EUICombinedResourcePaths>;
  //   // console.log(`${logName}: uniqueCombinedcResourcePathList = ${JSON.stringify(uniqueCombinedcResourcePathList)}`);
  //   return uniqueCombinedcResourcePathList.join(',');
  // }


  
}

export default new APRbacDisplayService();
