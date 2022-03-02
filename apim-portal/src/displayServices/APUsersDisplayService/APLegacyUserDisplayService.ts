import { Globals } from "../../utils/Globals";
import { 
  APSOrganizationAuthRoleList,
  APSOrganizationRolesList, 
  APSUserResponse, 
  EAPSOrganizationAuthRole
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import APRbacDisplayService from "../APRbacDisplayService";
import { 
  TAPLegacyMemberOfOrganizationRolesDisplay, 
  TAPLegacyMemberOfOrganizationRolesDisplayList, 
  TAPMemberOfOrganizationGroupsDisplayList 
} from "../old.APUsersDisplayService";

export class APLegacyUserDisplayService {
  private static BaseComponentName = 'APLegacyUserDisplayService';

  public static create_ApLegacyMemberOfOrganizationRolesDisplayList({apsUserResponse}: {
    apsUserResponse: APSUserResponse;
  }): TAPLegacyMemberOfOrganizationRolesDisplayList {
    const list: TAPLegacyMemberOfOrganizationRolesDisplayList = [];
    if(apsUserResponse.memberOfOrganizations === undefined) return list;
    for(const apsOrganizationRolesResponse of apsUserResponse.memberOfOrganizations) {
      const elem: TAPLegacyMemberOfOrganizationRolesDisplay = {
        apEntityId: {
          id: apsOrganizationRolesResponse.organizationId,
          displayName: apsOrganizationRolesResponse.organizationDisplayName
        },
        apOrganizationAuthRoleEntityIdList: APRbacDisplayService.create_OrganizationRoles_EntityIdList(apsOrganizationRolesResponse.roles),
        apsOrganizationRolesResponse: apsOrganizationRolesResponse,
      };
      list.push(elem);
    }
    return list;
  }

  public static create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList({apMemberOfOrganizationGroupsDisplayList}:{
    apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList;
  }): APSOrganizationRolesList {
    const funcName = 'create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList';
    const logName = `${APLegacyUserDisplayService.BaseComponentName}.${funcName}()`;

    const list: APSOrganizationRolesList = [];
    for(const apMemberOfOrganizationGroupsDisplay of apMemberOfOrganizationGroupsDisplayList) {
      const organizationId = apMemberOfOrganizationGroupsDisplay.apEntityId.id;
      const combinedOrganizationAuthRolesList: APSOrganizationAuthRoleList = [];
      for(const apMemberOfBusinessGroupDisplay of apMemberOfOrganizationGroupsDisplay.apMemberOfBusinessGroupDisplayList) {
        // add them alll up 
        const rolesIdList: APSOrganizationAuthRoleList = apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.map( (x) => {
          return x.id as EAPSOrganizationAuthRole;
        });
        combinedOrganizationAuthRolesList.push(...rolesIdList);
      }
      // de-dup list
      const organizationAuthRolesList: APSOrganizationAuthRoleList = Globals.deDuplicateStringList(combinedOrganizationAuthRolesList) as APSOrganizationAuthRoleList;
      list.push({
        organizationId: organizationId,
        roles: organizationAuthRolesList
      });
    }
    return list;
  }

  public static find_LegacyMemberOfOrganizationRolesDisplay({organizationId, apLegacyMemberOfOrganizationRolesDisplayList}: {
    organizationId: string;
    apLegacyMemberOfOrganizationRolesDisplayList: TAPLegacyMemberOfOrganizationRolesDisplayList;
  }): TAPLegacyMemberOfOrganizationRolesDisplay {
    const funcName = 'find_LegacyMemberOfOrganizationRolesDisplay';
    const logName = `${APLegacyUserDisplayService.BaseComponentName}.${funcName}()`;

    const found = apLegacyMemberOfOrganizationRolesDisplayList.find( (x) => {
      return x.apEntityId.id === organizationId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found;
  }
}
