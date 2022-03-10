import { Globals } from "../../utils/Globals";
import { 
  APSOrganizationAuthRoleList, 
  APSOrganizationRoles, 
  APSOrganizationRolesList, 
  APSUserResponse, 
  ApsUsersService, 
  EAPSOrganizationAuthRole
 } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { TAPOrganizationUserDisplay } from "./APOrganizationUsersDisplayService";


export class APLegacyOrganizationRoles {
  private static ComponentName = 'APLegacyOrganizationRoles';

  public static async update_ApsOrganizationRolesList({ apOrganizationUserDisplay, update_ApsOrganizationRoles }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    update_ApsOrganizationRoles: APSOrganizationRoles;
  }): Promise<APSOrganizationRolesList> {
    const funcName = 'update_ApsOrganizationRolesList';
    const logName = `${APLegacyOrganizationRoles.ComponentName}.${funcName}()`;

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

  // public static async create_legacy_apsOrganizationRolesList({ apOrganizationUserDisplay }:{
  //   apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  // }): Promise<APSOrganizationRolesList> {
  //   const funcName = 'create_legacy_apsOrganizationRolesList';
  //   const logName = `${APLegacyOrganizationRoles.ComponentName}.${funcName}()`;

  //   // get all the orgs & roles
  //   const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
  //     userId: apOrganizationUserDisplay.apEntityId.id,
  //   });
  //   // create the new list excluding this org
  //   const newList: APSOrganizationRolesList = [];
  //   for(const apsOrganizationRolesResponse of apsUserResponse.memberOfOrganizations) {
  //     if(apsOrganizationRolesResponse.organizationId !== apOrganizationUserDisplay.organizationEntityId.id) {
  //       newList.push({
  //         organizationId: apsOrganizationRolesResponse.organizationId,
  //         roles: apsOrganizationRolesResponse.roles,
  //       });  
  //     }
  //   }

  //   const thisOrg_Combinedlist: APSOrganizationAuthRoleList = [];
  //   // walk through all business groups and add up all roles
  //   for(const apMemberOfOrganizationGroupsDisplay of apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList) {
  //     const rolesIdList: APSOrganizationAuthRoleList = apMemberOfOrganizationGroupsDisplay.apConfiguredBusinessGroupRoleEntityIdList.map( (x) => {
  //         return x.id as EAPSOrganizationAuthRole;
  //     });
  //     thisOrg_Combinedlist.push(...rolesIdList);
  //   }
  //   // de-dup list
  //   const newOrganizationAuthRolesList: APSOrganizationAuthRoleList = Globals.deDuplicateStringList(thisOrg_Combinedlist) as APSOrganizationAuthRoleList;
  //   // add to newList
  //   newList.push({
  //     organizationId: apOrganizationUserDisplay.organizationEntityId.id,
  //     roles: newOrganizationAuthRolesList
  //   });
  //   return newList;
  // }

}
