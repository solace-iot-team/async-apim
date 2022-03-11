import { 
  APSOrganizationRoles, 
  APSOrganizationRolesList, 
  APSUserResponse, 
  ApsUsersService, 
 } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { TAPOrganizationUserDisplay } from "./APOrganizationUsersDisplayService";


export class APLegacyOrganizationRoles {
  private static ComponentName = 'APLegacyOrganizationRoles';

  public static async update_ApsOrganizationRolesList({ apOrganizationUserDisplay, update_ApsOrganizationRoles }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    update_ApsOrganizationRoles: APSOrganizationRoles;
  }): Promise<APSOrganizationRolesList> {
    // const funcName = 'update_ApsOrganizationRolesList';
    // const logName = `${APLegacyOrganizationRoles.ComponentName}.${funcName}()`;

    // get existing list
    const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
      userId: apOrganizationUserDisplay.apEntityId.id,
    });
    // create the new list excluding this org
    const newList: APSOrganizationRolesList = [];
    for(const apsOrganizationRolesResponse of apsUserResponse.memberOfOrganizations) {
      if(apsOrganizationRolesResponse.organizationId !== apOrganizationUserDisplay.organizationEntityId.id) {
        newList.push({
          organizationId: apsOrganizationRolesResponse.organizationId,
          roles: apsOrganizationRolesResponse.roles,
        });  
      }
    }
    // add this list
    newList.push(update_ApsOrganizationRoles)
    return newList;
  }
}
