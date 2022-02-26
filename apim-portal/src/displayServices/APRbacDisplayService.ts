import APEntityIdsService, { TAPEntityIdList } from '../utils/APEntityIdsService';
import { APRbac, EAPRbacRoleScope, EAPSCombinedAuthRole, TAPRbacRole, TAPRbacRoleList } from '../utils/APRbac';
import { 
  APSBusinessGroupAuthRoleList,
  APSSystemAuthRoleList,
  EAPSBusinessGroupAuthRole,
  EAPSSystemAuthRole, 
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';

class APRbacDisplayService {
  private readonly BaseComponentName = "APRbacDisplayService";

  private get_Scoped_RbacRoleList = (rbacScopeList: Array<EAPRbacRoleScope>): TAPRbacRoleList => {
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

  private get_RolesSelect_EntityIdList(rbacRoleList: TAPRbacRoleList): TAPEntityIdList {
    const entityIdList: TAPEntityIdList = rbacRoleList.map( (x) => {
      return {
        id: x.id,
        displayName: x.displayName
      };
    });
    return APEntityIdsService.sort_byDisplayName(entityIdList);
  }
  
  public get_SystemRolesSelect_EntityIdList(): TAPEntityIdList {
    const rbacRoleList: TAPRbacRoleList = this.get_Scoped_RbacRoleList([EAPRbacRoleScope.SYSTEM]);
    return this.get_RolesSelect_EntityIdList(rbacRoleList);
  }

  public get_RoleDisplayName(apsRole: EAPSCombinedAuthRole): string {
    const rbacRole: TAPRbacRole = APRbac.getByRole(apsRole);
    return rbacRole.displayName;
  }

  public getSystemRolesEntityIdList(apsSystemAuthRoleList?: APSSystemAuthRoleList): TAPEntityIdList {
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

  public get_BusinessGroupRolesSelect_EntityIdList(): TAPEntityIdList {
    const rbacRoleList: TAPRbacRoleList = this.get_Scoped_RbacRoleList([EAPRbacRoleScope.ORG]);
    return this.get_RolesSelect_EntityIdList(rbacRoleList);
  }

  public getBusinessGroupRolesEntityIdList(apsBusinessGroupAuthRoleList: APSBusinessGroupAuthRoleList): TAPEntityIdList {
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
