import APEntityIdsService, { TAPEntityIdList } from '../utils/APEntityIdsService';
import { 
  APRbac, 
  EAPRbacRoleScope, 
  EAPSCombinedAuthRole, 
  TAPRbacRole, 
  TAPRbacRoleList 
} from '../utils/APRbac';
import { 
  APSBusinessGroupAuthRoleList,
  APSOrganizationAuthRoleList,
  APSSystemAuthRoleList,
  EAPSBusinessGroupAuthRole,
  EAPSSystemAuthRole, 
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';

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

}

export default new APRbacDisplayService();
