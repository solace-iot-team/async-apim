import { TAPEntityIdList } from '../utils/APEntityIdsService';
import { APRbac, TAPRbacRole } from '../utils/APRbac';
import { 
  APSBusinessGroupAuthRoleList,
  APSSystemAuthRoleList,
  EAPSBusinessGroupAuthRole,
  EAPSSystemAuthRole, 
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';

class APRbacDisplayService {
  private readonly BaseComponentName = "APRbacDisplayService";

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
